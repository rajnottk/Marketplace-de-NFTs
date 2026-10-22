import { Outlet, useRouterState } from "@tanstack/react-router";
import { AuthModalProvider } from "modules/auth/context/auth-modal-provider";
import { CatalogControlsProvider } from "modules/catalog/context/catalog-controls-provider";
import { MobileNavigation } from "shared/components/organisms/mobile-navigation";
import { AppFooter } from "shared/components/organisms/app-footer";
import { AppHeader } from "shared/components/organisms/app-header";
import { useRealtime } from "shared/hooks/use-realtime";
import { cn } from "shared/lib/utils";

const AppLayout = () => {
  useRealtime();
  const isNftDetail = useRouterState({
    select: (state) => state.location.pathname.startsWith("/nfts/"),
  });
  return (
    <AuthModalProvider>
      <CatalogControlsProvider>
        <div
          className={cn(
            "min-h-screen bg-canvas text-ink md:pb-0",
            !isNftDetail && "pb-[calc(6.5rem+env(safe-area-inset-bottom))]",
          )}
        >
          <AppHeader />
          <Outlet />
          <AppFooter />
          {!isNftDetail && <MobileNavigation />}
        </div>
      </CatalogControlsProvider>
    </AuthModalProvider>
  );
};

export { AppLayout };