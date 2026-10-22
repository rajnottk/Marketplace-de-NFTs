import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { getApiError } from "shared/api/api-error";
import { getCatalog, queryKeys } from "shared/api/marketplace.api";
import { NftCard } from "shared/components/molecules/nft-card";
import { NftCardSkeleton } from "shared/components/molecules/nft-card-skeleton";
import { Button } from "shared/components/ui/button";
import { EmptyState } from "shared/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "shared/components/ui/tabs";
import type { CatalogSearch } from "shared/contracts/marketplace";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "shared/components/ui/dialog";
import { CatalogFilters } from "modules/catalog/components/catalog-filters";
import { CatalogSort } from "modules/catalog/components/catalog-sort";
import { useCatalogControls } from "modules/catalog/hooks/use-catalog-controls";
import { CatalogPagination } from "modules/catalog/components/catalog-pagination";
import { CreatorsSection } from "modules/catalog/components/creators-section";
import { FeaturedNft } from "modules/catalog/components/featured-nft";
import { HeroCarousel } from "modules/catalog/components/hero-carousel";
import { MobileHero } from "modules/catalog/components/mobile-hero";
import { LearnSection } from "modules/catalog/components/learn-section";

const catalogGridClassName =
  "grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-9 sm:gap-y-10 xl:grid-cols-3";
const catalogSkeletonCount = 9;
const catalogTabs = [
  { label: "Todos os NFTs", value: "all" },
  { label: "Novos lançamentos", value: "new" },
  { label: "Em alta", value: "trending" },
] as const;
const catalogTabClassName =
  "h-full flex-none px-0 pb-2 text-sm font-normal text-ink hover:text-accent data-[active]:text-accent sm:text-base after:!bottom-0 after:!h-[3px] after:rounded-t-sm after:bg-accent";
const CatalogPage = () => {
  const { isFilterOpen, setFilterOpen } = useCatalogControls();
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" }) as CatalogSearch;
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

  const filterKey = `${search.minPrice ?? 0}-${search.maxPrice ?? 20}`;
  const totalPages = catalogQuery.data
    ? Math.max(
        1,
        Math.ceil(catalogQuery.data.total / catalogQuery.data.pageSize),
      )
    : 1;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6 md:pt-8 lg:py-12">
      <MobileHero />
      <section className="relative hidden gap-10 border-b border-line pb-10 md:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,450px)] lg:items-center lg:pb-14">
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
        className="grid gap-6 py-4 sm:gap-8 sm:py-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:py-10"
        id="catalog"
      >
        <div className="order-last space-y-6 lg:order-first lg:h-fit">
          <aside className="hidden space-y-8 rounded-kurio border border-line bg-surface p-5 lg:block">
            <CatalogFilters
              counts={filterCounts}
              idPrefix="desktop"
              key={filterKey}
              onUpdate={updateSearch}
              search={search}
            />
          </aside>
          <FeaturedNft />
        </div>

        <div className="min-w-0 space-y-4 sm:space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Tabs
              className="min-w-0 max-w-full overflow-x-auto"
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
                className="h-8 min-w-max gap-3 sm:h-10 sm:gap-6 lg:gap-8"
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
            <div className="hidden sm:block">
              <CatalogSort
                onChange={(sort) => updateSearch({ sort })}
                value={search.sort}
              />
            </div>
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

      <Dialog onOpenChange={setFilterOpen} open={isFilterOpen}>
        <DialogContent className="left-[50dvw] top-[50dvh] max-h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)] max-w-md overflow-y-auto rounded-2xl border border-line bg-[#241612] p-6">
          <DialogTitle className="pr-10">Filtros</DialogTitle>
          <DialogDescription className="mb-6 mt-3 text-[#CFB28C]">
            Refine os NFTs por coleção, preço e rede.
          </DialogDescription>
          <div className="mb-6 sm:hidden">
            <CatalogSort
              onChange={(sort) => updateSearch({ sort })}
              value={search.sort}
            />
          </div>
          <CatalogFilters
            counts={filterCounts}
            idPrefix="mobile"
            key={filterKey}
            onUpdate={updateSearch}
            search={search}
          />
          <DialogClose className="mt-6 h-10 w-full rounded-md bg-primary text-sm font-bold text-[#140D0A]">
            Ver resultados
          </DialogClose>
        </DialogContent>
      </Dialog>
      <CreatorsSection />
      <LearnSection />
    </main>
  );
};

export { CatalogPage };