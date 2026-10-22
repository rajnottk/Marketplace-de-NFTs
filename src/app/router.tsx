import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AppLayout } from "app/app-layout";
import { ProfilePage } from "modules/account/pages/profile.page";
import { WalletsPage } from "modules/account/pages/wallets.page";
import { AccountConstructionPage } from "modules/account/pages/account-construction.page";
import { AccountLayout } from "modules/account/components/account-layout";
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
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: AccountLayout,
});
const profileRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/profile",
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
const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favorites",
  component: () => <UnderConstructionPage title="Favoritos" />,
});
const walletsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/wallet",
  component: WalletsPage,
});
const legacyWalletsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/wallets",
  beforeLoad: () => {
    throw redirect({ to: "/account/wallet", replace: true });
  },
});
const activityRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/activity",
  component: () => <AccountConstructionPage title="Atividade" />,
});
const wishlistRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/wishlist",
  component: () => <AccountConstructionPage title="Lista de interesse" />,
});
const offersRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/offers",
  component: () => <AccountConstructionPage title="Ofertas" />,
});
const downloadsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/downloads",
  component: () => <AccountConstructionPage title="Arquivos baixados" />,
});
const supportRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/support",
  component: () => <AccountConstructionPage title="Suporte" />,
});

const routeTree = rootRoute.addChildren([
  catalogRoute,
  nftDetailRoute,
  cartRoute,
  checkoutRoute,
  accountRoute.addChildren([
    profileRoute,
    walletsRoute,
    legacyWalletsRoute,
    activityRoute,
    wishlistRoute,
    offersRoute,
    downloadsRoute,
    supportRoute,
  ]),
  creatorsRoute,
  learnRoute,
  helpRoute,
  collectionRoute,
  favoritesRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}