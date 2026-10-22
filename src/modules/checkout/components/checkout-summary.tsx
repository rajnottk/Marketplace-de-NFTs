import { useState } from "react";
import {
  checkoutPaymentOptions,
  checkoutRadioClassName,
} from "modules/checkout/components/checkout-options";
import { PromoCodeForm } from "shared/components/molecules/promo-code-form";
import type { CartItem, Quote } from "shared/contracts/marketplace";
import { formatEthSummary, multiplyEth } from "shared/lib/money";

interface CheckoutSummaryProps {
  items: CartItem[];
  quote: Quote | null;
  paymentMethod: string;
  isQuoting: boolean;
  isOrdering: boolean;
  couponError: string | null;
  error: string | null;
  onApplyCoupon: (coupon: string) => void;
  onPaymentMethodChange: (method: string) => void;
}

const summaryRowClassName = "flex items-baseline justify-between gap-4 text-sm";

const CheckoutSummary = ({
  items,
  quote,
  paymentMethod,
  isQuoting,
  isOrdering,
  couponError,
  error,
  onApplyCoupon,
  onPaymentMethodChange,
}: CheckoutSummaryProps) => {
  const [isCouponOpen, setIsCouponOpen] = useState(false);

  return (
    <aside
      aria-labelledby="checkout-summary-heading"
      className="min-w-0 self-start"
    >
      <h2 className="text-lg font-bold" id="checkout-summary-heading">
        Seus NFTs
      </h2>
      <div className="mt-2 flex justify-between border-b border-line pb-2 text-sm">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            className="flex items-center gap-2 bg-surface px-1.5 py-1 pr-4 sm:gap-3"
            key={item.id}
          >
            <img
              alt={item.nft.name}
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
              src={item.nft.imageUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-5">{item.nft.name}</p>
              <p className="mt-1 text-xs leading-4 text-muted-foreground">
                ID do token: #{String(item.nft.tokenNumber).padStart(4, "0")}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              (x {item.quantity})
            </span>
            <span className="ml-1 shrink-0 text-base font-bold text-accent">
              {formatEthSummary(multiplyEth(item.unitPriceEth, item.quantity))}
            </span>
          </li>
        ))}
      </ul>
      {!quote?.coupon && !isCouponOpen && (
        <button
          aria-controls="checkout-coupon"
          aria-expanded={false}
          className="mt-3 w-full py-1 text-center text-xs hover:text-accent"
          onClick={() => setIsCouponOpen(() => true)}
          type="button"
        >
          Tem um código promocional? Aplique aqui
        </button>
      )}
      {!quote?.coupon && isCouponOpen && (
        <div className="mt-5" id="checkout-coupon">
          <PromoCodeForm
            appliedCoupon={null}
            error={couponError}
            isPending={isQuoting || isOrdering}
            onApply={onApplyCoupon}
          />
        </div>
      )}
      {quote?.coupon && (
        <p className="mt-4 text-xs text-accent" role="status">
          Código {quote.coupon} aplicado.
        </p>
      )}
      {quote ? (
        <dl aria-busy={isQuoting} className="mt-4 space-y-3">
          <div className={summaryRowClassName}>
            <dt>Subtotal</dt>
            <dd>{formatEthSummary(quote.subtotalEth)}</dd>
          </div>
          <div className={summaryRowClassName}>
            <dt>Desconto do lançamento</dt>
            <dd>(−) {formatEthSummary(quote.discountEth)}</dd>
          </div>
          <div>
            <div className={summaryRowClassName}>
              <dt>Taxa de rede</dt>
              <dd>{formatEthSummary(quote.networkFeeEth)}</dd>
            </div>
            <p className="mt-2 text-center text-xs text-accent">
              Taxa estimada
            </p>
          </div>
          <div
            className={`${summaryRowClassName} border-t border-line px-4 pt-3 font-bold`}
          >
            <dt>Total</dt>
            <dd className="text-base text-accent">
              {formatEthSummary(quote.totalEth)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="py-6 text-sm text-muted-foreground" role="status">
          Calculando resumo…
        </p>
      )}
      <fieldset className="mt-3" disabled={isOrdering || isQuoting}>
        <legend className="mb-4 w-full text-center text-base font-bold">
          Carteira e rede
        </legend>
        <div className="space-y-4">
          {checkoutPaymentOptions.map((option) => (
            <label
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 text-sm ${paymentMethod === option.value ? "border-primary" : "border-line"}`}
              key={option.value}
            >
              <input
                checked={paymentMethod === option.value}
                className={checkoutRadioClassName}
                name="checkout-payment"
                onChange={() => onPaymentMethodChange(option.value)}
                type="radio"
                value={option.value}
              />
              <span
                className={
                  option.isBadge
                    ? "whitespace-nowrap rounded-md border border-primary/30 bg-[#38220F] px-1 py-1 text-[9px] font-bold text-accent"
                    : "flex-1 px-2"
                }
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        aria-busy={isOrdering}
        className="mt-6 h-12 w-full rounded-md bg-primary text-base font-bold text-primary-foreground transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isOrdering}
        form="collector-form"
        type="submit"
      >
        {isOrdering ? "Confirmando…" : "Confirmar compra"}
      </button>
      {isQuoting && (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          Atualizando valores…
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </aside>
  );
};

export { CheckoutSummary };