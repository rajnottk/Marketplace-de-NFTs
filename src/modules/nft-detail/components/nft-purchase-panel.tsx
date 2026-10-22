import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Linkedin,
  Mail,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { NftFavoriteButton } from "modules/nft-detail/components/nft-favorite-button";
import { getApiError } from "shared/api/api-error";
import { addToCart, queryKeys } from "shared/api/marketplace.api";
import type { Nft, NftEdition } from "shared/contracts/marketplace";
import { formatEthShort } from "shared/lib/money";
import { cn } from "shared/lib/utils";

const editionOptions: { value: NftEdition; label: string }[] = [
  { value: "1/1", label: "1/1" },
  { value: "1/10", label: "1/10" },
  { value: "1/50", label: "1/50" },
  { value: "open", label: "ABERTA" },
];
const maxStars = 5;
const detailTextClassName = "text-sm leading-7 text-[#CFB28C]";
const quantityButtonClassName =
  "grid h-7 w-5 place-items-center rounded-full bg-[#D28A4C] text-[#140D0A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:h-10 md:w-10";

interface RatingStarsProps {
  rating: number;
}

// Each star is filled proportionally to the rating (e.g. 4.6 → four full stars and one 60% star).
const RatingStars = ({ rating }: RatingStarsProps) => (
  <span aria-hidden className="flex gap-0.5">
    {Array.from({ length: maxStars }, (_, index) => {
      const fillPercent = Math.min(Math.max(rating - index, 0), 1) * 100;
      return (
        <span className="relative h-4 w-4" key={index}>
          <Star className="absolute inset-0 text-[#E89B55]/40" size={16} />
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercent}%` }}
          >
            <Star className="fill-[#E89B55] text-[#E89B55]" size={16} />
          </span>
        </span>
      );
    })}
  </span>
);

interface NftPurchasePanelProps {
  nft: Nft;
}

const NftPurchasePanel = ({ nft }: NftPurchasePanelProps) => {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  // Edition selection is visual only: it does not change the price or the cart.
  const [selectedEdition, setSelectedEdition] = useState<NftEdition>(
    nft.edition,
  );
  // There is no purchase limit: only the minimum of one item is enforced.

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart(nft.id, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
  const error = addToCartMutation.error
    ? getApiError(addToCartMutation.error)
    : null;

  const shareTargets = [
    {
      label: "Compartilhar no LinkedIn",
      href: "https://linkedin.com",
      icon: Linkedin,
      external: true,
      filled: true,
    },
    {
      label: "Compartilhar por e-mail",
      href: `mailto:?subject=${encodeURIComponent(`Veja ${nft.name} na Kurio`)}`,
      icon: Mail,
      external: false,
      filled: false,
    },
    {
      label: "Compartilhar no X (Twitter)",
      href: "https://x.com",
      icon: Twitter,
      external: true,
      filled: true,
    },
  ] satisfies {
    label: string;
    href: string;
    icon: LucideIcon;
    external: boolean;
    filled: boolean;
  }[];

  return (
    <section
      aria-labelledby="nft-title"
      className="relative -mt-14 flex min-w-0 flex-col rounded-[32px] bg-[#241612] px-5 pt-7 md:mt-0 md:block md:rounded-none md:bg-transparent md:p-0"
    >
      <div className="flex items-center justify-between gap-2 md:block">
        <h1
          className="text-lg font-bold leading-tight text-ink md:text-4xl"
          id="nft-title"
        >
          {nft.name}
        </h1>
        <a
          aria-label={`Ver ${nft.reviewCount} avaliações, nota ${nft.rating.toFixed(1)} de 5`}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#D28A4C] px-1.5 py-0.5 text-xs text-ink md:hidden"
          href="#nft-information"
          onClick={(event) => {
            event.preventDefault();
            document
              .getElementById("nft-information")
              ?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
                block: "start",
              });
          }}
        >
          <Star
            aria-hidden
            className="fill-[#E89B55] text-[#E89B55]"
            size={12}
          />
          <span>
            {nft.rating.toFixed(1)}
            <span className="text-[#CFB28C]">({nft.reviewCount})</span>
          </span>
        </a>
      </div>
      <div className="mt-4 hidden flex-wrap items-center justify-between gap-3 border-b border-[#D28A4C]/60 pb-4 md:flex">
        <p className="text-3xl font-bold text-[#E89B55]">
          {formatEthShort(nft.priceEth)}
        </p>
        <p
          aria-label={`Nota ${nft.rating.toFixed(1)} de 5, ${nft.reviewCount} avaliações de colecionadores`}
          className="flex items-center gap-2 text-sm text-ink"
        >
          <RatingStars rating={nft.rating} />
          {nft.reviewCount} avaliações de colecionadores
        </p>
      </div>

      <h2 className="mt-5 hidden text-base font-bold text-ink md:block">
        Sobre este NFT:
      </h2>
      <p className="mt-3 text-xs leading-[1.85] text-[#CFB28C] md:mt-2 md:text-sm md:leading-7">
        {nft.description}
      </p>

      <h2
        className="mt-2 text-sm font-bold text-ink md:mt-4 md:text-base"
        id="edition-heading"
      >
        Edição:
      </h2>
      <div
        aria-labelledby="edition-heading"
        className="mt-1 flex flex-wrap gap-2 md:mt-3"
        role="group"
      >
        {editionOptions.map((editionOption) => (
          <button
            aria-pressed={selectedEdition === editionOption.value}
            className={cn(
              "rounded-full border px-1.5 py-0.5 text-xs transition-colors md:px-3 md:py-1 md:text-sm",
              selectedEdition === editionOption.value
                ? "border-[#D28A4C] font-bold text-[#E89B55]"
                : "border-[#D28A4C]/40 text-[#CFB28C] hover:border-[#D28A4C]",
            )}
            key={editionOption.value}
            onClick={() => setSelectedEdition(editionOption.value)}
            type="button"
          >
            {editionOption.label}
          </button>
        ))}
      </div>

      <div className="order-2 -mx-5 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-[#2F1D15]/30 px-5 pb-7 pt-5 md:order-none md:mx-0 md:mt-6 md:rounded-none md:bg-transparent md:p-0">
        <div
          aria-label="Quantidade"
          className="flex items-center gap-2 md:gap-4"
          role="group"
        >
          <span className="text-xs text-[#CFB28C] md:hidden">Qtd.</span>
          <button
            aria-label="Diminuir quantidade"
            className={quantityButtonClassName}
            disabled={quantity <= 1}
            onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
            type="button"
          >
            <Minus className="size-3 md:size-5" />
          </button>
          <output
            aria-live="polite"
            className="min-w-4 text-center text-base text-ink md:min-w-6 md:text-lg md:font-bold"
          >
            {quantity}
          </output>
          <button
            aria-label="Aumentar quantidade"
            className={quantityButtonClassName}
            onClick={() => setQuantity((previous) => previous + 1)}
            type="button"
          >
            <Plus className="size-3 md:size-5" />
          </button>
        </div>
        <p className="text-lg font-bold text-[#E89B55] md:hidden">
          {formatEthShort(nft.priceEth)}
        </p>
        <div className="flex w-full gap-3 md:w-auto">
          <button
            className="h-14 w-[180px] rounded-full bg-[#D28A4C] text-sm font-bold text-[#140D0A] transition-opacity hover:opacity-90 disabled:opacity-50 md:h-[52px] md:w-[170px] md:rounded-md md:text-base md:uppercase"
            disabled={addToCartMutation.isPending}
            onClick={() => addToCartMutation.mutate()}
            type="button"
          >
            {addToCartMutation.isPending ? (
              "Adicionando..."
            ) : (
              <>
                <span className="md:hidden">Comprar NFT</span>
                <span className="hidden md:inline">Comprar</span>
              </>
            )}
          </button>
          <div className="hidden md:block">
            <NftFavoriteButton nftId={nft.id} />
          </div>
          <Link
            aria-label="Ir para o carrinho"
            className="grid size-14 place-items-center rounded-full border border-[#D28A4C]/20 bg-[#2F1D15] text-[#CFB28C] hover:text-accent md:hidden"
            to="/cart"
          >
            <ShoppingCart aria-hidden size={20} />
          </Link>
        </div>
      </div>
      {addToCartMutation.isSuccess && (
        <p className="order-3 mb-4 mt-3 text-sm text-accent" role="status">
          Adicionado ao carrinho.
        </p>
      )}
      {error && (
        <p className="order-3 mb-4 mt-3 text-sm text-danger" role="alert">
          {error.message}
        </p>
      )}

      <dl className="mt-2 space-y-0.5 md:mt-4 md:space-y-1">
        <div className={cn("flex gap-2", detailTextClassName)}>
          <dt>ID do token:</dt>
          <dd>#{String(nft.tokenNumber).padStart(4, "0")}</dd>
        </div>
        <div className={cn("flex gap-2", detailTextClassName)}>
          <dt>Coleção:</dt>
          <dd>{nft.collection}</dd>
        </div>
        <div className={cn("flex gap-2", detailTextClassName)}>
          <dt>Atributos:</dt>
          <dd>{nft.traits.join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-3 hidden items-center gap-3 md:flex">
        <h2 className="text-base font-bold text-ink">Compartilhar este NFT:</h2>
        <ul className="flex items-center gap-3">
          {shareTargets.map(
            ({ label, href, icon: ShareIcon, external, filled }) => (
              <li key={label}>
                <a
                  aria-label={label}
                  className="text-ink transition-colors hover:text-accent"
                  href={href}
                  {...(external
                    ? { rel: "noopener noreferrer", target: "_blank" }
                    : {})}
                >
                  <ShareIcon
                    aria-hidden
                    fill={filled ? "currentColor" : "none"}
                    size={20}
                  />
                </a>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
};

export { NftPurchasePanel };