// Tiny external store for accessible real-time notices (e.g. "the price of an NFT in your cart changed").

export interface RealtimeNotice {
  id: string;
  message: string;
}

let currentNotice: RealtimeNotice | null = null;
const listeners = new Set<() => void>();

export const getRealtimeNotice = () => currentNotice;

export const showRealtimeNotice = (message: string) => {
  currentNotice = { id: crypto.randomUUID(), message };
  listeners.forEach((listener) => listener());
};

export const dismissRealtimeNotice = () => {
  currentNotice = null;
  listeners.forEach((listener) => listener());
};

export const subscribeToRealtimeNotices = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};