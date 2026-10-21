import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "app/providers";
import "shared/styles/globals.css";

const startMocks = async () => {
  if (import.meta.env.VITE_ENABLE_MOCKS === "false") return;
  const { worker } = await import("mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
};

const bootstrap = async () => {
  await startMocks();
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Elemento raiz não encontrado.");
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  );
};

void bootstrap();