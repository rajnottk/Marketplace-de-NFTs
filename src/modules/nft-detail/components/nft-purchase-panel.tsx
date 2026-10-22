import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Linkedin,
  Mail,
  Minus,
  Plus,
  Star,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { getApiError } from "shared/api/api-error";
import {
  addToCart,
  getFavorites,
  queryKeys,
  toggleFavorite,
} from "shared/api/marketplace.api";
import type { Nft, NftEdition } from "shared/contracts/marketplace";
import { useSession } from "shared/hooks/use-session";
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
  "grid h-10 w-10 place-items-center rounded-full bg-[#D28A4C] text-[#140D0A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  // Edition selection is visual only: it does not change the price or the cart.
  const [selectedEdition, setSelectedEdition] = useState<NftEdition>(
    nft.edition,
  );
  // There is no purchase limit: only the minimum of one item is enforced.

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavorites,
    enabled: Boolean(session),
  });
  const isFavorite = favoritesQuery.data?.includes(nft.id) ?? false;

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart(nft.id, quantity),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(nft.id),
    onSuccess: (favoriteIds) =>
      queryClient.setQueryData(queryKeys.favorites, favoriteIds),
  });
  const error = addToCartMutation.error
    ? getApiError(addToCartMutation.error)
    : favoriteMutation.error
      ? getApiError(favoriteMutation.error)
      : null;

  const handleFavorite = () => {
    if (!session) {
      navigate({ to: "/auth/login" });
      return;
    }
    favoriteMutation.mutate();
  };

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
    <section aria-labelledby="nft-title" className="min-w-0">
      <h1 className="text-4xl font-bold leading-tight text-ink" id="nft-title">
        {nft.name}
      </h1>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#D28A4C]/60 pb-4">
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

      <h2 className="mt-5 text-base font-bold text-ink">Sobre este NFT:</h2>
      <p className="mt-2 text-sm leading-7 text-[#CFB28C]">{nft.description}</p>

      <h2 className="mt-4 text-base font-bold text-ink" id="edition-heading">
        Edição:
      </h2>
      <div
        aria-labelledby="edition-heading"
        className="mt-3 flex flex-wrap gap-2"
        role="group"
      >
        {editionOptions.map((editionOption) => (
          <button
            aria-pressed={selectedEdition === editionOption.value}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div
          aria-label="Quantidade"
          className="flex items-center gap-4"
          role="group"
        >
          <button
            aria-label="Diminuir quantidade"
            className={quantityButtonClassName}
            disabled={quantity <= 1}
            onClick={() => setQuantity((previous) => Math.max(1, previous - 1))}
            type="button"
          >
            <Minus size={20} />
          </button>
          <output
            aria-live="polite"
            className="min-w-6 text-center text-lg font-bold text-ink"
          >
            {quantity}
          </output>
          <button
            aria-label="Aumentar quantidade"
            className={quantityButtonClassName}
            onClick={() => setQuantity((previous) => previous + 1)}
            type="button"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            className="h-[52px] w-[170px] rounded-md bg-[#D28A4C] text-base font-bold uppercase text-[#140D0A] transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={addToCartMutation.isPending}
            onClick={() => addToCartMutation.mutate()}
            type="button"
          >
            {addToCartMutation.isPending ? "Adicionando..." : "Comprar"}
          </button>
          <button
            aria-pressed={isFavorite}
            className="flex h-[52px] w-[170px] items-center justify-center gap-2 rounded-md border border-[#D28A4C] text-base text-[#E89B55] transition-colors hover:bg-[#D28A4C]/10 disabled:opacity-50"
            disabled={favoriteMutation.isPending}
            onClick={handleFavorite}
            type="button"
          >
            <Heart className={cn(isFavorite && "fill-[#E89B55]")} size={22} />
            {isFavorite ? "Favoritado" : "Favoritar"}
          </button>
        </div>
      </div>
      {addToCartMutation.isSuccess && (
        <p className="mt-3 text-sm text-accent" role="status">
          Adicionado ao carrinho.
        </p>
      )}
      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error.message}
        </p>
      )}

      <dl className="mt-4 space-y-1">
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

      <div className="mt-3 flex items-center gap-3">
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