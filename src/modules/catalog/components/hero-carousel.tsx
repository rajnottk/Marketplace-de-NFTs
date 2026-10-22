import { useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { nftFixtures } from "mocks/fixtures/nfts";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "shared/components/ui/carousel";
import { cn } from "shared/lib/utils";

const heroImageCount = 3;
const autoplayIntervalMs = 4000;
const heroNfts = nftFixtures.slice(0, heroImageCount);

const HeroCarousel = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselPlugins = useMemo(
    () => [Autoplay({ delay: autoplayIntervalMs, stopOnInteraction: false })],
    [],
  );

  useEffect(() => {
    if (!carouselApi) return;
    const updateCurrentIndex = () =>
      setCurrentImageIndex(carouselApi.selectedScrollSnap());
    updateCurrentIndex();
    carouselApi.on("select", updateCurrentIndex);
    return () => {
      carouselApi.off("select", updateCurrentIndex);
    };
  }, [carouselApi]);

  const goToImage = (index: number) => {
    carouselApi?.scrollTo(index);
    carouselApi?.plugins().autoplay?.reset();
  };

  return (
    <>
      <Carousel
        aria-label="Destaques da coleção Kurio"
        className="mx-auto aspect-square w-full max-w-[450px] overflow-hidden rounded-3xl border border-line bg-surface lg:h-[450px] lg:w-[450px]"
        opts={{ loop: true }}
        plugins={carouselPlugins}
        setApi={setCarouselApi}
      >
        <CarouselContent className="h-full">
          {heroNfts.map((nft, index) => (
            <CarouselItem className="h-full" key={nft.id}>
              <ImageWithSkeleton
                alt={nft.name}
                containerClassName="h-full w-full"
                className="h-full w-full object-cover"
                fetchPriority={index === 0 ? "high" : "auto"}
                height="450"
                loading={index === 0 ? "eager" : "lazy"}
                src={nft.imageUrl}
                width="450"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div
        aria-label="Selecionar destaque"
        className="flex justify-center gap-3 lg:absolute lg:bottom-10 lg:left-1/2 lg:-translate-x-1/2"
        role="group"
      >
        {heroNfts.map((nft, index) => (
          <button
            aria-current={index === currentImageIndex}
            aria-label={`Mostrar ${nft.name}`}
            className={cn(
              "h-2.5 w-2.5 rounded-full bg-primary transition-opacity",
              index === currentImageIndex
                ? "opacity-100"
                : "opacity-40 hover:opacity-70",
            )}
            key={nft.id}
            onClick={() => goToImage(index)}
            type="button"
          />
        ))}
      </div>
    </>
  );
};

export { HeroCarousel };