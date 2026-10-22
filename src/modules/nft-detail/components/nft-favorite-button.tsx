import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import {
  getFavorites,
  queryKeys,
  toggleFavorite,
} from "shared/api/marketplace.api";
import { useSession } from "shared/hooks/use-session";
import { cn } from "shared/lib/utils";

interface NftFavoriteButtonProps {
  nftId: string;
  compact?: boolean;
}

const NftFavoriteButton = ({
  nftId,
  compact = false,
}: NftFavoriteButtonProps) => {
  const { openAuth } = useAuthModal();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: favoriteIds } = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: getFavorites,
    enabled: Boolean(session),
  });
  const isFavorite = favoriteIds?.includes(nftId) ?? false;
  const mutation = useMutation({
    mutationFn: () => toggleFavorite(nftId),
    onSuccess: (ids) => queryClient.setQueryData(queryKeys.favorites, ids),
  });
  return (
    <div>
      <button
        aria-label={
          compact
            ? isFavorite
              ? "Remover dos favoritos"
              : "Favoritar NFT"
            : undefined
        }
        aria-pressed={isFavorite}
        className={cn(
          "flex items-center justify-center border border-[#D28A4C]/30 text-[#E89B55] transition-colors hover:bg-[#D28A4C]/10 disabled:opacity-50",
          compact
            ? "size-8 rounded-full bg-[#2F1D15]"
            : "h-[52px] w-[170px] gap-2 rounded-md border-[#D28A4C] text-base",
        )}
        disabled={mutation.isPending}
        onClick={() => {
          if (!session) {
            openAuth();
            return;
          }
          mutation.mutate();
        }}
        type="button"
      >
        <Heart
          aria-hidden
          className={cn(isFavorite && "fill-[#E89B55]")}
          size={compact ? 16 : 22}
        />
        {!compact && (isFavorite ? "Favoritado" : "Favoritar")}
      </button>
      {mutation.isError && (
        <p className="mt-2 text-xs text-danger" role="alert">
          Não foi possível atualizar o favorito.
        </p>
      )}
    </div>
  );
};

export { NftFavoriteButton };