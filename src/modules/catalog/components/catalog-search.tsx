import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "shared/components/ui/input";
import type { CatalogSearch } from "shared/contracts/marketplace";

const searchDebounceMs = 300;
interface CatalogSearchInputProps {
  autoFocus?: boolean;
  compact?: boolean;
}

const CatalogSearchInput = ({
  autoFocus,
  compact = false,
}: CatalogSearchInputProps) => {
  const navigate = useNavigate();
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });
  const query = useRouterState({
    select: (state) =>
      state.location.pathname === "/"
        ? String((state.location.search as CatalogSearch).q ?? "")
        : "",
  });
  const [draft, setDraft] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(() => query);
  }, [query]);
  useEffect(() => {
    if (draft.trim() === query) return;
    const timer = setTimeout(() => {
      void navigate({
        to: "/",
        search: (previous: CatalogSearch) => ({
          ...(currentPath === "/" ? previous : {}),
          q: draft.trim() || undefined,
          page: 1,
        }),
        replace: currentPath === "/",
        resetScroll: false,
      });
    }, searchDebounceMs);
    return () => clearTimeout(timer);
  }, [draft, query, currentPath, navigate]);

  return (
    <div className="relative min-w-0 flex-1">
      {!compact && (
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={19}
          strokeWidth={1.5}
        />
      )}
      <Input
        aria-label="Pesquisar NFTs pelo título"
        autoComplete="off"
        autoFocus={autoFocus}
        className={`${compact ? "h-9 rounded-[3px] border-line bg-transparent pl-3 pr-8" : "h-11 rounded-xl border-transparent bg-[#241612] pl-10 pr-10"} text-sm placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none`}
        onChange={(event) => {
          const value = event.target.value;
          setDraft(() => value);
        }}
        placeholder={compact ? "Pesquisar NFTs" : "Explorar coleções"}
        ref={inputRef}
        type="search"
        value={draft}
      />
      {draft && (
        <button
          aria-label="Limpar pesquisa"
          className={`absolute right-0 top-0 grid ${compact ? "h-9 w-8" : "size-11"} place-items-center text-muted-foreground hover:text-accent`}
          onClick={() => {
            setDraft(() => "");
            inputRef.current?.focus();
          }}
          type="button"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
};

export { CatalogSearchInput };