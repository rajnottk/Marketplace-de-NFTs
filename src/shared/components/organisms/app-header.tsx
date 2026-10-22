import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogIn, Menu, Search, ShoppingCart } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  getCart,
  getCatalog,
  logout,
  queryKeys,
} from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "shared/components/ui/tabs";
import { useSession } from "shared/hooks/use-session";
import { clearSessionToken } from "shared/lib/session";

type AbaNavegacao = "inicio" | "mercado" | "criadores" | "aprenda";

const buscaMercado = { page: 1 };

const itensNavegacaoEmConstrucao = [
  { label: "Criadores", value: "criadores", to: "/criadores" },
  { label: "Aprenda", value: "aprenda", to: "/aprenda" },
] as const;

const classeAbaNavegacao =
  "h-full flex-none px-0 text-base font-normal text-ink hover:text-accent data-[active]:text-accent after:!bottom-0 after:!h-[3px] after:rounded-t-sm after:bg-accent";

const obterAbaAtiva = (caminhoAtual: string): AbaNavegacao | null => {
  if (caminhoAtual === "/") return "inicio";
  if (caminhoAtual.startsWith("/nfts/")) return "mercado";
  const itemEmConstrucao = itensNavegacaoEmConstrucao.find(
    (item) => item.to === caminhoAtual,
  );
  return itemEmConstrucao?.value ?? null;
};

const AppHeader = () => {
  const queryClient = useQueryClient();
  const caminhoAtual = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { data: session } = useSession();
  const { data: cart } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
  });
  const { data: catalogoMercado } = useQuery({
    queryKey: queryKeys.catalog(buscaMercado),
    queryFn: () => getCatalog(buscaMercado),
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
  const abaAtiva = obterAbaAtiva(caminhoAtual);

  // Sorteia um novo NFT a cada mudança de rota, para "Mercado" sempre abrir um item aleatório.
  const nftAleatorioId = useMemo(() => {
    const itensMercado = catalogoMercado?.items ?? [];
    if (!itensMercado.length) return null;
    return itensMercado[Math.floor(Math.random() * itensMercado.length)].id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogoMercado, caminhoAtual]);

  return (
    <header className="sticky top-0 z-30 bg-[#140D0A] font-mono">
      <div className="mx-auto flex h-[68px] w-full max-w-[1200px] items-center justify-between gap-4 border-b-[0.3px] border-primary px-4 xl:px-0">
        <Link
          aria-label="Kurio: página inicial"
          className="text-sm font-bold tracking-[0.2em] text-ink"
          to="/"
        >
          KURIO
        </Link>
        <Tabs className="hidden h-full md:flex" value={abaAtiva}>
          <nav aria-label="Navegação principal" className="h-full">
            <TabsList className="h-full gap-10" variant="line">
              <TabsTrigger
                className={classeAbaNavegacao}
                nativeButton={false}
                render={<Link to="/" />}
                value="inicio"
              >
                Início
              </TabsTrigger>
              <TabsTrigger
                className={classeAbaNavegacao}
                nativeButton={false}
                render={
                  nftAleatorioId ? (
                    <Link
                      params={{ nftId: nftAleatorioId }}
                      to="/nfts/$nftId"
                    />
                  ) : (
                    <Link to="/" />
                  )
                }
                value="mercado"
              >
                Mercado
              </TabsTrigger>
              {itensNavegacaoEmConstrucao.map((item) => (
                <TabsTrigger
                  className={classeAbaNavegacao}
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
        <div className="flex items-center gap-2 sm:gap-6">
          <Link
            aria-label="Ir para busca de NFTs"
            className="grid h-10 w-10 place-items-center text-ink hover:text-accent"
            to="/"
          >
            <Search size={24} />
          </Link>
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
            <div className="flex items-center gap-2">
              <Link
                aria-label={`Perfil de ${session.user.displayName}`}
                className="text-sm text-ink hover:text-accent"
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
            <Button
              className="h-9 bg-[#D28A4C] px-4 text-base font-medium text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90 [&_svg]:size-5"
              nativeButton={false}
              render={<Link to="/auth/login" />}
            >
              <LogIn />
              Entrar
            </Button>
          )}
          <button
            aria-label="Abrir menu"
            className="grid h-10 w-10 place-items-center text-ink md:hidden"
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