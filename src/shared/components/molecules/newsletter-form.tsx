import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { getApiError } from "shared/api/api-error";
import { subscribeToNewsletter } from "shared/api/marketplace.api";
import {
  newsletterSubscriptionSchema,
  type NewsletterSubscription,
} from "shared/contracts/marketplace";

const NewsletterForm = () => {
  const form = useForm<NewsletterSubscription>({
    resolver: zodResolver(newsletterSubscriptionSchema),
    defaultValues: { email: "" },
  });
  const subscribeMutation = useMutation({
    mutationFn: ({ email }: NewsletterSubscription) =>
      subscribeToNewsletter(email),
    onSuccess: () => form.reset(),
  });
  const fieldError = form.formState.errors.email?.message;
  const requestError = subscribeMutation.error
    ? getApiError(subscribeMutation.error).message
    : null;
  const feedbackMessage = fieldError ?? requestError;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => subscribeMutation.mutate(values))}
    >
      <div className="flex h-11 overflow-hidden rounded-md">
        <label className="sr-only" htmlFor="newsletter-email">
          E-mail para receber novidades
        </label>
        <input
          aria-describedby={
            feedbackMessage || subscribeMutation.isSuccess
              ? "newsletter-feedback"
              : undefined
          }
          aria-invalid={Boolean(fieldError)}
          autoComplete="email"
          className="min-w-0 flex-1 bg-[#3B2314] px-4 text-sm text-ink placeholder:text-[#CFB28C]/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary"
          id="newsletter-email"
          placeholder="digite seu e-mail..."
          type="email"
          {...form.register("email")}
        />
        <button
          className="shrink-0 bg-[#D28A4C] px-5 text-base font-bold text-[#140D0A] transition-colors hover:bg-[#D28A4C]/90 disabled:opacity-60"
          disabled={subscribeMutation.isPending}
          type="submit"
        >
          {subscribeMutation.isPending ? "Enviando..." : "Enviar"}
        </button>
      </div>
      {feedbackMessage ? (
        <p
          className="mt-2 text-xs text-danger"
          id="newsletter-feedback"
          role="alert"
        >
          {feedbackMessage}
        </p>
      ) : subscribeMutation.isSuccess ? (
        <p
          className="mt-2 text-xs text-accent"
          id="newsletter-feedback"
          role="status"
        >
          Inscrição confirmada! Você receberá nossas novidades.
        </p>
      ) : null}
    </form>
  );
};

export { NewsletterForm };