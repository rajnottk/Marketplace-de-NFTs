import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getApiError } from "shared/api/api-error";
import { getCatalog, queryKeys } from "shared/api/marketplace.api";
import { NftCard } from "shared/components/molecules/nft-card";
import { NftCardSkeleton } from "shared/components/molecules/nft-card-skeleton";
import { Button } from "shared/components/ui/button";
import { EmptyState } from "shared/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/components/ui/select";
import { Skeleton } from "shared/components/ui/skeleton";
import { Slider } from "shared/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "shared/components/ui/tabs";
import type { CatalogSearch } from "shared/contracts/marketplace";
import { cn } from "shared/lib/utils";
import { CatalogPagination } from "modules/catalog/components/catalog-pagination";
import { CreatorsSection } from "modules/catalog/components/creators-section";
import { FeaturedNft } from "modules/catalog/components/featured-nft";
import { HeroCarousel } from "modules/catalog/components/hero-carousel";
import { LearnSection } from "modules/catalog/components/learn-section";

const categories = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
];
const networks = ["Ethereum", "Polygon", "Solana"] as const;
const catalogGridClassName =
  "grid grid-cols-1 gap-x-9 gap-y-10 sm:grid-cols-2 xl:grid-cols-3";
const catalogSkeletonCount = 9;
const catalogTabs = [
  { label: "Todos os NFTs", value: "all" },
  { label: "Novos lançamentos", value: "new" },
  { label: "Em alta", value: "trending" },
] as const;
const sortOptions = [
  { label: "Listados recentemente", value: "recent" },
  { label: "Preço (decrescente)", value: "price-desc" },
  { label: "Preço (crescente)", value: "price-asc" },
] as const;
const catalogTabClassName =
  "h-full flex-none px-0 pb-2 text-base font-normal text-ink hover:text-accent data-[active]:text-accent after:!bottom-0 after:!h-[3px] after:rounded-t-sm after:bg-accent";
const sliderMinPrice = 0;
const sliderMaxPrice = 20;
const ethPriceFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const filterTitleClassName = "text-base font-bold text-foreground";
const filterItemClassName =
  "flex w-full items-center justify-between gap-2 text-left text-sm transition-colors hover:text-foreground";

const CatalogPage = () => {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" }) as CatalogSearch;
  const [priceRange, setPriceRange] = useState<number[]>([
    search.minPrice ?? sliderMinPrice,
    search.maxPrice ?? sliderMaxPrice,
  ]);
  const stableSearch = useMemo(
    () => ({ ...search, page: search.page ?? 1 }),
    [search],
  );
  // keepPreviousData keeps the filter counts (identical across searches) while the next page loads.
  const catalogQuery = useQuery({
    queryKey: queryKeys.catalog(stableSearch),
    queryFn: () => getCatalog(stableSearch),
    placeholderData: keepPreviousData,
  });
  const isLoadingCatalog =
    catalogQuery.isPending || catalogQuery.isPlaceholderData;
  const filterCounts = catalogQuery.data?.facets;
  const error = catalogQuery.error ? getApiError(catalogQuery.error) : null;

  const updateSearch = (next: Partial<CatalogSearch>) => {
    navigate({
      to: "/",
      search: (previousSearch: CatalogSearch) => ({
        ...previousSearch,
        ...next,
        page: next.page ?? 1,
      }),
      // Filters, tabs, sorting and pagination only change the URL: keep the scroll position.
      resetScroll: false,
    });
  };

  const applyPriceRange = () => {
    const [selectedMinPrice, selectedMaxPrice] = priceRange;
    updateSearch({
      minPrice:
        selectedMinPrice > sliderMinPrice ? selectedMinPrice : undefined,
      maxPrice:
        selectedMaxPrice < sliderMaxPrice ? selectedMaxPrice : undefined,
    });
  };

  const totalPages = catalogQuery.data
    ? Math.max(
        1,
        Math.ceil(catalogQuery.data.total / catalogQuery.data.pageSize),
      )
    : 1;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <section className="relative grid gap-10 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,450px)] lg:items-center lg:pb-14">
        <div className="max-w-2xl space-y-5">
          <p className="text-sm font-medium leading-4 tracking-[0.1em] text-foreground">
            Bem-vindo à Kurio
          </p>
          <h1 className="max-w-[34rem] font-display text-3xl font-bold leading-10 text-foreground sm:text-[43px] sm:leading-[70px]">
            SEJA DONO DO FUTURO DA ARTE DIGITAL
          </h1>
          <p className="max-w-xl text-sm leading-6 text-[#CFB28C]">
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
        <HeroCarousel />
      </section>

      <section
        aria-label="Explorar NFTs"
        className="grid gap-8 py-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:py-10"
        id="catalog"
      >
        <div className="space-y-6 lg:h-fit">
          <aside className="space-y-8 rounded-kurio border border-line bg-surface p-5">
            <section aria-labelledby="collections-heading">
              <h2 className={filterTitleClassName} id="collections-heading">
                Coleções
              </h2>
              <div className="mt-5 space-y-4 pl-3">
                {categories.map((category) => (
                  <button
                    aria-pressed={search.category === category}
                    className={cn(
                      filterItemClassName,
                      search.category === category
                        ? "text-accent"
                        : "text-[#CFB28C]",
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
                    {filterCounts ? (
                      <span className="font-bold">
                        ({filterCounts[category] ?? 0})
                      </span>
                    ) : (
                      <Skeleton className="h-4 w-7" />
                    )}
                  </button>
                ))}
              </div>
            </section>
            <section aria-labelledby="price-heading">
              <h2 className={filterTitleClassName} id="price-heading">
                Faixa de preço
              </h2>
              <div className="mt-4 space-y-4">
                <Slider
                  aria-labelledby="price-heading"
                  defaultValue={[sliderMinPrice, sliderMaxPrice]}
                  max={sliderMaxPrice}
                  min={sliderMinPrice}
                  onValueChange={(values) => setPriceRange(values as number[])}
                  step={0.01}
                  value={priceRange}
                />
                <p aria-live="polite" className="pl-3 text-sm text-ink">
                  Preço: {ethPriceFormatter.format(priceRange[0])} -{" "}
                  {ethPriceFormatter.format(priceRange[1])} ETH
                </p>
                <Button
                  className="ml-3 h-9 bg-[#D28A4C] px-3 font-bold text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90"
                  onClick={applyPriceRange}
                >
                  Aplicar
                </Button>
              </div>
            </section>
            <section aria-labelledby="networks-heading">
              <h2 className={filterTitleClassName} id="networks-heading">
                Rede
              </h2>
              <div className="mt-5 space-y-4 pl-3">
                {networks.map((network) => (
                  <button
                    aria-pressed={search.network === network}
                    className={cn(
                      filterItemClassName,
                      search.network === network
                        ? "text-accent"
                        : "text-[#CFB28C]",
                    )}
                    key={network}
                    onClick={() =>
                      updateSearch({
                        network:
                          search.network === network ? undefined : network,
                      })
                    }
                    type="button"
                  >
                    <span>{network}</span>
                    {filterCounts ? (
                      <span>({filterCounts[network] ?? 0})</span>
                    ) : (
                      <Skeleton className="h-4 w-7" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          </aside>
          <FeaturedNft />
        </div>

        <div className="min-w-0 space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Tabs
              onValueChange={(selectedTab) =>
                updateSearch({
                  tab:
                    selectedTab === "all"
                      ? undefined
                      : (selectedTab as CatalogSearch["tab"]),
                })
              }
              value={search.tab ?? "all"}
            >
              <TabsList
                aria-label="Categorias do catálogo"
                className="h-10 gap-8"
                variant="line"
              >
                {catalogTabs.map((tab) => (
                  <TabsTrigger
                    className={catalogTabClassName}
                    key={tab.value}
                    value={tab.value}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Select
              items={sortOptions}
              onValueChange={(selectedSort) =>
                updateSearch({
                  sort: (selectedSort ?? "recent") as CatalogSearch["sort"],
                })
              }
              value={search.sort ?? "recent"}
            >
              <SelectTrigger
                aria-label="Ordenar catálogo"
                className="text-base text-ink"
              >
                <span>Ordenar por:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoadingCatalog ? (
            <div
              aria-busy="true"
              aria-label="Carregando NFTs"
              className={catalogGridClassName}
            >
              {Array.from({ length: catalogSkeletonCount }, (_, index) => (
                <NftCardSkeleton key={index} />
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
          {!isLoadingCatalog &&
          catalogQuery.data &&
          !catalogQuery.data.items.length ? (
            <EmptyState
              actionLabel="Limpar filtros"
              description="Tente remover um filtro ou trocar de categoria."
              onAction={() => {
                setPriceRange([sliderMinPrice, sliderMaxPrice]);
                updateSearch({
                  category: undefined,
                  network: undefined,
                  q: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  tab: undefined,
                });
              }}
              title="Nenhuma obra encontrada"
            />
          ) : null}
          {!isLoadingCatalog && catalogQuery.data?.items.length ? (
            <div className={catalogGridClassName}>
              {catalogQuery.data.items.map((nft) => (
                <NftCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : null}
          {catalogQuery.data && totalPages > 1 ? (
            <CatalogPagination
              currentPage={search.page ?? 1}
              onPageChange={(page) => updateSearch({ page })}
              totalPages={totalPages}
            />
          ) : null}
        </div>
      </section>

      <CreatorsSection />
      <LearnSection />
    </main>
  );
};

export { CatalogPage };