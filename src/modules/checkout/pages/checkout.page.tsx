import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getApiError } from "shared/api/api-error";
import {
  createOrder,
  getCart,
  getQuote,
  getWallets,
  queryKeys,
} from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Card } from "shared/components/ui/card";
import { EmptyState } from "shared/components/ui/empty-state";
import { formatEth } from "shared/lib/money";
import { useSession } from "shared/hooks/use-session";
import type { Network } from "shared/contracts/marketplace";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = useSession();
  const { data: cart } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: getCart,
  });
  const { data: wallets } = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: getWallets,
    enabled: Boolean(session),
  });
  const [network, setNetwork] = useState<Network>("Ethereum");
  const quoteMutation = useMutation({
    mutationFn: () => getQuote(cart?.quote?.coupon ?? null, network),
  });
  const orderMutation = useMutation({
    mutationFn: () => createOrder(network, crypto.randomUUID()),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    },
  });
  const currentQuote = quoteMutation.data ?? cart?.quote;
  const error = quoteMutation.error
    ? getApiError(quoteMutation.error)
    : orderMutation.error
      ? getApiError(orderMutation.error)
      : null;

  useEffect(() => {
    if (cart?.items.length && !currentQuote && !quoteMutation.isPending)
      quoteMutation.mutate();
  }, [cart?.items.length, currentQuote, quoteMutation]);

  const hasWallet = useMemo(() => (wallets?.length ?? 0) > 0, [wallets]);
  if (isSessionPending)
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 text-muted">
        Recuperando sessão…
      </main>
    );
  if (!session)
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState
          actionLabel="Entrar"
          description="O pagamento e a emissão do recibo exigem uma conta de colecionador."
          onAction={() => undefined}
          title="Entre para continuar"
        />
      </main>
    );
  if (!cart?.items.length)
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState
          actionLabel="Ver carrinho"
          description="Adicione NFTs antes de iniciar o pagamento."
          onAction={() => undefined}
          title="Seu carrinho está vazio"
        />
      </main>
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">
        Etapa final
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">PAGAMENTO</h1>
      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <h2 className="font-display text-base font-bold">
              Dados do colecionador
            </h2>
            <p className="text-sm text-muted">
              {session.user.displayName}
              <br />
              {session.user.email}
            </p>
          </Card>
          <Card className="space-y-4 p-5">
            <h2 className="font-display text-base font-bold">
              Carteira e rede
            </h2>
            <label className="block text-xs text-muted" htmlFor="network">
              Rede
              <select
                className="mt-2 h-11 w-full rounded-kurio border border-line bg-surface px-3 text-ink"
                id="network"
                onChange={(event) => setNetwork(event.target.value as Network)}
                value={network}
              >
                <option>Ethereum</option>
                <option>Polygon</option>
                <option>Solana</option>
              </select>
            </label>
            {hasWallet ? (
              <p className="rounded-kurio bg-surface p-3 text-xs text-ink">
                <CreditCard className="mr-2 inline text-accent" size={15} />
                {wallets?.[0].label} · {wallets?.[0].address}
              </p>
            ) : (
              <Link
                className="text-xs text-accent underline"
                to="/account/wallets"
              >
                Cadastrar uma carteira
              </Link>
            )}
          </Card>
        </div>
        <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-base font-bold">
            Revisão do pedido
          </h2>
          <div className="space-y-2 text-xs">
            {cart.items.map((item) => (
              <div className="flex justify-between gap-4" key={item.id}>
                <span className="text-muted">
                  {item.quantity}× {item.nft.name}
                </span>
                <span>{formatEth(item.unitPriceEth)}</span>
              </div>
            ))}
          </div>
          <div className="border-y border-line py-4">
            <div className="flex justify-between font-display text-sm font-bold">
              <span>Total</span>
              <span className="text-accent">
                {currentQuote
                  ? formatEth(currentQuote.totalEth)
                  : "Calculando…"}
              </span>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={!currentQuote || !hasWallet || orderMutation.isPending}
            onClick={() => orderMutation.mutate()}
            size="lg"
          >
            <LockKeyhole size={17} />
            Confirmar compra
          </Button>
          <p className="text-[11px] leading-5 text-muted">
            A cotação é validada antes do envio. Não criaremos uma segunda
            compra em cliques repetidos.
          </p>
          {error ? (
            <p className="text-xs text-danger" role="alert">
              {error.message}
            </p>
          ) : null}
        </Card>
      </section>
    </main>
  );
};

export { CheckoutPage };