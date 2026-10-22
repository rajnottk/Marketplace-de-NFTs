import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Activity,
  Danger,
  Heart,
  ImportCurve,
  Location,
  LogoutCurve,
  Profile,
  ShoppingCart,
} from "iconsax-react";
import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import { logout, queryKeys } from "shared/api/marketplace.api";
import { useSession } from "shared/hooks/use-session";
import { clearSessionToken } from "shared/lib/session";

const accountNavigation = [
  { label: "Dados do perfil", to: "/account/profile", icon: Profile },
  { label: "Carteiras", to: "/account/wallet", icon: Location },
  { label: "Atividade", to: "/account/activity", icon: ShoppingCart },
  { label: "Lista de interesse", to: "/account/wishlist", icon: Heart },
  { label: "Ofertas", to: "/account/offers", icon: Activity },
  { label: "Arquivos baixados", to: "/account/downloads", icon: ImportCurve },
  { label: "Suporte", to: "/account/support", icon: Danger },
] as const;

const navigationItemHeight = 40;

const AccountLayout = () => {
  const { data: session, isLoading } = useSession();
  const { openAuth } = useAuthModal();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activeIndex = accountNavigation.findIndex(
    (item) => item.to === currentPath,
  );
  const logoutMutation = useMutation({
    mutationFn: logout,
    // Always sign out locally, even if the API call fails (offline, 5xx, expired token): never leave a shared device logged in.
    onSettled: () => {
      clearSessionToken();
      queryClient.setQueryData(queryKeys.session, null);
      // Private data of the previous user must not stay visible until a refetch: remove it, then load the guest cart.
      [
        queryKeys.favorites,
        queryKeys.wallets,
        queryKeys.profile,
        queryKeys.cart,
        ["order"],
      ].forEach((queryKey) => queryClient.removeQueries({ queryKey }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      void navigate({ to: "/" });
    },
  });
  if (isLoading)
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-10" role="status">
        Carregando sua conta…
      </main>
    );
  if (!session)
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-16 text-center">
        <p className="text-sm text-muted">Entre para acessar sua conta.</p>
        <button
          className="mt-4 text-sm text-accent hover:text-primary"
          onClick={() => openAuth()}
          type="button"
        >
          Ir para login
        </button>
      </main>
    );
  return (
    <main className="mx-auto grid w-full max-w-[1200px] items-start gap-6 px-4 py-7 font-mono md:grid-cols-[17rem_minmax(0,1fr)] xl:px-0">
      <nav aria-label="Configurações da conta" className="bg-[#241612] text-sm">
        <h2 className="px-2 pt-4 text-base font-bold">Meu perfil</h2>
        <div className="relative mt-1">
          {activeIndex >= 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-10 w-[5px] bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none"
              data-account-indicator=""
              style={{
                transform: `translateY(${activeIndex * navigationItemHeight}px)`,
              }}
            />
          )}
          {accountNavigation.map(({ label, to, icon: Icon }) => (
            <Link
              activeOptions={{ exact: true }}
              className="flex h-10 items-center gap-3 border-l-[5px] border-transparent px-2 py-2 text-accent transition-colors hover:bg-primary/10 hover:text-ink"
              key={to}
              to={to}
            >
              <Icon
                aria-hidden="true"
                className="shrink-0 text-muted-foreground"
                color="currentColor"
                size={18}
                variant="Linear"
              />
              {label}
            </Link>
          ))}
        </div>
        <button
          className="flex min-h-11 w-full items-center gap-3 border-t border-line px-3 text-left text-accent hover:bg-primary/10 disabled:opacity-60"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
          type="button"
        >
          <LogoutCurve
            aria-hidden="true"
            className="-scale-x-100"
            color="currentColor"
            size={18}
            variant="Linear"
          />
          {logoutMutation.isPending ? "Saindo…" : "Sair"}
        </button>
      </nav>
      <section className="min-w-0">
        <Outlet />
      </section>
    </main>
  );
};

export { AccountLayout };