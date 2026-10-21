import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import heroApeImage from "assets/images/ape-bucket-hat.png";
import { getApiError } from "shared/api/api-error";
import { getCatalog, queryKeys } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { EmptyState } from "shared/components/ui/empty-state";
import { Input } from "shared/components/ui/input";
import { Skeleton } from "shared/components/ui/skeleton";
import type { CatalogSearch } from "shared/contracts/marketplace";
import { cn } from "shared/lib/utils";
import { NftCard } from "modules/catalog/components/nft-card";

const categories = ["Arte digital", "Fotografia", "Arte 3D", "Generativa"];
const networks = ["Ethereum", "Polygon", "Solana"] as const;
const catalogGridClassName =
  "grid grid-cols-1 justify-items-center gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:justify-items-start";
const catalogSkeletonCount = 6;

const CatalogPage = () => {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" }) as CatalogSearch;
  const [inputValue, setInputValue] = useState(search.q ?? "");
  const deferredQuery = useDeferredValue(inputValue);
  const stableSearch = useMemo(
    () => ({
      ...search,
      q: deferredQuery || undefined,
      page: search.page ?? 1,
    }),
    [deferredQuery, search],
  );
  const catalogQuery = useQuery({
    queryKey: queryKeys.catalog(stableSearch),
    queryFn: () => getCatalog(stableSearch),
  });
  const error = catalogQuery.error ? getApiError(catalogQuery.error) : null;

  const updateSearch = (next: Partial<CatalogSearch>) => {
    navigate({
      to: "/",
      search: { ...search, ...next, page: next.page ?? 1 },
    });
  };

  const handleQueryChange = (value: string) => {
    setInputValue(value);
    updateSearch({ q: value || undefined });
  };

  const totalPages = catalogQuery.data
    ? Math.max(
        1,
        Math.ceil(catalogQuery.data.total / catalogQuery.data.pageSize),
      )
    : 1;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <section className="grid gap-10 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,450px)] lg:items-center lg:pb-14">
        <div className="max-w-2xl space-y-5">
          <p className="text-sm font-medium leading-4 tracking-[0.1em] text-foreground">
            Bem-vindo à Kurio
          </p>
          <h1 className="max-w-[34rem] font-display text-3xl font-bold leading-10 text-foreground sm:text-[43px] sm:leading-[70px]">
            SEJA DONO DO FUTURO DA ARTE DIGITAL
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>
          <Button
            className="h-10 w-[140px] rounded-md bg-[#D28A4C] px-7 py-2.5 font-bold uppercase text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90"
            nativeButton={false}
            render={<a href="#catalog" />}
            size="default"
          >
            Explorar
          </Button>
        </div>
        <div className="mx-auto aspect-square w-full max-w-[450px] overflow-hidden rounded-3xl border border-line bg-surface lg:h-[450px] lg:w-[450px]">
          <img
            alt="Arte em destaque da coleção Kurio"
            className="h-full w-full object-cover"
            height="450"
            src={heroApeImage}
            width="450"
          />
        </div>
      </section>

      <section
        aria-label="Explorar NFTs"
        className="grid gap-8 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-10"
        id="catalog"
      >
        <aside className="space-y-7 rounded-kurio border border-line bg-surface p-5 lg:sticky lg:top-24 lg:h-fit">
          <section aria-labelledby="collections-heading" className="space-y-3">
            <h2
              className="text-sm font-bold text-foreground"
              id="collections-heading"
            >
              Coleções
            </h2>
            {categories.map((category) => (
              <button
                aria-pressed={search.category === category}
                className={cn(
                  "flex w-full items-center justify-between gap-2 text-left text-xs transition-colors hover:text-foreground",
                  search.category === category
                    ? "text-accent"
                    : "text-muted-foreground",
                )}
                key={category}
                onClick={() =>
                  updateSearch({
                    category:
                      search.category === category ? undefined : category,
                  })
                }
                type="button"
              >
                <span>{category}</span>
                <span>({catalogQuery.data?.facets[category] ?? 0})</span>
              </button>
            ))}
          </section>
          <section aria-labelledby="networks-heading" className="space-y-3">
            <h2
              className="text-sm font-bold text-foreground"
              id="networks-heading"
            >
              Rede
            </h2>
            {networks.map((network) => (
              <button
                aria-pressed={search.network === network}
                className={cn(
                  "block text-left text-xs transition-colors hover:text-foreground",
                  search.network === network
                    ? "text-accent"
                    : "text-muted-foreground",
                )}
                key={network}
                onClick={() =>
                  updateSearch({
                    network: search.network === network ? undefined : network,
                  })
                }
                type="button"
              >
                {network}
              </button>
            ))}
          </section>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <label className="relative block max-w-md flex-1">
              <span className="sr-only">Buscar NFTs</span>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-3 text-muted"
                size={17}
              />
              <Input
                className="pl-10"
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="Buscar arte, artista ou coleção"
                value={inputValue}
              />
            </label>
            <label className="text-xs text-muted">
              <span className="sr-only">Ordenar catálogo</span>
              <select
                aria-label="Ordenar catálogo"
                className="h-11 rounded-kurio border border-line bg-surface px-3 text-ink"
                onChange={(event) =>
                  updateSearch({
                    sort: event.target.value as CatalogSearch["sort"],
                  })
                }
                value={search.sort ?? "recent"}
              >
                <option value="recent">Listados recentemente</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </label>
          </div>

          {catalogQuery.isPending ? (
            <div className={catalogGridClassName}>
              {Array.from({ length: catalogSkeletonCount }, (_, index) => (
                <Skeleton
                  className="h-[356px] w-full max-w-[258px]"
                  key={index}
                />
              ))}
            </div>
          ) : null}
          {error ? (
            <EmptyState
              actionLabel="Tentar novamente"
              description={error.message}
              onAction={() => catalogQuery.refetch()}
              title="Não foi possível carregar o catálogo"
            />
          ) : null}
          {catalogQuery.data && !catalogQuery.data.items.length ? (
            <EmptyState
              actionLabel="Limpar filtros"
              description="Tente remover um filtro ou buscar por outro termo."
              onAction={() => {
                setInputValue("");
                updateSearch({
                  category: undefined,
                  network: undefined,
                  q: undefined,
                });
              }}
              title="Nenhuma obra encontrada"
            />
          ) : null}
          {catalogQuery.data?.items.length ? (
            <div className={catalogGridClassName}>
              {catalogQuery.data.items.map((nft) => (
                <NftCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : null}
          {catalogQuery.data && totalPages > 1 ? (
            <nav aria-label="Paginação" className="flex justify-center gap-2">
              <button
                className="rounded-kurio border border-line px-3 py-2 text-xs disabled:opacity-40"
                disabled={(search.page ?? 1) === 1}
                onClick={() => updateSearch({ page: (search.page ?? 1) - 1 })}
                type="button"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    className={cn(
                      "rounded-kurio border px-3 py-2 text-xs",
                      page === (search.page ?? 1)
                        ? "border-accent bg-accent text-canvas"
                        : "border-line",
                    )}
                    key={page}
                    onClick={() => updateSearch({ page })}
                    type="button"
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                className="rounded-kurio border border-line px-3 py-2 text-xs disabled:opacity-40"
                disabled={(search.page ?? 1) === totalPages}
                onClick={() => updateSearch({ page: (search.page ?? 1) + 1 })}
                type="button"
              >
                Próxima
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export { CatalogPage };
