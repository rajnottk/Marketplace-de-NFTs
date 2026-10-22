import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "app/app-layout";
import { ProfilePage } from "modules/account/pages/profile.page";
import { WalletsPage } from "modules/account/pages/wallets.page";
import { CartPage } from "modules/cart/pages/cart.page";
import { CatalogPage } from "modules/catalog/pages/catalog.page";
import { CheckoutPage } from "modules/checkout/pages/checkout.page";
import { NftDetailPage } from "modules/nft-detail/pages/nft-detail.page";
import { UnderConstructionPage } from "modules/under-construction/pages/under-construction.page";
import { Button } from "shared/components/ui/button";
import { catalogSearchSchema } from "shared/contracts/marketplace";

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: () => (
    <main className="mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-4 text-center">
      <div className="space-y-4">
        <p className="font-display text-5xl text-accent">404</p>
        <h1 className="font-display text-2xl font-bold">
          PÁGINA NÃO ENCONTRADA
        </h1>
        <a href="/">
          <Button>Voltar ao início</Button>
        </a>
      </div>
    </main>
  ),
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: catalogSearchSchema,
  component: CatalogPage,
});

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nfts/$nftId",
  component: NftDetailPage,
});
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/profile",
  component: ProfilePage,
});
const creatorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/creators",
  component: () => <UnderConstructionPage title="Criadores" />,
});
const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/learn",
  component: () => <UnderConstructionPage title="Aprenda" />,
});
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/help",
  component: () => <UnderConstructionPage title="Central de ajuda" />,
});
const collectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/collection",
  component: () => <UnderConstructionPage title="Coleções" />,
});
const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/wallets",
  component: WalletsPage,
});

const routeTree = rootRoute.addChildren([
  catalogRoute,
  nftDetailRoute,
  cartRoute,
  checkoutRoute,
  profileRoute,
  walletsRoute,
  creatorsRoute,
  learnRoute,
  helpRoute,
  collectionRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}