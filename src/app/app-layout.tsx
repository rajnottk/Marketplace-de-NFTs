import { Outlet } from "@tanstack/react-router";
import { AppHeader } from "shared/components/organisms/app-header";
import { useRealtime } from "shared/hooks/use-realtime";

const AppLayout = () => {
  useRealtime();
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <AppHeader />
      <Outlet />
      <footer className="border-t border-line bg-surface px-4 py-8 text-center text-xs text-muted">
        <p className="font-display tracking-[0.22em] text-ink">KURIO</p>
        <p className="mt-2">Arte digital, autoria e coleta consciente.</p>
      </footer>
    </div>
  );
};

export { AppLayout };