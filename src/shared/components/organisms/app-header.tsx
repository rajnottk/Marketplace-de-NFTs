import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Menu, Search, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getCart, logout, queryKeys } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { useSession } from "shared/hooks/use-session";
import { clearSessionToken } from "shared/lib/session";

const navigationItems = [
  { label: "Início", to: "/" },
  { label: "Mercado", to: "/" },
  { label: "Criadores", to: "/" },
] as const;

const AppHeader = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { data: cart } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
  });
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSessionToken();
      queryClient.removeQueries({ queryKey: queryKeys.session });
      queryClient.removeQueries({ queryKey: queryKeys.favorites });
      queryClient.removeQueries({ queryKey: queryKeys.wallets });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });

  const cartItemCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          aria-label="Kurio: página inicial"
          className="font-display text-lg font-bold tracking-[0.28em] text-ink"
          to="/"
        >
          KURIO
        </Link>
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 text-xs text-muted md:flex"
        >
          {navigationItems.map((item) => (
            <Link
              activeProps={{ className: "text-accent" }}
              key={item.label}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            aria-label="Ir para busca de NFTs"
            className="grid h-10 w-10 place-items-center text-muted hover:text-accent"
            to="/"
          >
            <Search size={18} />
          </Link>
          <Link
            aria-label="Favoritos"
            className="hidden h-10 w-10 place-items-center text-muted hover:text-accent sm:grid"
            to="/account/profile"
          >
            <Heart size={18} />
          </Link>
          <Link
            aria-label={`Carrinho com ${cartItemCount} itens`}
            className="relative grid h-10 w-10 place-items-center text-muted hover:text-accent"
            to="/cart"
          >
            <ShoppingCart size={18} />
            {cartItemCount ? (
              <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-canvas">
                {cartItemCount}
              </span>
            ) : null}
          </Link>
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                aria-label={`Perfil de ${session.user.displayName}`}
                className="text-xs text-ink hover:text-accent"
                to="/account/profile"
              >
                <span className="sm:hidden">Perfil</span>
                <span className="hidden sm:inline">
                  {session.user.displayName}
                </span>
              </Link>
              <Button
                className="hidden sm:inline-flex"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                size="sm"
                variant="secondary"
              >
                Sair
              </Button>
            </div>
          ) : (
            <Link to="/auth/login">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
          <button
            aria-label="Abrir menu"
            className="grid h-10 w-10 place-items-center text-muted md:hidden"
            type="button"
          >
            <Menu size={19} />
          </button>
        </div>
      </div>
    </header>
  );
};

export { AppHeader };