import { useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { nftFixtures } from "mocks/fixtures/nfts";
import { ImagemComSkeleton } from "shared/components/molecules/imagem-com-skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "shared/components/ui/carousel";
import { cn } from "shared/lib/utils";

const quantidadeImagensHero = 3;
const intervaloTrocaImagemMs = 4000;
const nftsHero = nftFixtures.slice(0, quantidadeImagensHero);

const HeroCarousel = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [indiceImagemAtual, setIndiceImagemAtual] = useState(0);
  const pluginsCarousel = useMemo(
    () => [
      Autoplay({ delay: intervaloTrocaImagemMs, stopOnInteraction: false }),
    ],
    [],
  );

  useEffect(() => {
    if (!carouselApi) return;
    const atualizarIndice = () =>
      setIndiceImagemAtual(carouselApi.selectedScrollSnap());
    atualizarIndice();
    carouselApi.on("select", atualizarIndice);
    return () => {
      carouselApi.off("select", atualizarIndice);
    };
  }, [carouselApi]);

  const irParaImagem = (indice: number) => {
    carouselApi?.scrollTo(indice);
    carouselApi?.plugins().autoplay?.reset();
  };

  return (
    <>
      <Carousel
        aria-label="Destaques da coleção Kurio"
        className="mx-auto aspect-square w-full max-w-[450px] overflow-hidden rounded-3xl border border-line bg-surface lg:h-[450px] lg:w-[450px]"
        opts={{ loop: true }}
        plugins={pluginsCarousel}
        setApi={setCarouselApi}
      >
        <CarouselContent className="h-full">
          {nftsHero.map((nft, indice) => (
            <CarouselItem className="h-full" key={nft.id}>
              <ImagemComSkeleton
                alt={nft.name}
                classeContainer="h-full w-full"
                className="h-full w-full object-cover"
                fetchPriority={indice === 0 ? "high" : "auto"}
                height="450"
                loading={indice === 0 ? "eager" : "lazy"}
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
        {nftsHero.map((nft, indice) => (
          <button
            aria-current={indice === indiceImagemAtual}
            aria-label={`Mostrar ${nft.name}`}
            className={cn(
              "h-2.5 w-2.5 rounded-full bg-primary transition-opacity",
              indice === indiceImagemAtual
                ? "opacity-100"
                : "opacity-40 hover:opacity-70",
            )}
            key={nft.id}
            onClick={() => irParaImagem(indice)}
            type="button"
          />
        ))}
      </div>
    </>
  );
};

export { HeroCarousel };