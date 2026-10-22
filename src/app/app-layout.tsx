import { Outlet } from "@tanstack/react-router";
import { AuthModalProvider } from "modules/auth/context/auth-modal-provider";
import { AppFooter } from "shared/components/organisms/app-footer";
import { AppHeader } from "shared/components/organisms/app-header";
import { useRealtime } from "shared/hooks/use-realtime";

const AppLayout = () => {
  useRealtime();
  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-canvas text-ink">
        <AppHeader />
        <Outlet />
        <AppFooter />
      </div>
    </AuthModalProvider>
  );
};

export { AppLayout };