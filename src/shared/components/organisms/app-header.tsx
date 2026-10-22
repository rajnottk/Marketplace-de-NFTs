import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogIn, Search, ShoppingCart, UserRound } from "lucide-react";
import { CatalogSearchInput } from "modules/catalog/components/catalog-search";
import { CatalogFilterTrigger } from "modules/catalog/components/catalog-filter-trigger";
import { Link, useRouterState } from "@tanstack/react-router";
import { getCart, getCatalog, queryKeys } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "shared/components/ui/tabs";
import { useSession } from "shared/hooks/use-session";
import { useAuthModal } from "modules/auth/hooks/use-auth-modal";

type NavigationTab = "home" | "market" | "creators" | "learn";

const marketSearch = { page: 1 };

const underConstructionNavigationItems = [
  { label: "Criadores", value: "creators", to: "/creators" },
  { label: "Aprenda", value: "learn", to: "/learn" },
] as const;

const navigationTabClassName =
  "h-full flex-none px-0 text-base font-normal text-ink hover:text-accent data-[active]:text-accent after:!bottom-0 after:!h-[3px] after:rounded-t-sm after:bg-accent";

const getActiveTab = (currentPath: string): NavigationTab | null => {
  if (currentPath === "/" || currentPath.startsWith("/account/")) return "home";
  // NFT details, cart and checkout all belong to the "Mercado" section.
  if (
    currentPath.startsWith("/nfts/") ||
    currentPath === "/cart" ||
    currentPath === "/checkout"
  )
    return "market";
  const underConstructionItem = underConstructionNavigationItems.find(
    (item) => item.to === currentPath,
  );
  return underConstructionItem?.value ?? null;
};

const AppHeader = () => {
  const { openAuth } = useAuthModal();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { data: session } = useSession();
  const { data: cart } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
  });
  const { data: marketCatalog } = useQuery({
    queryKey: queryKeys.catalog(marketSearch),
    queryFn: () => getCatalog(marketSearch),
  });

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const activeTab = getActiveTab(currentPath);
  const isHome = currentPath === "/";

  // Picks a new NFT on every route change so "Mercado" always opens a random item.
  const randomNftId = useMemo(() => {
    const marketItems = marketCatalog?.items ?? [];
    if (!marketItems.length) return null;
    return marketItems[Math.floor(Math.random() * marketItems.length)].id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketCatalog, currentPath]);

  return (
    <>
      {isHome && (
        <div className="flex items-center gap-2 px-4 py-4 md:hidden">
          <CatalogSearchInput />
          <CatalogFilterTrigger />
        </div>
      )}
      <header className="sticky top-0 z-30 hidden bg-[#140D0A] font-mono md:block">
        <div className="mx-auto flex h-[68px] w-full max-w-[1200px] items-center justify-between gap-4 border-b-[0.3px] border-primary px-4 xl:px-0">
          <Link
            aria-label="Kurio: página inicial"
            className="text-sm font-bold tracking-[0.2em] text-ink"
            to="/"
          >
            KURIO
          </Link>
          <Tabs
            className={`hidden h-full ${isSearchOpen ? "lg:flex" : "md:flex"}`}
            value={activeTab}
          >
            <nav aria-label="Navegação principal" className="h-full">
              <TabsList className="h-full gap-4 xl:gap-10" variant="line">
                <TabsTrigger
                  className={navigationTabClassName}
                  nativeButton={false}
                  render={<Link to="/" />}
                  value="home"
                >
                  Início
                </TabsTrigger>
                <TabsTrigger
                  className={navigationTabClassName}
                  nativeButton={false}
                  render={
                    randomNftId ? (
                      <Link params={{ nftId: randomNftId }} to="/nfts/$nftId" />
                    ) : (
                      <Link to="/" />
                    )
                  }
                  value="market"
                >
                  Mercado
                </TabsTrigger>
                {underConstructionNavigationItems.map((item) => (
                  <TabsTrigger
                    className={navigationTabClassName}
                    key={item.value}
                    nativeButton={false}
                    render={<Link to={item.to} />}
                    value={item.value}
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </nav>
          </Tabs>
          <div className="flex min-w-0 items-center gap-2 lg:gap-4">
            {isSearchOpen && (
              <div className="w-28 shrink xl:w-48 lg:w-40">
                <CatalogSearchInput autoFocus compact />
              </div>
            )}
            <button
              aria-expanded={isSearchOpen}
              aria-label="Abrir pesquisa de NFTs"
              className="grid h-10 w-10 place-items-center text-ink hover:text-accent"
              onClick={() => setIsSearchOpen((previous) => !previous)}
              type="button"
            >
              <Search size={24} />
            </button>
            <div className="hidden md:block lg:hidden">
              <CatalogFilterTrigger />
            </div>
            <Link
              aria-label={`Carrinho com ${cartItemCount} itens`}
              className="relative grid h-10 w-10 place-items-center text-ink hover:text-accent"
              to="/cart"
            >
              <ShoppingCart size={24} />
              {cartItemCount ? (
                <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-[#140D0A]">
                  {cartItemCount}
                </span>
              ) : null}
            </Link>
            {session ? (
              <Link
                aria-label={`Perfil de ${session.user.displayName}`}
                className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-line text-accent hover:border-primary"
                to="/account/profile"
              >
                {session.user.avatarUrl ? (
                  <img
                    alt={`Avatar de ${session.user.displayName}`}
                    className="size-full object-cover"
                    src={session.user.avatarUrl}
                  />
                ) : (
                  <UserRound aria-hidden="true" size={22} strokeWidth={1.5} />
                )}
              </Link>
            ) : (
              <Button
                className="h-9 bg-[#D28A4C] px-4 text-base font-medium text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90 [&_svg]:size-5"
                onClick={() => openAuth()}
              >
                <LogIn />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export { AppHeader };