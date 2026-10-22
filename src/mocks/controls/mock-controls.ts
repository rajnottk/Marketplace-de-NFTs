import {
  changeNftPrice,
  confirmAllPendingOrders,
  expireAllSessions,
  listNftOptions,
  markNftSoldOut,
  resetMockState,
} from "mocks/mock-database";
import { redeliverNftEvent } from "mocks/realtime/event-bus";
import {
  dropRealtime,
  isRealtimeConnected,
  restoreRealtime,
} from "mocks/realtime/socket-handlers";
import {
  getMockScenario,
  resetMockScenario,
  setMockScenario,
  type MockScenario,
} from "mocks/scenarios";

// Client-side state that belongs to the demo session and must go away on a full reset.
const appStorageKeys = ["kurio.session-token", "kurio.pending-order"];

// Single control surface for the mock scenarios: used by the Playwright tests and available as `window.kurioMocks`
// in the browser console whenever the mocks are enabled.
export const mockControls = {
  getScenario: getMockScenario,
  setScenario: (changes: Partial<MockScenario>) => setMockScenario(changes),
  resetScenario: resetMockScenario,
  // Restores the known seed data and the default scenario. Reloads by default so every cache starts clean.
  reset: ({ reload = true }: { reload?: boolean } = {}) => {
    resetMockState();
    resetMockScenario();
    restoreRealtime();
    appStorageKeys.forEach((key) => window.localStorage.removeItem(key));
    if (reload) window.location.reload();
  },
  listNfts: listNftOptions,
  changeNftPrice,
  markNftSoldOut,
  expireSessions: expireAllSessions,
  confirmPendingOrders: confirmAllPendingOrders,
  redeliverNftEvent,
  dropRealtime,
  restoreRealtime,
  isRealtimeConnected,
};

export type MockControls = typeof mockControls;

declare global {
  interface Window {
    kurioMocks?: MockControls;
  }
}