import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CollectorForm } from "modules/checkout/components/collector-form";
import { CheckoutSummary } from "modules/checkout/components/checkout-summary";
import { getApiError } from "shared/api/api-error";
import {
  createOrder,
  getCart,
  getQuote,
  getWallets,
  queryKeys,
} from "shared/api/marketplace.api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "shared/components/ui/breadcrumb";
import { EmptyState } from "shared/components/ui/empty-state";
import type { Cart, Network, Quote } from "shared/contracts/marketplace";
import { useSession } from "shared/hooks/use-session";

const pageClassName = "mx-auto w-full max-w-[1200px] px-4 pb-16 pt-8 xl:px-0";
const defaultNetwork: Network = "Ethereum";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isLoading: isSessionLoading } = useSession();
  const cartQuery = useQuery({ queryKey: queryKeys.cart, queryFn: getCart });
  const walletsQuery = useQuery({
    queryKey: queryKeys.wallets,
    queryFn: getWallets,
    enabled: Boolean(session),
  });
  const [network, setNetwork] = useState<Network>(defaultNetwork);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("coinbase");
  const [couponError, setCouponError] = useState<string | null>(null);
  const lastQuoteAttempt = useRef<string | null>(null);
  const orderKey = useRef<string | null>(null);
  const pendingQuote = useRef<Promise<Quote> | null>(null);
  const isSubmitting = useRef(false);
  const cart = cartQuery.data;
  const currentQuote = cart?.quote ?? null;
  const quoteMutation = useMutation({
    mutationFn: ({
      coupon,
      quoteNetwork,
    }: {
      coupon: string | null;
      quoteNetwork: Network;
    }) => getQuote(coupon, quoteNetwork),
    onSuccess: (quote) => {
      setCouponError(() => null);
      queryClient.setQueryData(queryKeys.cart, (previous: Cart | undefined) =>
        previous ? { ...previous, quote } : previous,
      );
    },
    onError: (error) => {
      const apiError = getApiError(error);
      setCouponError(() =>
        apiError.code === "COUPON_INVALID" ? apiError.message : null,
      );
    },
  });
  const orderMutation = useMutation({
    mutationFn: () => {
      orderKey.current ??= crypto.randomUUID();
      return createOrder(network, orderKey.current);
    },
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      void navigate({ to: "/orders/$orderId", params: { orderId: order.id } });
    },
  });

  // Quote once on entry, since the stored quote does not include its network.
  useEffect(() => {
    if (!cart?.items.length) return;
    const quoteAttempt = `${cart.version}:${network}`;
    if (lastQuoteAttempt.current === quoteAttempt) return;
    lastQuoteAttempt.current = quoteAttempt;
    pendingQuote.current = quoteMutation.mutateAsync({
      coupon: currentQuote?.coupon ?? null,
      quoteNetwork: network,
    });
    void pendingQuote.current.catch(() => undefined);
  }, [
    cart?.items.length,
    cart?.version,
    currentQuote?.coupon,
    network,
    quoteMutation,
  ]);

  const availableWallets = (walletsQuery.data ?? []).filter(
    (wallet) => wallet.connectedState === "connected",
  );
  const wallet =
    availableWallets.find((item) => item.isPrimary) ?? availableWallets[0];
  const requestError =
    cartQuery.error ??
    walletsQuery.error ??
    orderMutation.error ??
    (couponError ? null : quoteMutation.error);
  const handleConfirm = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsConfirming(() => true);
    try {
      // Honor a click during recalculation, using its completed quote for the order.
      await pendingQuote.current;
      await orderMutation.mutateAsync();
    } catch {
      // The mutations already expose their errors beside the purchase button.
    } finally {
      isSubmitting.current = false;
      setIsConfirming(() => false);
    }
  };

  if (isSessionLoading || cartQuery.isPending)
    return (
      <main className={pageClassName}>
        <p className="text-sm text-muted-foreground" role="status">
          Carregando pagamento…
        </p>
      </main>
    );
  if (!session)
    return (
      <main className={pageClassName}>
        <EmptyState
          actionLabel="Entrar"
          description="O pagamento e a emissão do recibo exigem uma conta de colecionador."
          onAction={() => void navigate({ to: "/auth/login" })}
          title="Entre para continuar"
        />
      </main>
    );
  if (cartQuery.isError)
    return (
      <main className={pageClassName}>
        <p className="text-danger" role="alert">
          {getApiError(cartQuery.error).message}
        </p>
      </main>
    );
  if (!cart?.items.length)
    return (
      <main className={pageClassName}>
        <EmptyState
          actionLabel="Ver carrinho"
          description="Adicione NFTs antes de iniciar o pagamento."
          onAction={() => void navigate({ to: "/cart" })}
          title="Seu carrinho está vazio"
        />
      </main>
    );

  return (
    <main className={pageClassName}>
      <Breadcrumb>
        <BreadcrumbList className="text-sm font-bold text-ink">
          <BreadcrumbItem>
            <BreadcrumbLink
              className="hover:text-accent"
              render={<Link to="/" />}
            >
              Início
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              className="hover:text-accent"
              render={<Link hash="catalog" to="/" />}
            >
              Mercado
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold">Pagamento</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.54fr)] lg:gap-8">
        <CollectorForm
          disabled={isConfirming}
          isQuoting={quoteMutation.isPending}
          network={network}
          onConfirm={() => void handleConfirm()}
          onNetworkChange={(value) => setNetwork(() => value)}
          user={session.user}
          wallet={wallet}
        />
        <CheckoutSummary
          couponError={couponError}
          error={requestError ? getApiError(requestError).message : null}
          isOrdering={isConfirming}
          isQuoting={quoteMutation.isPending}
          items={cart.items}
          onApplyCoupon={(coupon) => {
            pendingQuote.current = quoteMutation.mutateAsync({
              coupon: coupon || null,
              quoteNetwork: network,
            });
            void pendingQuote.current.catch(() => undefined);
          }}
          onPaymentMethodChange={(method) => setPaymentMethod(() => method)}
          paymentMethod={paymentMethod}
          quote={currentQuote}
        />
      </div>
    </main>
  );
};

export { CheckoutPage };