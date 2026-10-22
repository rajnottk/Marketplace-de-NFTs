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
      className="grid grid-cols-[minmax(0,1fr)_120px] items-center overflow-hidden rounded-kurio bg-surface sm:block"
    >
      <div className="space-y-2 p-4 sm:px-5 sm:pb-3 sm:pt-6">
        <h2
          className="text-sm font-bold uppercase text-accent sm:text-xl"
          id="featured-nft-heading"
        >
          NFT em destaque
        </h2>
        <p className="text-xs font-bold uppercase text-ink sm:text-center sm:text-lg">
          Oferta limitada
        </p>
      </div>
      {featuredNft ? (
        <Link
          aria-label={`Ver ${featuredNft.name}, NFT em destaque`}
          className="block overflow-hidden rounded-2xl sm:rounded-3xl"
          params={{ nftId: featuredNft.id }}
          to="/nfts/$nftId"
        >
          <ImageWithSkeleton
            alt={featuredNft.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-300 hover:scale-[1.03] sm:aspect-[3/4]"
            height="400"
            loading="lazy"
            src={featuredNft.imageUrl}
            width="300"
          />
        </Link>
      ) : (
        <Skeleton
          aria-label="Carregando NFT em destaque"
          className="aspect-[4/5] w-full rounded-2xl sm:aspect-[3/4] sm:rounded-3xl"
        />
      )}
    </section>
  );
};

export { FeaturedNft };