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

const socketPath = "/socket.io";

const useRealtime = () => {
  const queryClient = useQueryClient();
  const versionsRef = useRef(new Map<string, number>());

  useEffect(() => {
    const socket = io(window.location.origin, {
      autoConnect: false,
      path: socketPath,
      transports: ["websocket"],
    });
    const acceptEvent = (event: RealtimeEvent<unknown>) => {
      const currentVersion = versionsRef.current.get(event.resourceId) ?? 0;
      if (event.version <= currentVersion) return false;
      versionsRef.current.set(event.resourceId, event.version);
      return true;
    };
    const handleNftUpdated = (event: RealtimeEvent<Nft>) => {
      if (!acceptEvent(event)) return;
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
      queryClient.setQueryData<Cart>(queryKeys.cart, (cart) =>
        cart
          ? {
              ...cart,
              quote: null,
              version: cart.version + 1,
              items: cart.items.map((item) =>
                item.nft.id === event.resourceId
                  ? {
                      ...item,
                      nft: event.data,
                      itemVersion: event.data.version,
                      unitPriceEth: event.data.priceEth,
                    }
                  : item,
              ),
            }
          : cart,
      );
    };
    const handleOrderUpdated = (event: RealtimeEvent<Order>) => {
      if (!acceptEvent(event)) return;
      queryClient.setQueryData(queryKeys.order(event.resourceId), event.data);
    };
    const reconcile = () => {
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    };

    socket.on("nft.updated", handleNftUpdated);
    socket.on("order.updated", handleOrderUpdated);
    socket.on("connect", reconcile);
    socket.connect();

    return () => {
      socket.off("nft.updated", handleNftUpdated);
      socket.off("order.updated", handleOrderUpdated);
      socket.off("connect", reconcile);
      socket.disconnect();
    };
  }, [queryClient]);
};

export { useRealtime };