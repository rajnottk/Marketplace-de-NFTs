import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getApiError } from "shared/api/api-error";
import { getCatalog, queryKeys } from "shared/api/marketplace.api";
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
import { CatalogoPaginacao } from "modules/catalog/components/catalogo-paginacao";
import { HeroCarousel } from "modules/catalog/components/hero-carousel";
import { NftCard } from "modules/catalog/components/nft-card";
import { NftCardSkeleton } from "modules/catalog/components/nft-card-skeleton";
import { NftDestaque } from "modules/catalog/components/nft-destaque";
import { SecaoAprenda } from "modules/catalog/components/secao-aprenda";
import { SecaoCriadores } from "modules/catalog/components/secao-criadores";

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
const abasCatalogo = [
  { label: "Todos os NFTs", value: "todos" },
  { label: "Novos lançamentos", value: "novos" },
  { label: "Em alta", value: "em-alta" },
] as const;
const opcoesOrdenacao = [
  { label: "Listados recentemente", value: "recent" },
  { label: "Preço (decrescente)", value: "price-desc" },
  { label: "Preço (crescente)", value: "price-asc" },
] as const;
const classeAbaCatalogo =
  "h-full flex-none px-0 pb-2 text-base font-normal text-ink hover:text-accent data-[active]:text-accent after:!bottom-0 after:!h-[3px] after:rounded-t-sm after:bg-accent";
const precoMinimoSlider = 0;
const precoMaximoSlider = 20;
const formatadorPrecoEth = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const classeTituloFiltro = "text-base font-bold text-foreground";
const classeItemFiltro =
  "flex w-full items-center justify-between gap-2 text-left text-sm transition-colors hover:text-foreground";

const CatalogPage = () => {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" }) as CatalogSearch;
  const [faixaPreco, setFaixaPreco] = useState<number[]>([
    search.minPrice ?? precoMinimoSlider,
    search.maxPrice ?? precoMaximoSlider,
  ]);
  const stableSearch = useMemo(
    () => ({ ...search, page: search.page ?? 1 }),
    [search],
  );
  // keepPreviousData mantém as contagens dos filtros (iguais em toda busca) enquanto a nova página carrega.
  const catalogQuery = useQuery({
    queryKey: queryKeys.catalog(stableSearch),
    queryFn: () => getCatalog(stableSearch),
    placeholderData: keepPreviousData,
  });
  const carregandoCatalogo =
    catalogQuery.isPending || catalogQuery.isPlaceholderData;
  const contagensFiltros = catalogQuery.data?.facets;
  const error = catalogQuery.error ? getApiError(catalogQuery.error) : null;

  const updateSearch = (next: Partial<CatalogSearch>) => {
    navigate({
      to: "/",
      search: (buscaAnterior: CatalogSearch) => ({
        ...buscaAnterior,
        ...next,
        page: next.page ?? 1,
      }),
      // Filtros, abas, ordenação e paginação só mudam a URL: manter a posição de rolagem.
      resetScroll: false,
    });
  };

  const aplicarFaixaPreco = () => {
    const [precoMinimoSelecionado, precoMaximoSelecionado] = faixaPreco;
    updateSearch({
      minPrice:
        precoMinimoSelecionado > precoMinimoSlider
          ? precoMinimoSelecionado
          : undefined,
      maxPrice:
        precoMaximoSelecionado < precoMaximoSlider
          ? precoMaximoSelecionado
          : undefined,
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
              <h2 className={classeTituloFiltro} id="collections-heading">
                Coleções
              </h2>
              <div className="mt-5 space-y-4 pl-3">
                {categories.map((category) => (
                  <button
                    aria-pressed={search.category === category}
                    className={cn(
                      classeItemFiltro,
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
                    {contagensFiltros ? (
                      <span className="font-bold">
                        ({contagensFiltros[category] ?? 0})
                      </span>
                    ) : (
                      <Skeleton className="h-4 w-7" />
                    )}
                  </button>
                ))}
              </div>
            </section>
            <section aria-labelledby="price-heading">
              <h2 className={classeTituloFiltro} id="price-heading">
                Faixa de preço
              </h2>
              <div className="mt-4 space-y-4">
                <Slider
                  aria-labelledby="price-heading"
                  defaultValue={[precoMinimoSlider, precoMaximoSlider]}
                  max={precoMaximoSlider}
                  min={precoMinimoSlider}
                  onValueChange={(valores) =>
                    setFaixaPreco(valores as number[])
                  }
                  step={0.01}
                  value={faixaPreco}
                />
                <p aria-live="polite" className="pl-3 text-sm text-ink">
                  Preço: {formatadorPrecoEth.format(faixaPreco[0])} -{" "}
                  {formatadorPrecoEth.format(faixaPreco[1])} ETH
                </p>
                <Button
                  className="ml-3 h-9 bg-[#D28A4C] px-3 font-bold text-[#140D0A] shadow-none hover:bg-[#D28A4C]/90"
                  onClick={aplicarFaixaPreco}
                >
                  Aplicar
                </Button>
              </div>
            </section>
            <section aria-labelledby="networks-heading">
              <h2 className={classeTituloFiltro} id="networks-heading">
                Rede
              </h2>
              <div className="mt-5 space-y-4 pl-3">
                {networks.map((network) => (
                  <button
                    aria-pressed={search.network === network}
                    className={cn(
                      classeItemFiltro,
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
                    {contagensFiltros ? (
                      <span>({contagensFiltros[network] ?? 0})</span>
                    ) : (
                      <Skeleton className="h-4 w-7" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          </aside>
          <NftDestaque />
        </div>

        <div className="min-w-0 space-y-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Tabs
              onValueChange={(abaSelecionada) =>
                updateSearch({
                  aba:
                    abaSelecionada === "todos"
                      ? undefined
                      : (abaSelecionada as CatalogSearch["aba"]),
                })
              }
              value={search.aba ?? "todos"}
            >
              <TabsList
                aria-label="Categorias do catálogo"
                className="h-10 gap-8"
                variant="line"
              >
                {abasCatalogo.map((aba) => (
                  <TabsTrigger
                    className={classeAbaCatalogo}
                    key={aba.value}
                    value={aba.value}
                  >
                    {aba.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Select
              items={opcoesOrdenacao}
              onValueChange={(ordenacaoSelecionada) =>
                updateSearch({
                  sort: (ordenacaoSelecionada ??
                    "recent") as CatalogSearch["sort"],
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
                {opcoesOrdenacao.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {carregandoCatalogo ? (
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
          {!carregandoCatalogo &&
          catalogQuery.data &&
          !catalogQuery.data.items.length ? (
            <EmptyState
              actionLabel="Limpar filtros"
              description="Tente remover um filtro ou trocar de categoria."
              onAction={() => {
                setFaixaPreco([precoMinimoSlider, precoMaximoSlider]);
                updateSearch({
                  category: undefined,
                  network: undefined,
                  q: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  aba: undefined,
                });
              }}
              title="Nenhuma obra encontrada"
            />
          ) : null}
          {!carregandoCatalogo && catalogQuery.data?.items.length ? (
            <div className={catalogGridClassName}>
              {catalogQuery.data.items.map((nft) => (
                <NftCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : null}
          {catalogQuery.data && totalPages > 1 ? (
            <CatalogoPaginacao
              onMudarPagina={(pagina) => updateSearch({ page: pagina })}
              paginaAtual={search.page ?? 1}
              totalPaginas={totalPages}
            />
          ) : null}
        </div>
      </section>

      <SecaoCriadores />
      <SecaoAprenda />
    </main>
  );
};

export { CatalogPage };