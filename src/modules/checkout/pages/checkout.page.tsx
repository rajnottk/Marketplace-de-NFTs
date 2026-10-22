import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobileCheckout } from "modules/checkout/components/mobile-checkout";
import { isWalletConfigured } from "modules/checkout/components/collector-values";
import { CollectorForm } from "modules/checkout/components/collector-form";
import { CheckoutSummary } from "modules/checkout/components/checkout-summary";
import {
  OrderConfirmationModal,
  type PurchaseConfirmation,
} from "modules/orders/components/order-confirmation-modal";
import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import { usePendingOrder } from "modules/checkout/hooks/use-pending-order";
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
import { useIsMobile } from "shared/hooks/use-is-mobile";

const pageClassName = "mx-auto w-full max-w-[1200px] px-4 pb-16 pt-8 xl:px-0";
const defaultNetwork: Network = "Ethereum";
const walletLabels: Record<string, string> = {
  walletconnect: "WalletConnect",
  metamask: "MetaMask",
  coinbase: "Coinbase Wallet",
};
const declinedMessage =
  "Pagamento não aprovado. Revise a carteira e tente novamente.";
const soldOutMessage =
  "Uma edição do seu carrinho esgotou durante a compra. Revise o carrinho.";
const pendingMessage =
  "Pagamento em processamento. A confirmação aparece aqui assim que a rede confirmar a transação.";
// Errors with no server answer: the order may exist, so the retry must repeat the exact same request.
const ambiguousErrorCodes = new Set(["TIMEOUT", "NETWORK_ERROR"]);

const CheckoutPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();
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
  const [confirmation, setConfirmation] = useState<PurchaseConfirmation | null>(
    null,
  );
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const lastQuoteAttempt = useRef<string | null>(null);
  // Idempotency key bound to what the user reviewed: retries of the same request reuse it, a new request gets a new key.
  const orderAttempt = useRef<{ key: string; fingerprint: string } | null>(
    null,
  );
  const pendingQuote = useRef<Promise<Quote> | null>(null);
  const isSubmitting = useRef(false);
  const ambiguousAttempt = useRef<{
    orderNetwork: Network;
    cartVersion: number;
  } | null>(null);
  const {
    pendingOrder,
    pendingWalletLabel,
    isTrackingPendingOrder,
    trackPendingOrder,
    clearPendingOrder,
  } = usePendingOrder(session?.user.id);
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
        apiError.code === "COUPON_INVALID" || apiError.code === "COUPON_EXPIRED"
          ? apiError.message
          : null,
      );
    },
  });
  const { mutateAsync: calculateQuote } = quoteMutation;
  const requestQuote = useCallback(
    (coupon: string | null, quoteNetwork: Network) => {
      const request = (pendingQuote.current ?? Promise.resolve())
        .catch(() => undefined)
        .then(() => calculateQuote({ coupon, quoteNetwork }));
      pendingQuote.current = request;
      void request.catch(() => undefined);
      return request;
    },
    [calculateQuote],
  );
  const orderMutation = useMutation({
    mutationFn: ({
      orderNetwork,
      cartVersion,
    }: {
      orderNetwork: Network;
      cartVersion: number;
    }) => {
      const fingerprint = `${orderNetwork}|${cartVersion}`;
      if (orderAttempt.current?.fingerprint !== fingerprint)
        orderAttempt.current = { key: crypto.randomUUID(), fingerprint };
      return createOrder(orderNetwork, cartVersion, orderAttempt.current.key);
    },
    onError: (error, variables) => {
      const { code } = getApiError(error);
      // No answer (timeout/offline): the order may already exist, so keep the key and repeat the same request.
      ambiguousAttempt.current = ambiguousErrorCodes.has(code)
        ? variables
        : null;
      // Terminal rejections: the next attempt is a new request.
      if (
        code === "IDEMPOTENCY_CONFLICT" ||
        code === "QUOTE_OUTDATED" ||
        code === "EDITION_SOLD_OUT"
      )
        orderAttempt.current = null;
      if (code === "QUOTE_OUTDATED" || code === "EDITION_SOLD_OUT")
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
    onSuccess: (order) => {
      ambiguousAttempt.current = null;
      if (order.status === "declined") {
        orderAttempt.current = null;
        setPurchaseError(() => declinedMessage);
        return;
      }
      if (order.status === "pending") {
        trackPendingOrder(order, walletLabels[paymentMethod]);
        return;
      }
      setConfirmation(() => ({
        order,
        confirmedAt: new Date().toISOString(),
        walletLabel: walletLabels[paymentMethod],
      }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });

  // A followed pending order is terminal once confirmed (show the receipt) or declined (allow a new attempt).
  useEffect(() => {
    if (!pendingOrder || pendingOrder.status === "pending") return;
    clearPendingOrder();
    orderAttempt.current = null;
    if (pendingOrder.status === "confirmed") {
      setConfirmation(() => ({
        order: pendingOrder,
        confirmedAt: new Date().toISOString(),
        walletLabel: pendingWalletLabel,
      }));
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    } else {
      setPurchaseError(() => declinedMessage);
    }
  }, [clearPendingOrder, pendingOrder, pendingWalletLabel, queryClient]);

  // Quote once on entry, since the stored quote does not include its network.
  useEffect(() => {
    if (!cart?.items.length) return;
    const quoteAttempt = `${cart.version}:${network}`;
    if (lastQuoteAttempt.current === quoteAttempt) return;
    lastQuoteAttempt.current = quoteAttempt;
    void requestQuote(currentQuote?.coupon ?? null, network);
  }, [
    cart?.items.length,
    cart?.version,
    currentQuote?.coupon,
    network,
    requestQuote,
  ]);

  const availableWallets = (walletsQuery.data ?? []).filter(
    (wallet) =>
      wallet.connectedState === "connected" ||
      Boolean(session && isWalletConfigured(session.user, wallet)),
  );
  const wallet =
    availableWallets.find((item) => item.isPrimary) ?? availableWallets[0];
  const requestError =
    cartQuery.error ??
    walletsQuery.error ??
    orderMutation.error ??
    (couponError ? null : quoteMutation.error);
  const checkoutError =
    (isTrackingPendingOrder ? pendingMessage : null) ??
    purchaseError ??
    (requestError
      ? `${orderMutation.error ? "Não foi possível confirmar a compra. " : quoteMutation.error ? "Não foi possível atualizar o total. " : ""}${getApiError(requestError).message}`
      : null);
  const handleConfirm = async () => {
    // A pending payment must resolve first: a new confirmation would create a second purchase.
    if (isSubmitting.current || isTrackingPendingOrder) return;
    isSubmitting.current = true;
    setPurchaseError(() => null);
    setIsConfirming(() => true);
    try {
      if (ambiguousAttempt.current) {
        await orderMutation.mutateAsync(ambiguousAttempt.current);
        return;
      }
      // Honor a click during recalculation, using its completed quote for the order.
      await pendingQuote.current?.catch(() => undefined);
      // What the user reviewed on screen, before syncing with the server.
      const reviewedCart = queryClient.getQueryData<Cart>(queryKeys.cart);
      const reviewedTotal = reviewedCart?.quote?.totalEth ?? null;
      // Confirm against the server's current cart (not a possibly stale cache entry, e.g. right after a 409).
      const latestCart = await queryClient.fetchQuery({
        queryKey: queryKeys.cart,
        queryFn: getCart,
        staleTime: 0,
      });
      // A sold-out edition cannot be bought: say so instead of asking for a new review.
      if (latestCart.items.some((item) => item.nft.available === 0)) {
        setPurchaseError(() => soldOutMessage);
        return;
      }
      // Never order on a missing, failed, expired or outdated quote: recalculate first.
      const latestQuote = latestCart.quote;
      const isQuoteOutdated =
        !latestQuote ||
        quoteMutation.isError ||
        latestQuote.cartVersion !== latestCart.version ||
        new Date(latestQuote.expiresAt).getTime() <= Date.now();
      const refreshedQuote = isQuoteOutdated
        ? await requestQuote(latestQuote?.coupon ?? null, network)
        : latestQuote;
      // Changes the user has not seen yet (cart edited elsewhere, new prices or fees) require a new confirmation.
      if (
        latestCart.version !== reviewedCart?.version ||
        refreshedQuote.totalEth !== reviewedTotal
      ) {
        setPurchaseError(
          () =>
            "Os valores do pedido mudaram. Revise o resumo e confirme novamente.",
        );
        return;
      }
      await orderMutation.mutateAsync({
        orderNetwork: network,
        cartVersion: latestCart.version,
      });
    } catch {
      // The mutations already expose their errors beside the purchase button.
    } finally {
      isSubmitting.current = false;
      setIsConfirming(() => false);
    }
  };

  if (confirmation)
    return (
      <OrderConfirmationModal
        confirmation={confirmation}
        onClose={() => void navigate({ to: "/" })}
      />
    );
  if (
    isSessionLoading ||
    cartQuery.isPending ||
    (isMobile && session && walletsQuery.isPending)
  )
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
          onAction={() => openAuth()}
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

  if (isMobile)
    return (
      <main className="mx-auto w-full max-w-xl px-6 pb-6 pt-7">
        <MobileCheckout
          error={checkoutError}
          isOrdering={isConfirming || isTrackingPendingOrder}
          isQuoting={quoteMutation.isPending}
          onConfirm={() => void handleConfirm()}
          onNetworkChange={setNetwork}
          onPaymentMethodChange={setPaymentMethod}
          paymentMethod={paymentMethod}
          quote={currentQuote}
          user={session.user}
          wallets={availableWallets}
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
          disabled={isConfirming || isTrackingPendingOrder}
          isQuoting={quoteMutation.isPending}
          network={network}
          onConfirm={() => void handleConfirm()}
          onNetworkChange={(value) => setNetwork(() => value)}
          user={session.user}
          wallet={wallet}
        />
        <CheckoutSummary
          couponError={couponError}
          error={checkoutError}
          isOrdering={isConfirming || isTrackingPendingOrder}
          isQuoting={quoteMutation.isPending}
          items={cart.items}
          onApplyCoupon={(coupon) => {
            void requestQuote(coupon || null, network);
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