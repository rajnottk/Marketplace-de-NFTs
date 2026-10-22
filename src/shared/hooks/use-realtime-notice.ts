import { useSyncExternalStore } from "react";
import {
  getRealtimeNotice,
  subscribeToRealtimeNotices,
} from "shared/lib/realtime-notices";

export const useRealtimeNotice = () =>
  useSyncExternalStore(
    subscribeToRealtimeNotices,
    getRealtimeNotice,
    () => null,
  );