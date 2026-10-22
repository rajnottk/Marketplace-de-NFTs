import { useState, type FormEvent } from "react";
import { cn } from "shared/lib/utils";

interface PromoCodeFormProps {
  appliedCoupon: string | null;
  error: string | null;
  isPending: boolean;
  onApply: (coupon: string) => void;
  compactOnMobile?: boolean;
}

const PromoCodeForm = ({
  appliedCoupon,
  error,
  isPending,
  onApply,
  compactOnMobile = false,
}: PromoCodeFormProps) => {
  const [couponInput, setCouponInput] = useState(appliedCoupon ?? "");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(couponInput.trim());
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <label
        className={cn(
          "text-base font-bold text-ink",
          compactOnMobile && "sr-only md:not-sr-only",
        )}
        htmlFor="promo-code"
      >
        Código promocional
      </label>
      <div
        className={cn(
          "mt-3 flex h-11 overflow-hidden rounded-md border border-primary",
          compactOnMobile &&
            "mt-0 h-12 rounded-full border-[#D28A4C]/30 md:mt-3 md:h-11 md:rounded-md md:border-primary",
        )}
      >
        <input
          aria-describedby={
            error || appliedCoupon ? "promo-code-feedback" : undefined
          }
          aria-invalid={Boolean(error)}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 text-sm text-ink placeholder:text-[#B0916A] focus-visible:outline-none",
            compactOnMobile && "text-xs md:text-sm",
          )}
          disabled={isPending}
          id="promo-code"
          onChange={(event) => setCouponInput(() => event.target.value)}
          placeholder="Digite o código promocional..."
          value={couponInput}
        />
        <button
          className={cn(
            "shrink-0 bg-transparent bg-[linear-gradient(93.11deg,rgba(210,138,76,0.54)_-0.94%,#D28A4C_105.02%)] px-7 text-base font-bold text-[#F7F3EC] transition-opacity hover:opacity-90 disabled:opacity-60",
            compactOnMobile &&
              "rounded-full px-4 text-sm md:rounded-none md:px-7 md:text-base",
          )}
          disabled={isPending}
          type="submit"
        >
          Aplicar
        </button>
      </div>
      {error && (
        <p
          className="mt-2 text-xs text-danger"
          id="promo-code-feedback"
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && appliedCoupon && (
        <p
          className="mt-2 text-xs text-accent"
          id="promo-code-feedback"
          role="status"
        >
          Código {appliedCoupon} aplicado.
        </p>
      )}
    </form>
  );
};

export { PromoCodeForm };