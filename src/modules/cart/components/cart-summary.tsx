import { PromoCodeForm } from "shared/components/molecules/promo-code-form";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "shared/components/ui/skeleton";
import type { Quote } from "shared/contracts/marketplace";
import { formatEthSummary } from "shared/lib/money";

const summaryRowClassName =
  "flex items-baseline justify-between gap-4 text-base text-ink";

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
      className="h-fit lg:sticky lg:top-24"
    >
      <h2
        className="border-b border-[#D28A4C]/40 pb-4 text-2xl font-bold text-ink"
        id="cart-summary-heading"
      >
        Resumo da carteira
      </h2>

      <div className="mt-8">
        <PromoCodeForm
          appliedCoupon={appliedCoupon}
          error={couponError}
          isPending={isQuoting}
          onApply={onApplyCoupon}
        />
      </div>

      {quote ? (
        <dl aria-busy={isQuoting} className="mt-8 space-y-5">
          <div className={summaryRowClassName}>
            <dt>Subtotal</dt>
            <dd className="text-xl">{formatEthSummary(quote.subtotalEth)}</dd>
          </div>
          <div className={summaryRowClassName}>
            <dt>Desconto do lançamento</dt>
            <dd>(−) {formatEthSummary(quote.discountEth)}</dd>
          </div>
          <div>
            <div className={summaryRowClassName}>
              <dt>Taxa de rede</dt>
              <dd className="text-xl">
                {formatEthSummary(quote.networkFeeEth)}
              </dd>
            </div>
            <p className="mt-2 text-right text-xs text-[#E89B55]">
              Taxa estimada
            </p>
          </div>
          <div className={`${summaryRowClassName} pt-6 font-bold`}>
            <dt className="text-xl">Total</dt>
            <dd className="text-2xl text-[#E89B55]">
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
        className="mt-8 h-12 w-full rounded-md bg-[#D28A4C] text-base font-bold text-[#140D0A] transition-opacity hover:opacity-90 disabled:opacity-50"
        disabled={!quote || isQuoting}
        onClick={onCheckout}
        type="button"
      >
        Conectar e finalizar
      </button>
      <Link
        className="mt-5 block text-center text-base text-[#E89B55] hover:underline"
        hash="catalog"
        to="/"
      >
        Continuar explorando
      </Link>
    </aside>
  );
};

export { CartSummary };