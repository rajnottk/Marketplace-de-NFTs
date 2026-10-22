import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "shared/lib/utils";

interface CatalogoPaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

const classeBotaoPaginacao =
  "grid h-10 w-10 place-items-center rounded-md border border-line text-base text-ink transition-colors hover:border-accent hover:text-accent";

const CatalogoPaginacao = ({
  paginaAtual,
  totalPaginas,
  onMudarPagina,
}: CatalogoPaginacaoProps) => {
  const existePaginaAnterior = paginaAtual > 1;
  const existeProximaPagina = paginaAtual < totalPaginas;

  return (
    <nav aria-label="Paginação" className="flex justify-end gap-3">
      {existePaginaAnterior && (
        <button
          aria-label="Página anterior"
          className={classeBotaoPaginacao}
          onClick={() => onMudarPagina(paginaAtual - 1)}
          type="button"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map(
        (pagina) => (
          <button
            aria-current={pagina === paginaAtual ? "page" : undefined}
            aria-label={`Página ${pagina}`}
            className={cn(
              classeBotaoPaginacao,
              pagina === paginaAtual &&
                "border-[#D28A4C] bg-[#D28A4C] font-bold text-[#140D0A] hover:text-[#140D0A]",
            )}
            key={pagina}
            onClick={() => onMudarPagina(pagina)}
            type="button"
          >
            {pagina}
          </button>
        ),
      )}
      <button
        aria-label="Próxima página"
        className={cn(
          classeBotaoPaginacao,
          "disabled:pointer-events-none disabled:opacity-40",
        )}
        disabled={!existeProximaPagina}
        onClick={() => onMudarPagina(paginaAtual + 1)}
        type="button"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export { CatalogoPaginacao };