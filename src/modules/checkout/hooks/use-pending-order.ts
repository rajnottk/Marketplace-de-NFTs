import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getOrder, queryKeys } from "shared/api/marketplace.api";
import type { Order } from "shared/contracts/marketplace";

// A pending payment survives a refresh or a dropped connection: its id is kept per user and the order is followed
// through the order query (updated by `order.updated` socket events and by REST reconciliation on reconnect).
const pendingOrderStorageKey = "kurio.pending-order";

interface TrackedPendingOrder {
  orderId: string;
  userId: string;
  walletLabel: string;
}

const readTrackedPendingOrder = (): TrackedPendingOrder | null => {
  try {
    const rawValue = window.localStorage.getItem(pendingOrderStorageKey);
    return rawValue ? (JSON.parse(rawValue) as TrackedPendingOrder) : null;
  } catch {
    return null;
  }
};

export const usePendingOrder = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [trackedOrder, setTrackedOrder] = useState(readTrackedPendingOrder);
  // Another user's pending order is never followed on this session.
  const activeOrder =
    trackedOrder && trackedOrder.userId === userId ? trackedOrder : null;
  const orderQuery = useQuery({
    queryKey: queryKeys.order(activeOrder?.orderId ?? "none"),
    queryFn: () => getOrder(activeOrder!.orderId),
    enabled: Boolean(activeOrder),
  });

  const trackPendingOrder = (order: Order, walletLabel: string) => {
    if (!userId) return;
    const nextTrackedOrder = { orderId: order.id, userId, walletLabel };
    window.localStorage.setItem(
      pendingOrderStorageKey,
      JSON.stringify(nextTrackedOrder),
    );
    queryClient.setQueryData(queryKeys.order(order.id), order);
    setTrackedOrder(nextTrackedOrder);
  };

  const clearPendingOrder = () => {
    window.localStorage.removeItem(pendingOrderStorageKey);
    setTrackedOrder(null);
  };

  return {
    pendingOrder: activeOrder ? (orderQuery.data ?? null) : null,
    pendingWalletLabel: activeOrder?.walletLabel ?? "",
    isTrackingPendingOrder: Boolean(activeOrder),
    trackPendingOrder,
    clearPendingOrder,
  };
};