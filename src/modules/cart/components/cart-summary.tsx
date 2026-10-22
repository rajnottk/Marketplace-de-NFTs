import { PromoCodeForm } from "shared/components/molecules/promo-code-form";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "shared/components/ui/skeleton";
import type { Quote } from "shared/contracts/marketplace";
import { formatEthSummary } from "shared/lib/money";

const summaryRowClassName =
  "flex items-baseline justify-between gap-3 text-sm text-ink md:gap-4 md:text-base";

interface CartSummaryProps {
  quote: Quote | null;
  isQuoting: boolean;
  appliedCoupon: string | null;
  couponError: string | null;
  onApplyCoupon: (coupon: string) => void;
  onCheckout: () => void;
}

const CartSummary = ({
  quote,
  isQuoting,
  appliedCoupon,
  couponError,
  onApplyCoupon,
  onCheckout,
}: CartSummaryProps) => {
  return (
    <aside
      aria-labelledby="cart-summary-heading"
      className="-mx-4 h-fit rounded-t-[40px] bg-[#241612] px-5 py-5 md:mx-0 md:rounded-none md:bg-transparent md:p-0 lg:sticky lg:top-24"
    >
      <h2
        className="sr-only border-b border-[#D28A4C]/40 pb-4 text-2xl font-bold text-ink md:not-sr-only"
        id="cart-summary-heading"
      >
        Resumo da carteira
      </h2>

      <div className="md:mt-8">
        <PromoCodeForm
          appliedCoupon={appliedCoupon}
          compactOnMobile
          error={couponError}
          isPending={isQuoting}
          onApply={onApplyCoupon}
        />
      </div>

      {quote ? (
        <dl
          aria-busy={isQuoting}
          className="mt-3 space-y-3 md:mt-8 md:space-y-5"
        >
          <div className={summaryRowClassName}>
            <dt>Subtotal</dt>
            <dd className="md:text-xl">
              {formatEthSummary(quote.subtotalEth)}
            </dd>
          </div>
          <div className={summaryRowClassName}>
            <dt>Desconto do lançamento</dt>
            <dd>(−) {formatEthSummary(quote.discountEth)}</dd>
          </div>
          <div>
            <div className={summaryRowClassName}>
              <dt>Taxa de rede</dt>
              <dd className="md:text-xl">
                {formatEthSummary(quote.networkFeeEth)}
              </dd>
            </div>
            <p className="mt-2 text-right text-xs text-[#E89B55]">
              Taxa estimada
            </p>
          </div>
          <div className={`${summaryRowClassName} font-bold md:pt-6`}>
            <dt className="md:text-xl">Total</dt>
            <dd className="text-base text-[#E89B55] md:text-2xl">
              {formatEthSummary(quote.totalEth)}
            </dd>
          </div>
        </dl>
      ) : (
        <div
          aria-busy="true"
          aria-label="Calculando resumo"
          className="mt-8 space-y-5"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-7 w-full" key={index} />
          ))}
        </div>
      )}

      <button
        className="mt-6 h-14 w-full rounded-full bg-[#D28A4C] text-sm font-bold text-[#140D0A] transition-opacity hover:opacity-90 disabled:opacity-50 md:mt-8 md:h-12 md:rounded-md md:text-base"
        disabled={!quote || isQuoting}
        onClick={onCheckout}
        type="button"
      >
        Conectar e finalizar
      </button>
      <Link
        className="mt-5 hidden text-center text-base text-[#E89B55] hover:underline md:block"
        hash="catalog"
        to="/"
      >
        Continuar explorando
      </Link>
    </aside>
  );
};

export { CartSummary };