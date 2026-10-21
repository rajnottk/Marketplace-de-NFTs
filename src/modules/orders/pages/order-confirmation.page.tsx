import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, Copy, XCircle } from "lucide-react";
import { getApiError } from "shared/api/api-error";
import { getOrder, queryKeys } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Card } from "shared/components/ui/card";
import { EmptyState } from "shared/components/ui/empty-state";
import { Skeleton } from "shared/components/ui/skeleton";
import { formatEth } from "shared/lib/money";

const OrderConfirmationPage = () => {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const orderQuery = useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: () => getOrder(orderId),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 2_000 : false,
  });
  const error = orderQuery.error ? getApiError(orderQuery.error) : null;
  if (orderQuery.isPending)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-96" />
      </main>
    );
  if (!orderQuery.data)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          description={
            error?.message ?? "Não foi possível recuperar este pedido."
          }
          title="Pedido não encontrado"
        />
      </main>
    );
  const { snapshot, status, transactionRef } = orderQuery.data;
  const isConfirmed = status === "confirmed";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-surface p-6 text-center sm:p-10">
          {isConfirmed ? (
            <CheckCircle2
              aria-hidden="true"
              className="mx-auto text-accent"
              size={48}
            />
          ) : (
            <XCircle
              aria-hidden="true"
              className="mx-auto text-danger"
              size={48}
            />
          )}
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
            Pedido {isConfirmed ? "confirmado" : "recusado"}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            {isConfirmed ? "ARTE GARANTIDA" : "PAGAMENTO NÃO APROVADO"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            {isConfirmed
              ? "Seu pedido foi registrado com um snapshot imutável dos valores e itens comprados."
              : "Nenhum item foi removido do seu carrinho."}
          </p>
        </div>
        <div className="space-y-6 p-5 sm:p-7">
          <section className="space-y-3">
            <h2 className="font-display text-sm font-bold">ITENS</h2>
            {snapshot.items.map((item) => (
              <div className="flex items-center gap-3" key={item.id}>
                <img
                  alt=""
                  className="h-12 w-12 rounded object-cover"
                  src={item.nft.imageUrl}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.nft.name}</p>
                  <p className="text-xs text-muted">
                    {item.quantity}× {formatEth(item.unitPriceEth)}
                  </p>
                </div>
              </div>
            ))}
          </section>
          <section className="space-y-2 border-y border-line py-5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatEth(snapshot.quote.subtotalEth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Taxa de rede</span>
              <span>{formatEth(snapshot.quote.networkFeeEth)}</span>
            </div>
            <div className="flex justify-between pt-2 font-display text-sm font-bold">
              <span>Total</span>
              <span className="text-accent">
                {formatEth(snapshot.quote.totalEth)}
              </span>
            </div>
          </section>
          <div className="flex items-center justify-between rounded-kurio bg-surface p-3 text-xs">
            <span className="truncate text-muted">{transactionRef}</span>
            <button
              aria-label="Copiar referência da transação"
              className="ml-3 shrink-0 text-accent"
              onClick={() => navigator.clipboard.writeText(transactionRef)}
              type="button"
            >
              <Copy size={16} />
            </button>
          </div>
          <Link to="/">
            <Button className="w-full">Voltar ao mercado</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
};

export { OrderConfirmationPage };