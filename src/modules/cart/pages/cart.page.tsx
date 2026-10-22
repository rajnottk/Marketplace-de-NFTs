import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { getApiError } from "shared/api/api-error";
import {
  getCart,
  getQuote,
  queryKeys,
  removeCartItem,
  updateCartItem,
} from "shared/api/marketplace.api";
import { NftRecommendationsCarousel } from "shared/components/organisms/nft-recommendations-carousel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "shared/components/ui/breadcrumb";
import { EmptyState } from "shared/components/ui/empty-state";
import { Skeleton } from "shared/components/ui/skeleton";
import type { Cart, Quote } from "shared/contracts/marketplace";
import { CartSummary } from "modules/cart/components/cart-summary";
import {
  CartTable,
  CartTableSkeleton,
} from "modules/cart/components/cart-table";
import { useSession } from "shared/hooks/use-session";
import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import { MobileBackButton } from "shared/components/molecules/mobile-back-button";

const pageClassName =
  "mx-auto w-full max-w-[1200px] px-4 pb-10 pt-7 md:pb-16 md:pt-8 xl:px-0";
const contentGridClassName =
  "mt-5 grid gap-5 md:mt-4 md:gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-24";
const defaultNetwork = "Ethereum";
const couponErrorCode = "COUPON_INVALID";

const CartBreadcrumb = () => (
  <Breadcrumb>
    <BreadcrumbList className="text-base font-bold text-ink">
      <BreadcrumbItem>
        <BreadcrumbLink className="hover:text-accent" render={<Link to="/" />}>
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
        <BreadcrumbPage className="font-bold">Carrinho</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const CartPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();
  const { data: session, isLoading: isSessionLoading } = useSession();
  // The mock drops the quote whenever the cart changes, so the applied coupon lives here and is re-sent on every recalculation.
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const lastQuotedCartVersion = useRef<number | null>(null);
  const pendingQuote = useRef<Promise<Quote> | null>(null);

  const cartQuery = useQuery({ queryKey: queryKeys.cart, queryFn: getCart });
  const setCart = (cart: Cart) =>
    queryClient.setQueryData(queryKeys.cart, cart);
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: setCart,
  });
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: setCart,
  });
  const quoteMutation = useMutation({
    mutationFn: (coupon: string | null) => getQuote(coupon, defaultNetwork),
    onSuccess: (quote, coupon) => {
      setAppliedCoupon(coupon);
      setCouponError(null);
      queryClient.setQueryData(
        queryKeys.cart,
        (currentCart: Cart | undefined) =>
          currentCart ? { ...currentCart, quote } : currentCart,
      );
    },
    onError: (error) => {
      const apiError = getApiError(error);
      setCouponError(
        apiError.code === couponErrorCode ? apiError.message : null,
      );
    },
  });
  const { mutateAsync: calculateQuote } = quoteMutation;
  const requestQuote = useCallback(
    (coupon: string | null) => {
      const request = (pendingQuote.current ?? Promise.resolve())
        .catch(() => undefined)
        .then(() => calculateQuote(coupon));
      pendingQuote.current = request;
      void request
        .finally(() => {
          if (pendingQuote.current === request) pendingQuote.current = null;
        })
        .catch(() => undefined);
      return request;
    },
    [calculateQuote],
  );

  const cart = cartQuery.data;
  const cartItems = cart?.items ?? [];
  // After a reload the page state is empty, but the stored quote still knows which coupon was applied.
  const activeCoupon = appliedCoupon ?? cart?.quote?.coupon ?? null;

  // Recalculate the summary automatically on load and after every cart change (once per cart version).
  useEffect(() => {
    if (
      !cart?.items.length ||
      cart.quote ||
      pendingQuote.current ||
      lastQuotedCartVersion.current === cart.version
    )
      return;
    lastQuotedCartVersion.current = cart.version;
    void requestQuote(activeCoupon).catch(() => undefined);
  }, [cart, activeCoupon, requestQuote]);

  // Cart changes clear the stored quote: pin the active coupon first so the recalculation keeps it.
  const changeQuantity = (itemId: string, quantity: number) => {
    setAppliedCoupon(activeCoupon);
    updateMutation.mutate({ itemId, quantity: Math.max(1, quantity) });
  };

  const removeItem = (itemId: string) => {
    setAppliedCoupon(activeCoupon);
    removeMutation.mutate(itemId);
  };

  const handleApplyCoupon = (coupon: string) => {
    if (!cart) return;
    lastQuotedCartVersion.current = cart.version;
    void requestQuote(coupon || null).catch(() => undefined);
  };

  const handleCheckout = async () => {
    // A click can arrive before the pending mutation has repainted the button.
    // Wait for the stored quote so checkout inherits the newly applied coupon.
    try {
      await pendingQuote.current;
    } catch {
      return;
    }
    if (!session) {
      openAuth();
      return;
    }
    void navigate({ to: "/checkout" });
  };

  const requestError =
    updateMutation.error ??
    removeMutation.error ??
    (couponError ? null : quoteMutation.error);
  const requestErrorMessage = requestError
    ? getApiError(requestError).message
    : null;

  if (cartQuery.isPending) {
    return (
      <main className={pageClassName}>
        <Skeleton className="h-6 w-56" />
        <div className={contentGridClassName}>
          <CartTableSkeleton />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className={pageClassName}>
      <div className="hidden md:block">
        <CartBreadcrumb />
      </div>
      <div className="relative flex items-center md:hidden">
        <MobileBackButton />
        <h1 className="absolute inset-x-10 text-center text-lg font-bold text-ink">
          Carrinho de NFTs
        </h1>
      </div>
      {cartItems.length ? (
        <div className={contentGridClassName}>
          <div className="min-w-0">
            <CartTable
              isUpdating={updateMutation.isPending || removeMutation.isPending}
              items={cartItems}
              onQuantityChange={changeQuantity}
              onRemove={removeItem}
            />
            {requestErrorMessage && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {requestErrorMessage}
              </p>
            )}
          </div>
          <CartSummary
            appliedCoupon={activeCoupon}
            couponError={couponError}
            isQuoting={quoteMutation.isPending || isSessionLoading}
            onApplyCoupon={handleApplyCoupon}
            onCheckout={() => void handleCheckout()}
            quote={cart?.quote ?? null}
          />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            actionLabel="Explorar NFTs"
            description="Adicione uma obra para seguir com a compra."
            onAction={() => navigate({ hash: "catalog", to: "/" })}
            title="Seu carrinho está vazio"
          />
        </div>
      )}
      <NftRecommendationsCarousel
        nftIds={cartItems.map((item) => item.nft.id)}
        title="Colecionadores também viram"
      />
    </main>
  );
};

export { CartPage };