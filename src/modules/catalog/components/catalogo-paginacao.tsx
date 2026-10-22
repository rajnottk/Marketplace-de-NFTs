import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "shared/lib/utils";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const paginationButtonClassName =
  "grid h-10 w-10 place-items-center rounded-md border border-line text-base text-ink transition-colors hover:border-accent hover:text-accent";

const CatalogPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) => {
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <nav aria-label="Paginação" className="flex justify-end gap-3">
      {hasPreviousPage && (
        <button
          aria-label="Página anterior"
          className={paginationButtonClassName}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Página ${page}`}
            className={cn(
              paginationButtonClassName,
              page === currentPage &&
                "border-[#D28A4C] bg-[#D28A4C] font-bold text-[#140D0A] hover:text-[#140D0A]",
            )}
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ),
      )}
      <button
        aria-label="Próxima página"
        className={cn(
          paginationButtonClassName,
          "disabled:pointer-events-none disabled:opacity-40",
        )}
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  );
};

export { CatalogPagination };