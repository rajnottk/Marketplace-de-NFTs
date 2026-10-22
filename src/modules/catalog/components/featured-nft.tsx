import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getFeaturedNft, queryKeys } from "shared/api/marketplace.api";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import { Skeleton } from "shared/components/ui/skeleton";

const FeaturedNft = () => {
  const { data: featuredNft, isPending: isLoadingFeaturedNft } = useQuery({
    queryKey: queryKeys.featuredNft,
    queryFn: getFeaturedNft,
  });

  if (!isLoadingFeaturedNft && !featuredNft) return null;

  return (
    <section
      aria-labelledby="featured-nft-heading"
      className="overflow-hidden rounded-kurio bg-surface"
    >
      <div className="space-y-2 px-5 pb-3 pt-6">
        <h2
          className="text-xl font-bold uppercase text-accent"
          id="featured-nft-heading"
        >
          NFT em destaque
        </h2>
        <p className="text-center text-lg font-bold uppercase text-ink">
          Oferta limitada
        </p>
      </div>
      {featuredNft ? (
        <Link
          aria-label={`Ver ${featuredNft.name}, NFT em destaque`}
          className="block overflow-hidden rounded-3xl"
          params={{ nftId: featuredNft.id }}
          to="/nfts/$nftId"
        >
          <ImageWithSkeleton
            alt={featuredNft.name}
            className="aspect-[3/4] w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            height="400"
            loading="lazy"
            src={featuredNft.imageUrl}
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

export { FeaturedNft };