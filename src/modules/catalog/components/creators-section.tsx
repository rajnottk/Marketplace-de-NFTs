import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import apeTurtleneckImage from "assets/images/ape-turtleneck.png";
import apeGreenJacketImage from "assets/images/ape-green-jacket.png";
import { ImageWithSkeleton } from "shared/components/molecules/image-with-skeleton";
import { Button } from "shared/components/ui/button";

const creatorCards = [
  {
    id: "genesis-drops",
    titleLines: ["Lançamentos gênesis", "de edição limitada"],
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    image: apeGreenJacketImage,
    altText: "Primata com jaqueta college verde e óculos redondos",
  },
  {
    id: "curated-art",
    titleLines: ["Arte digital selecionada", "e muito mais"],
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    image: apeTurtleneckImage,
    altText: "Primata com gola alta verde e blazer claro",
  },
] as const;

// Two circles from the Figma prototype, positioned relative to the card; the card's overflow clips them to the bottom-left arc.
const DecorativeCircles = () => (
  <>
    <span
      aria-hidden
      className="pointer-events-none absolute left-[-199px] top-[134px] h-64 w-64 rounded-full border border-[#D28A4C]"
    />
    <span
      aria-hidden
      className="pointer-events-none absolute left-[-191px] top-[142px] h-64 w-64 rounded-full border-2 border-[#D28A4C]"
    />
  </>
);

const CreatorsSection = () => (
  <section
    aria-label="Criadores"
    className="grid gap-6 pb-8 pt-12 lg:grid-cols-2 lg:pb-16"
  >
    {creatorCards.map((card) => (
      <article
        aria-labelledby={`creator-card-${card.id}`}
        className="relative grid overflow-hidden rounded-2xl bg-[#241612] sm:grid-cols-[250px_minmax(0,1fr)] lg:h-[250px]"
        key={card.id}
      >
        <ImageWithSkeleton
          alt={card.altText}
          containerClassName="aspect-square w-full rounded-2xl sm:h-[250px] sm:w-[250px]"
          className="h-full w-full scale-110 object-cover object-[50%_35%]"
          height="250"
          loading="lazy"
          src={card.image}
          width="250"
        />
        <DecorativeCircles />
        <div className="flex flex-col items-end justify-center gap-4 px-6 py-5 text-right">
          <h2
            className="text-lg font-bold leading-7 text-ink"
            id={`creator-card-${card.id}`}
          >
            {card.titleLines[0]}
            <br />
            {card.titleLines[1]}
          </h2>
          <p className="text-sm leading-6 text-[#CFB28C]">{card.description}</p>
          <Button
            className="h-11 bg-[#D28A4C] px-9 text-base font-medium text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90 [&_svg]:size-5"
            nativeButton={false}
            render={<Link to="/creators" />}
          >
            Explorar
            <ArrowRight />
          </Button>
        </div>
      </article>
    ))}
  </section>
);

export { CreatorsSection };