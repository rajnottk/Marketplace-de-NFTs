import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "shared/styles/globals.css";

const startMocks = async () => {
  // Opt-in only: a build without the flag must never ship the mock API (it would confirm orders without payment).
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") return;
  const { worker } = await import("mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
  const [{ mockControls }, { applyScenarioFromUrl }] = await Promise.all([
    import("mocks/controls/mock-controls"),
    import("mocks/scenarios"),
  ]);
  window.kurioMocks = mockControls;
  // `?mock-reset=1` restores the seed data; `?mock-scenario=...` selects a scenario. Both params are then removed.
  const url = new URL(window.location.href);
  if (url.searchParams.get("mock-reset") === "1")
    mockControls.reset({ reload: false });
  applyScenarioFromUrl(url.search);
  if (
    url.searchParams.has("mock-reset") ||
    url.searchParams.has("mock-scenario")
  ) {
    url.searchParams.delete("mock-reset");
    url.searchParams.delete("mock-scenario");
    window.history.replaceState(window.history.state, "", url);
  }
};

const bootstrap = async () => {
  await startMocks();
  // Load the app only after MSW patched WebSocket: socket.io-client captures the WebSocket constructor at import time.
  const { AppProviders } = await import("app/providers");
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found.");
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  );
};

void bootstrap();