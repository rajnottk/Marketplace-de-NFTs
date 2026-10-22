import { useState, type FormEvent } from "react";

interface PromoCodeFormProps {
  appliedCoupon: string | null;
  error: string | null;
  isPending: boolean;
  onApply: (coupon: string) => void;
}

const PromoCodeForm = ({
  appliedCoupon,
  error,
  isPending,
  onApply,
}: PromoCodeFormProps) => {
  const [couponInput, setCouponInput] = useState(appliedCoupon ?? "");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(couponInput.trim());
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <label className="text-base font-bold text-ink" htmlFor="promo-code">
        Código promocional
      </label>
      <div className="mt-3 flex h-11 overflow-hidden rounded-md border border-primary">
        <input
          aria-describedby={
            error || appliedCoupon ? "promo-code-feedback" : undefined
          }
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink placeholder:text-muted-foreground/70 focus-visible:outline-none"
          disabled={isPending}
          id="promo-code"
          onChange={(event) => setCouponInput(() => event.target.value)}
          placeholder="Digite o código promocional..."
          value={couponInput}
        />
        <button
          className="shrink-0 bg-primary px-7 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
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