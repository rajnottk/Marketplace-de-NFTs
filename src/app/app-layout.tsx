import { Outlet } from "@tanstack/react-router";
import { AuthModalProvider } from "modules/auth/context/auth-modal-provider";
import { CatalogControlsProvider } from "modules/catalog/context/catalog-controls-provider";
import { MobileNavigation } from "shared/components/organisms/mobile-navigation";
import { AppFooter } from "shared/components/organisms/app-footer";
import { AppHeader } from "shared/components/organisms/app-header";
import { RealtimeNoticeBanner } from "shared/components/organisms/realtime-notice-banner";
import { useRealtime } from "shared/hooks/use-realtime";
import { useSessionExpiration } from "modules/auth/hooks/use-session-expiration";

// Needs the auth modal context, so it lives inside AuthModalProvider.
const SessionExpirationListener = () => {
  useSessionExpiration();
  return null;
};

const AppLayout = () => {
  useRealtime();
  return (
    <AuthModalProvider>
      <CatalogControlsProvider>
        <div className="min-h-screen bg-canvas pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-ink md:pb-0">
          <SessionExpirationListener />
          <RealtimeNoticeBanner />
          <AppHeader />
          <Outlet />
          <AppFooter />
          <MobileNavigation />
        </div>
      </CatalogControlsProvider>
    </AuthModalProvider>
  );
};

export { AppLayout };