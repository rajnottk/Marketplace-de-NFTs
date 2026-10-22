import type { Nft, Order, RealtimeEvent } from "shared/contracts/marketplace";

// In-memory pub/sub between the mock database and the mocked Socket.IO connections.
// The database publishes after committing a change, so REST responses and events always describe the same state.

export type RealtimeEventName = "nft.updated" | "order.updated";

interface RealtimeSubscriber {
  // Owner (user id) currently identified on this connection, or "guest".
  getOwnerId: () => string;
  send: (eventName: RealtimeEventName, event: RealtimeEvent<unknown>) => void;
}

const subscribers = new Set<RealtimeSubscriber>();

export const subscribeToRealtime = (subscriber: RealtimeSubscriber) => {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
};

const createEvent = <TPayload>(
  resourceType: RealtimeEvent<TPayload>["resourceType"],
  resourceId: string,
  version: number,
  data: TPayload,
): RealtimeEvent<TPayload> => ({
  eventId: crypto.randomUUID(),
  resourceId,
  resourceType,
  version,
  occurredAt: new Date().toISOString(),
  data,
});

// Delivered NFT events per resource, so a scenario can redeliver a duplicate or an older event.
const nftEventHistory = new Map<string, RealtimeEvent<Nft>[]>();

const deliverNftEvent = (event: RealtimeEvent<Nft>) =>
  subscribers.forEach((subscriber) => subscriber.send("nft.updated", event));

// Catalog data is public: every connection receives NFT updates.
export const publishNftUpdated = (nft: Nft) => {
  const event = createEvent("nft", nft.id, nft.version, nft);
  nftEventHistory.set(nft.id, [...(nftEventHistory.get(nft.id) ?? []), event]);
  deliverNftEvent(event);
};

// Scenario action: deliver again the latest event (duplicate) or the one before it (old version), unchanged.
export const redeliverNftEvent = (
  nftId: string,
  which: "latest" | "previous",
) => {
  const history = nftEventHistory.get(nftId) ?? [];
  const event = which === "latest" ? history.at(-1) : history.at(-2);
  if (event) deliverNftEvent(event);
  return Boolean(event);
};

// Orders are private: only connections identified as the order owner receive the update.
export const publishOrderUpdated = (ownerId: string, order: Order) => {
  const event = createEvent("order", order.id, order.version, order);
  subscribers.forEach((subscriber) => {
    if (subscriber.getOwnerId() === ownerId)
      subscriber.send("order.updated", event);
  });
};