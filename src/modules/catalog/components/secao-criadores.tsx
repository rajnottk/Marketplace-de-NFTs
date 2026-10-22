import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import imagemMacacoGolaAlta from "assets/images/ape-turtleneck.png";
import imagemMacacoJaquetaVerde from "assets/images/ape-green-jacket.png";
import { ImagemComSkeleton } from "shared/components/molecules/imagem-com-skeleton";
import { Button } from "shared/components/ui/button";

const cardsCriadores = [
  {
    id: "lancamentos-genesis",
    titulo: ["Lançamentos gênesis", "de edição limitada"],
    descricao:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    imagem: imagemMacacoJaquetaVerde,
    textoAlternativo: "Primata com jaqueta college verde e óculos redondos",
  },
  {
    id: "arte-selecionada",
    titulo: ["Arte digital selecionada", "e muito mais"],
    descricao:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    imagem: imagemMacacoGolaAlta,
    textoAlternativo: "Primata com gola alta verde e blazer claro",
  },
] as const;

// Dois círculos do protótipo (Figma), posicionados em relação ao card; o overflow do card recorta só o arco inferior esquerdo.
const CirculosDecorativos = () => (
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

const SecaoCriadores = () => (
  <section
    aria-label="Criadores"
    className="grid gap-6 pb-8 pt-12 lg:grid-cols-2 lg:pb-16"
  >
    {cardsCriadores.map((card) => (
      <article
        aria-labelledby={`card-criadores-${card.id}`}
        className="relative grid overflow-hidden rounded-2xl bg-[#241612] sm:grid-cols-[250px_minmax(0,1fr)] lg:h-[250px]"
        key={card.id}
      >
        <ImagemComSkeleton
          alt={card.textoAlternativo}
          classeContainer="aspect-square w-full rounded-2xl sm:h-[250px] sm:w-[250px]"
          className="h-full w-full scale-110 object-cover object-[50%_35%]"
          height="250"
          loading="lazy"
          src={card.imagem}
          width="250"
        />
        <CirculosDecorativos />
        <div className="flex flex-col items-end justify-center gap-4 px-6 py-5 text-right">
          <h2
            className="text-lg font-bold leading-7 text-ink"
            id={`card-criadores-${card.id}`}
          >
            {card.titulo[0]}
            <br />
            {card.titulo[1]}
          </h2>
          <p className="text-sm leading-6 text-[#CFB28C]">{card.descricao}</p>
          <Button
            className="h-11 bg-[#D28A4C] px-9 text-base font-medium text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90 [&_svg]:size-5"
            nativeButton={false}
            render={<Link to="/criadores" />}
          >
            Explorar
            <ArrowRight />
          </Button>
        </div>
      </article>
    ))}
  </section>
);

export { SecaoCriadores };