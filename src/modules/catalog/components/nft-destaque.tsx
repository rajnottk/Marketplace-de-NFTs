import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getNftDestaque, queryKeys } from "shared/api/marketplace.api";
import { ImagemComSkeleton } from "shared/components/molecules/imagem-com-skeleton";
import { Skeleton } from "shared/components/ui/skeleton";

const NftDestaque = () => {
  const { data: nftDestaque, isPending: carregandoDestaque } = useQuery({
    queryKey: queryKeys.nftDestaque,
    queryFn: getNftDestaque,
  });

  if (!carregandoDestaque && !nftDestaque) return null;

  return (
    <section
      aria-labelledby="nft-destaque-heading"
      className="overflow-hidden rounded-kurio bg-surface"
    >
      <div className="space-y-2 px-5 pb-3 pt-6">
        <h2
          className="text-xl font-bold uppercase text-accent"
          id="nft-destaque-heading"
        >
          NFT em destaque
        </h2>
        <p className="text-center text-lg font-bold uppercase text-ink">
          Oferta limitada
        </p>
      </div>
      {nftDestaque ? (
        <Link
          aria-label={`Ver ${nftDestaque.name}, NFT em destaque`}
          className="block overflow-hidden rounded-3xl"
          params={{ nftId: nftDestaque.id }}
          to="/nfts/$nftId"
        >
          <ImagemComSkeleton
            alt={nftDestaque.name}
            className="aspect-[3/4] w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            height="400"
            loading="lazy"
            src={nftDestaque.imageUrl}
            width="300"
          />
        </Link>
      ) : (
        <Skeleton
          aria-label="Carregando NFT em destaque"
          className="aspect-[3/4] w-full rounded-3xl"
        />
      )}
    </section>
  );
};

export { NftDestaque };