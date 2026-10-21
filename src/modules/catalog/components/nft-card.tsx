import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  addToCart,
  getFavorites,
  queryKeys,
  toggleFavorite,
} from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Card, CardContent } from "shared/components/ui/card";
import type { Nft } from "shared/contracts/marketplace";
import { getApiError } from "shared/api/api-error";
import { formatEth } from "shared/lib/money";
import { useSession } from "shared/hooks/use-session";

interface NftCardProps {
  nft: Nft;
}

const NftCard = ({ nft }: NftCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavorites,
    enabled: Boolean(session),
  });
  const addMutation = useMutation({
    mutationFn: () => addToCart(nft.id, 1),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(nft.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previousFavorites =
        queryClient.getQueryData<string[]>(queryKeys.favorites) ?? [];
      const nextFavorites = previousFavorites.includes(nft.id)
        ? previousFavorites.filter((favoriteId) => favoriteId !== nft.id)
        : [...previousFavorites, nft.id];
      queryClient.setQueryData(queryKeys.favorites, nextFavorites);
      return { previousFavorites };
    },
    onError: (_error, _variables, context) => {
      if (context)
        queryClient.setQueryData(
          queryKeys.favorites,
          context.previousFavorites,
        );
    },
    onSuccess: (favorites) =>
      queryClient.setQueryData(queryKeys.favorites, favorites),
  });
  const isFavorite = favoritesQuery.data?.includes(nft.id) ?? false;
  const error = addMutation.error
    ? getApiError(addMutation.error)
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

  return (
    <Card className="group h-[356px] w-full max-w-[258px] overflow-hidden rounded-md border-line bg-panel shadow-none transition-transform duration-200 hover:-translate-y-1 hover:border-accent/70">
      <Link
        aria-label={`Ver ${nft.name}`}
        className="block h-[242px]"
        params={{ nftId: nft.id }}
        to="/nfts/$nftId"
      >
        <div className="relative h-full overflow-hidden bg-surface">
          <img
            alt={`NFT ${nft.name}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            height="560"
            loading="lazy"
            src={nft.imageUrl}
            width="560"
          />
          <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-[10px] font-bold text-canvas">
            {nft.rarity.toUpperCase()}
          </span>
        </div>
      </Link>
      <CardContent className="flex h-[114px] flex-col justify-between p-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{nft.collection}</p>
          <h3 className="truncate font-display text-sm font-bold">
            {nft.name}
          </h3>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-sm font-bold text-accent">
              {formatEth(nft.priceEth)}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              aria-label={`Favoritar ${nft.name}`}
              aria-pressed={isFavorite}
              disabled={favoriteMutation.isPending}
              onClick={handleFavorite}
              size="icon"
              variant="secondary"
            >
              <Heart
                className={isFavorite ? "fill-accent text-accent" : undefined}
                size={16}
              />
            </Button>
            <Button
              aria-label={`Adicionar ${nft.name} ao carrinho`}
              disabled={addMutation.isPending}
              onClick={() => addMutation.mutate()}
              size="icon"
            >
              <ShoppingCart size={16} />
            </Button>
          </div>
        </div>
        {error ? (
          <p className="text-xs text-danger" role="alert">
            {error.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export { NftCard };