import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { getApiError } from "shared/api/api-error";
import {
  getCart,
  getQuote,
  queryKeys,
  removeCartItem,
  updateCartItem,
} from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Card } from "shared/components/ui/card";
import { EmptyState } from "shared/components/ui/empty-state";
import { Input } from "shared/components/ui/input";
import { Skeleton } from "shared/components/ui/skeleton";
import { formatEth, multiplyEth } from "shared/lib/money";

const CartPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const cartQuery = useQuery({ queryKey: queryKeys.cart, queryFn: getCart });
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
  const quoteMutation = useMutation({
    mutationFn: () => getQuote(coupon.trim() || null, "Ethereum"),
    onSuccess: (quote) => {
      queryClient.setQueryData(
        queryKeys.cart,
        (current: Awaited<ReturnType<typeof getCart>> | undefined) =>
          current ? { ...current, quote } : current,
      );
    },
  });
  const error = cartQuery.error
    ? getApiError(cartQuery.error)
    : updateMutation.error
      ? getApiError(updateMutation.error)
      : removeMutation.error
        ? getApiError(removeMutation.error)
        : quoteMutation.error
          ? getApiError(quoteMutation.error)
          : null;

  if (cartQuery.isPending)
    return (
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-96" />
        <Skeleton className="h-72" />
      </main>
    );
  if (!cartQuery.data?.items.length)
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <EmptyState
          actionLabel="Explorar NFTs"
          description="Adicione uma obra para seguir com a compra."
          onAction={() => undefined}
          title="Seu carrinho está vazio"
        />
      </main>
    );

  const { items, quote } = cartQuery.data;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <h1 className="font-display text-3xl font-bold">SEU CARRINHO</h1>
      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-3">
          {items.map((item) => (
            <article
              className="flex flex-col gap-4 rounded-kurio border border-line bg-panel p-4 sm:flex-row"
              key={item.id}
            >
              <img
                alt={`NFT ${item.nft.name}`}
                className="h-28 w-full rounded object-cover sm:w-28"
                src={item.nft.imageUrl}
              />
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">{item.nft.collection}</p>
                  <h2 className="font-display text-sm font-bold">
                    {item.nft.name}
                  </h2>
                  <p className="mt-1 text-xs text-accent">
                    {formatEth(item.unitPriceEth)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-kurio border border-line bg-surface p-1">
                    <Button
                      aria-label={`Diminuir ${item.nft.name}`}
                      disabled={item.quantity === 1 || updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Minus size={15} />
                    </Button>
                    <output className="min-w-7 text-center text-sm">
                      {item.quantity}
                    </output>
                    <Button
                      aria-label={`Aumentar ${item.nft.name}`}
                      disabled={
                        item.quantity >=
                          Math.min(item.nft.available, item.nft.maxQuantity) ||
                        updateMutation.isPending
                      }
                      onClick={() =>
                        updateMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Plus size={15} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-sm font-bold">
                      {formatEth(multiplyEth(item.unitPriceEth, item.quantity))}
                    </p>
                    <Button
                      aria-label={`Remover ${item.nft.name}`}
                      disabled={removeMutation.isPending}
                      onClick={() => removeMutation.mutate(item.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold">RESUMO</h2>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="coupon">
              Cupom de desconto
            </label>
            <Input
              id="coupon"
              onChange={(event) => setCoupon(event.target.value)}
              placeholder="Cupom"
              value={coupon}
            />
            <Button
              disabled={quoteMutation.isPending}
              onClick={() => quoteMutation.mutate()}
              variant="secondary"
            >
              Aplicar
            </Button>
          </div>
          <dl className="space-y-3 border-y border-line py-4 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>
                {quote ? formatEth(quote.subtotalEth) : "Calcule a cotação"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Desconto</dt>
              <dd className="text-accent">
                {quote ? `- ${formatEth(quote.discountEth)}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Taxa de rede</dt>
              <dd>{quote ? formatEth(quote.networkFeeEth) : "—"}</dd>
            </div>
          </dl>
          <div className="flex justify-between font-display text-sm font-bold">
            <span>Total</span>
            <span className="text-accent">
              {quote ? formatEth(quote.totalEth) : "—"}
            </span>
          </div>
          <Button
            className="w-full"
            disabled={!quote}
            onClick={() => navigate({ to: "/checkout" })}
            size="lg"
          >
            Ir para pagamento
          </Button>
          {!quote ? (
            <p className="text-xs leading-5 text-muted">
              Aplique um cupom ou deixe em branco para calcular a cotação antes
              de pagar.
            </p>
          ) : null}
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

export { CartPage };