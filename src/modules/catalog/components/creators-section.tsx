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
    className="grid gap-4 pb-6 pt-6 sm:gap-6 sm:pb-8 sm:pt-12 lg:grid-cols-2 lg:pb-16"
  >
    {creatorCards.map((card) => (
      <article
        aria-labelledby={`creator-card-${card.id}`}
        className="relative grid grid-cols-[104px_minmax(0,1fr)] overflow-hidden rounded-2xl bg-[#241612] sm:grid-cols-[250px_minmax(0,1fr)] lg:h-[250px]"
        key={card.id}
      >
        <ImageWithSkeleton
          alt={card.altText}
          containerClassName="h-full min-h-40 w-full rounded-2xl sm:h-[250px] sm:w-[250px]"
          className="h-full w-full scale-110 object-cover object-[50%_35%]"
          height="250"
          loading="lazy"
          src={card.image}
          width="250"
        />
        <DecorativeCircles />
        <div className="flex flex-col items-end justify-center gap-2 px-3 py-3 text-right sm:gap-4 sm:px-6 sm:py-5">
          <h2
            className="text-[13px] font-bold leading-[18px] text-ink sm:text-lg sm:leading-7"
            id={`creator-card-${card.id}`}
          >
            {card.titleLines[0]}
            <br />
            {card.titleLines[1]}
          </h2>
          <p className="text-[11px] leading-4 text-[#CFB28C] sm:text-sm sm:leading-6">
            {card.description}
          </p>
          <Button
            className="h-8 bg-[#D28A4C] px-3 text-xs font-medium text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90 sm:h-11 sm:px-9 sm:text-base [&_svg]:size-4 sm:[&_svg]:size-5"
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