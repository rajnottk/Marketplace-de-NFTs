import { useEffect, useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import { getNftRecommendations, queryKeys } from "shared/api/marketplace.api";
import { NftCard } from "shared/components/molecules/nft-card";
import { NftCardSkeleton } from "shared/components/molecules/nft-card-skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "shared/components/ui/carousel";
import { cn } from "shared/lib/utils";

const autoplayDelayMs = 5000;
const skeletonCardCount = 5;
// Desktop shows five slides: in a 1200px container each one is a 220px card plus a 25px gutter.
// Smaller screens use a fixed 245px slide so the 220px card always fits.
const slideClassName = "basis-[245px] pl-[25px] lg:basis-1/5";
const trackClassName = "-ml-[25px]";

interface NftRecommendationsCarouselProps {
  /** Reference NFTs: recommendations come from their collections and never include them. */
  nftIds: string[];
  title?: string;
}

const NftRecommendationsCarousel = ({
  nftIds,
  title = "Mais desta coleção",
}: NftRecommendationsCarouselProps) => {
  const headingId = useId();
  const { data: recommendations, isPending: isLoadingRecommendations } =
    useQuery({
      queryKey: queryKeys.nftRecommendations(nftIds),
      queryFn: () => getNftRecommendations(nftIds),
    });
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [snapCount, setSnapCount] = useState(0);
  const [selectedSnapIndex, setSelectedSnapIndex] = useState(0);
  const carouselPlugins = useMemo(
    () => [Autoplay({ delay: autoplayDelayMs })],
    [],
  );

  useEffect(() => {
    if (!carouselApi) return;
    const syncSnaps = () => {
      setSnapCount(carouselApi.scrollSnapList().length);
      setSelectedSnapIndex(carouselApi.selectedScrollSnap());
    };
    syncSnaps();
    carouselApi.on("select", syncSnaps);
    carouselApi.on("reInit", syncSnaps);
    return () => {
      carouselApi.off("select", syncSnaps);
      carouselApi.off("reInit", syncSnaps);
    };
  }, [carouselApi]);

  const goToSnap = (snapIndex: number) => {
    carouselApi?.scrollTo(snapIndex);
    carouselApi?.plugins().autoplay?.reset();
  };

  if (!isLoadingRecommendations && !recommendations?.length) return null;

  return (
    <section aria-labelledby={headingId} className="mt-20">
      <h2
        className="border-b border-[#D28A4C]/40 pb-4 text-xl font-bold text-[#E89B55]"
        id={headingId}
      >
        {title}
      </h2>

      {isLoadingRecommendations ? (
        <div
          aria-busy="true"
          aria-label="Carregando recomendações"
          className={cn("mt-10 flex overflow-hidden", trackClassName)}
        >
          {Array.from({ length: skeletonCardCount }, (_, index) => (
            <div className={cn("shrink-0", slideClassName)} key={index}>
              <NftCardSkeleton size="compact" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <Carousel
            aria-label={title}
            className="mt-10"
            opts={{ align: "start" }}
            plugins={carouselPlugins}
            setApi={setCarouselApi}
          >
            <CarouselContent className={trackClassName}>
              {recommendations?.map((recommendedNft) => (
                <CarouselItem
                  className={slideClassName}
                  key={recommendedNft.id}
                >
                  <NftCard nft={recommendedNft} size="compact" />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {snapCount > 1 && (
            <div
              aria-label="Selecionar posição do carrossel"
              className="mt-8 flex justify-center gap-3"
              role="group"
            >
              {Array.from({ length: snapCount }, (_, snapIndex) => (
                <button
                  aria-current={snapIndex === selectedSnapIndex}
                  aria-label={`Ir para a posição ${snapIndex + 1} de ${snapCount}`}
                  className={cn(
                    "h-3.5 w-3.5 rounded-full border border-[#E89B55] transition-colors",
                    snapIndex === selectedSnapIndex
                      ? "bg-[#E89B55]"
                      : "bg-transparent hover:bg-[#E89B55]/40",
                  )}
                  key={snapIndex}
                  onClick={() => goToSnap(snapIndex)}
                  type="button"
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export { NftRecommendationsCarousel };