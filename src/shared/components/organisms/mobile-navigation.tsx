import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  faCartShopping,
  faHeart,
  faHouse,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Scanner } from "iconsax-react";
import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import { getCart, getCatalog, queryKeys } from "shared/api/marketplace.api";
import { Button, buttonVariants } from "shared/components/ui/button";
import { useSession } from "shared/hooks/use-session";
import { cn } from "shared/lib/utils";

interface NavigationIconProps {
  icon: typeof faHouse;
}
const NavigationIcon = ({ icon }: NavigationIconProps) => {
  const [width, height, , , data] = icon.icon;
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
    >
      <path d={Array.isArray(data) ? data.join(" ") : data} />
    </svg>
  );
};

const initialCatalogSearch = { page: 1 };

const MobileNavigation = () => {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { data: session } = useSession();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: catalog } = useQuery({
    queryKey: queryKeys.catalog(initialCatalogSearch),
    queryFn: () => getCatalog(initialCatalogSearch),
  });
  const { data: cart } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
  });
  const cartCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const randomNftMutation = useMutation({
    mutationFn: async () => {
      if (!catalog?.total) throw new Error("Nenhum NFT disponível.");
      const index = Math.floor(Math.random() * catalog.total);
      const search = { page: Math.floor(index / catalog.pageSize) + 1 };
      const page =
        search.page === 1
          ? catalog
          : await queryClient.fetchQuery({
              queryKey: queryKeys.catalog(search),
              queryFn: () => getCatalog(search),
            });
      const selectedIndex = index % catalog.pageSize;
      const nft = page.items[selectedIndex];
      return path === `/nfts/${nft.id}` && page.items.length > 1
        ? page.items[(selectedIndex + 1) % page.items.length]
        : nft;
    },
    onSuccess: (nft) => {
      void navigate({ to: "/nfts/$nftId", params: { nftId: nft.id } });
    },
  });
  const itemClassName = cn(
    buttonVariants({ variant: "ghost" }),
    "h-12 w-full rounded-xl bg-transparent p-0 shadow-none hover:bg-primary/10 [&_svg]:size-5",
  );
  const getItemClassName = (isSelected: boolean) =>
    cn(
      itemClassName,
      isSelected
        ? "text-[#E89B55] hover:text-[#E89B55] focus-visible:text-[#E89B55]"
        : "text-[#CFB28C] hover:text-[#CFB28C] focus-visible:text-[#CFB28C]",
    );
  const profileContent = <NavigationIcon icon={faUser} />;
  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-t-[32px] bg-[#241612] [mask-image:radial-gradient(circle_at_50%_0,transparent_44px,#000_45px)]"
        data-mobile-nav-surface=""
      />
      <div className="relative grid grid-cols-5 items-center">
        <Link
          activeOptions={{ exact: true }}
          aria-label="Início"
          className={getItemClassName(path === "/")}
          to="/"
        >
          <NavigationIcon icon={faHouse} />
        </Link>
        <Link
          activeOptions={{ exact: true }}
          aria-label="Favoritos"
          className={getItemClassName(path === "/favorites")}
          to="/favorites"
        >
          <NavigationIcon icon={faHeart} />
        </Link>
        <div className="relative grid h-12 place-items-center">
          <Button
            aria-label="Explorar NFT aleatório"
            className="absolute -top-[42px] size-[65px] rounded-full border-0 bg-transparent bg-[linear-gradient(180deg,rgba(210,138,76,0.4)_-16.92%,#D28A4C_109.23%)] p-0 text-ink shadow-none hover:bg-transparent [&_svg]:size-7"
            disabled={!catalog?.total || randomNftMutation.isPending}
            onClick={() => randomNftMutation.mutate()}
            type="button"
          >
            <Scanner aria-hidden="true" color="currentColor" variant="Linear" />
          </Button>
        </div>
        <Link
          activeOptions={{ exact: true }}
          aria-label="Carrinho"
          className={cn(
            getItemClassName(path === "/cart" || path === "/checkout"),
            "relative",
          )}
          to="/cart"
        >
          <NavigationIcon icon={faCartShopping} />
          {cartCount > 0 && (
            <span className="absolute right-3 top-0 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-canvas">
              {cartCount}
            </span>
          )}
        </Link>
        {session ? (
          <Link
            activeOptions={{ exact: true }}
            aria-label="Perfil"
            className={getItemClassName(path.startsWith("/account/"))}
            to="/account/profile"
          >
            {profileContent}
          </Link>
        ) : (
          <Button
            aria-label="Perfil"
            className={getItemClassName(path.startsWith("/account/"))}
            onClick={() => openAuth()}
            type="button"
          >
            {profileContent}
          </Button>
        )}
      </div>
      {randomNftMutation.error && (
        <p
          className="absolute -top-16 inset-x-4 rounded bg-[#241612] p-2 text-center text-xs text-danger"
          role="alert"
        >
          Não foi possível abrir um NFT. Tente novamente.
        </p>
      )}
    </nav>
  );
};

export { MobileNavigation };