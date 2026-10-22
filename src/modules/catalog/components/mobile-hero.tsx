import { useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import { nftFixtures } from "mocks/fixtures/nfts";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "shared/components/ui/carousel";
import { cn } from "shared/lib/utils";

const mobileHeroNfts = nftFixtures.slice(0, 3);
const heroAutoplayIntervalMs = 4000;
const circleClassName =
  "pointer-events-none absolute size-[248px] rounded-full bg-[linear-gradient(160.25deg,rgba(221,154,95,0.37)_22.1%,rgba(210,138,76,0)_87.42%)]";

const MobileHero = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const plugins = useMemo(
    () => [
      Autoplay({ delay: heroAutoplayIntervalMs, stopOnInteraction: false }),
    ],
    [],
  );
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(() => api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      api.plugins().autoplay?.stop();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);
  return (
    <section
      aria-label="Destaques mobile da coleção Kurio"
      className="relative aspect-[1.93] min-h-[184px] overflow-hidden rounded-[28px] bg-[#241612] md:hidden"
    >
      <span
        aria-hidden="true"
        className={cn(circleClassName, "left-[73px] -top-[10px]")}
        data-hero-ellipse="1"
      />
      <span
        aria-hidden="true"
        className={cn(circleClassName, "-left-[80px] -top-[31px]")}
        data-hero-ellipse="2"
      />
      <div className="relative z-10 w-[57%] pb-6 pl-4 pt-2.5" data-hero-copy="">
        <p className="text-[clamp(10px,3vw,14px)] leading-4 text-ink">
          Bem-vindo à Kurio
        </p>
        <h1 className="mt-1 text-[clamp(16px,4.4vw,24px)] font-bold leading-[1.5] text-ink">
          SEJA DONO DA
          <br />
          CULTURA DIGITAL
        </h1>
        <p className="mt-2 text-[clamp(10px,2.8vw,14px)] leading-[1.45] text-[#CFB28C]">
          Descubra NFTs selecionados de criadores do mundo todo.
        </p>
        <a
          aria-label="Explorar NFTs"
          className="mt-1 inline-flex items-center gap-2 text-xs font-bold uppercase text-accent"
          href="#catalog"
        >
          Explorar <ArrowRight aria-hidden="true" size={16} />
        </a>
      </div>
      <Carousel
        aria-label="Imagens de NFTs em destaque"
        className="absolute right-4 top-2.5 aspect-square w-[38%] overflow-hidden rounded-2xl"
        opts={{ loop: true }}
        plugins={plugins}
        setApi={setApi}
      >
        <CarouselContent className="ml-0">
          {mobileHeroNfts.map((nft, index) => (
            <CarouselItem className="pl-0" key={nft.id}>
              <ImageWithSkeleton
                alt={nft.name}
                containerClassName="aspect-square w-full overflow-hidden rounded-2xl"
                className="size-full object-cover"
                fetchPriority={index === 0 ? "high" : "auto"}
                height="248"
                src={nft.imageUrl}
                width="248"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div
        aria-label="Selecionar destaque mobile"
        className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5"
        role="group"
      >
        {mobileHeroNfts.map((nft, index) => (
          <button
            aria-current={index === activeIndex}
            aria-label={`Mostrar destaque ${index + 1}`}
            className={cn(
              "size-2 rounded-full bg-primary transition-opacity",
              index === activeIndex ? "opacity-100" : "opacity-60",
            )}
            key={nft.id}
            onClick={() => {
              api?.scrollTo(index);
              api?.plugins().autoplay?.reset();
            }}
            type="button"
          />
        ))}
      </div>
    </section>
  );
};

export { MobileHero };