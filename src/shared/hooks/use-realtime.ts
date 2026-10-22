import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type {
  Cart,
  CatalogResponse,
  Nft,
  Order,
  RealtimeEvent,
} from "shared/contracts/marketplace";
import { queryKeys } from "shared/api/marketplace.api";
import { useSession } from "shared/hooks/use-session";
import { formatEthShort } from "shared/lib/money";
import { showRealtimeNotice } from "shared/lib/realtime-notices";

const socketPath = "/socket.io";

// One Socket.IO connection per session: switching users reconnects, so events of the previous session can never
// update the new user's data. On every (re)connection the active resources are reconciled through REST.
const useRealtime = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const sessionToken = session?.sessionToken ?? null;
  const versionsRef = useRef(new Map<string, number>());

  useEffect(() => {
    versionsRef.current = new Map();
    const socket = io(window.location.origin, {
      autoConnect: false,
      path: socketPath,
      transports: ["websocket"],
    });

    // Accept an event only if it is newer than both the last event seen and the version already cached from REST,
    // so duplicates and late events never regress fresher data.
    const acceptEvent = (event: RealtimeEvent<unknown>, cachedVersion = 0) => {
      const lastSeenVersion = versionsRef.current.get(event.resourceId) ?? 0;
      if (event.version <= Math.max(lastSeenVersion, cachedVersion))
        return false;
      versionsRef.current.set(event.resourceId, event.version);
      return true;
    };
    const getCachedNftVersion = (nftId: string) => {
      const detailVersion =
        queryClient.getQueryData<Nft>(queryKeys.nft(nftId))?.version ?? 0;
      const catalogVersions = queryClient
        .getQueriesData<CatalogResponse>({ queryKey: ["catalog"] })
        .flatMap(
          ([, catalog]) =>
            catalog?.items
              .filter((nft) => nft.id === nftId)
              .map((nft) => nft.version) ?? [],
        );
      const cartVersion =
        queryClient
          .getQueryData<Cart>(queryKeys.cart)
          ?.items.find((item) => item.nft.id === nftId)?.nft.version ?? 0;
      return Math.max(detailVersion, cartVersion, ...catalogVersions);
    };

    const handleNftUpdated = (event: RealtimeEvent<Nft>) => {
      if (!acceptEvent(event, getCachedNftVersion(event.resourceId))) return;
      queryClient.setQueriesData<CatalogResponse>(
        { queryKey: ["catalog"] },
        (catalog) =>
          catalog
            ? {
                ...catalog,
                items: catalog.items.map((nft) =>
                  nft.id === event.resourceId ? event.data : nft,
                ),
              }
            : catalog,
      );
      queryClient.setQueryData(queryKeys.nft(event.resourceId), event.data);
      // Cart prices, version and quote belong to the server: only refresh the embedded NFT, then refetch the cart.
      const cart = queryClient.getQueryData<Cart>(queryKeys.cart);
      const cartItem = cart?.items.find(
        (item) => item.nft.id === event.resourceId,
      );
      if (cart && cartItem) {
        queryClient.setQueryData<Cart>(queryKeys.cart, {
          ...cart,
          items: cart.items.map((item) =>
            item.nft.id === event.resourceId
              ? { ...item, nft: event.data }
              : item,
          ),
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        if (event.data.available === 0)
          showRealtimeNotice(
            `${event.data.name} esgotou. Revise o seu carrinho.`,
          );
        else if (event.data.priceEth !== cartItem.unitPriceEth)
          showRealtimeNotice(
            `O preço de ${event.data.name} mudou para ${formatEthShort(event.data.priceEth)}. O resumo foi atualizado.`,
          );
      }
    };
    const handleOrderUpdated = (event: RealtimeEvent<Order>) => {
      if (
        !acceptEvent(
          event,
          queryClient.getQueryData<Order>(queryKeys.order(event.resourceId))
            ?.version,
        )
      )
        return;
      queryClient.setQueryData(queryKeys.order(event.resourceId), event.data);
      // A confirmation removes the purchased items server-side.
      if (event.data.status === "confirmed")
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    };
    const handleConnect = () => {
      // The server only delivers private events (orders) to the identified owner of this session.
      socket.emit("session:subscribe", sessionToken);
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["nft"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
    };

    socket.on("nft.updated", handleNftUpdated);
    socket.on("order.updated", handleOrderUpdated);
    socket.on("connect", handleConnect);
    socket.connect();

    return () => {
      socket.off("nft.updated", handleNftUpdated);
      socket.off("order.updated", handleOrderUpdated);
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, [queryClient, sessionToken]);
};

export { useRealtime };