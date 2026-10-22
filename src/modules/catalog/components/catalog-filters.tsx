import { useState } from "react";
import { Button } from "shared/components/ui/button";
import { Skeleton } from "shared/components/ui/skeleton";
import { Slider } from "shared/components/ui/slider";
import type { CatalogSearch } from "shared/contracts/marketplace";
import { cn } from "shared/lib/utils";

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
const sliderMinPrice = 0;
const sliderMaxPrice = 20;
const ethPriceFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const filterTitleClassName = "text-base font-bold text-foreground";
const filterItemClassName =
  "flex w-full items-center justify-between gap-2 text-left text-sm transition-colors hover:text-foreground";
interface CatalogFiltersProps {
  search: CatalogSearch;
  counts?: Record<string, number>;
  onUpdate: (next: Partial<CatalogSearch>) => void;
  idPrefix: string;
}

const CatalogFilters = ({
  search,
  counts,
  onUpdate,
  idPrefix,
}: CatalogFiltersProps) => {
  const [priceRange, setPriceRange] = useState<number[]>([
    search.minPrice ?? sliderMinPrice,
    search.maxPrice ?? sliderMaxPrice,
  ]);
  return (
    <div className="space-y-8">
      <section aria-labelledby={`${idPrefix}-collections-heading`}>
        <h2
          className={filterTitleClassName}
          id={`${idPrefix}-collections-heading`}
        >
          Coleções
        </h2>
        <div className="mt-5 space-y-4 pl-3">
          {categories.map((category) => (
            <button
              aria-pressed={search.category === category}
              className={cn(
                filterItemClassName,
                search.category === category ? "text-accent" : "text-[#CFB28C]",
              )}
              key={category}
              onClick={() =>
                onUpdate({
                  category: search.category === category ? undefined : category,
                })
              }
              type="button"
            >
              <span>{category}</span>
              {counts ? (
                <span className="font-bold">({counts[category] ?? 0})</span>
              ) : (
                <Skeleton className="h-4 w-7" />
              )}
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby={`${idPrefix}-price-heading`}>
        <h2 className={filterTitleClassName} id={`${idPrefix}-price-heading`}>
          Faixa de preço
        </h2>
        <div className="mt-4 space-y-4">
          <Slider
            aria-labelledby={`${idPrefix}-price-heading`}
            max={sliderMaxPrice}
            min={sliderMinPrice}
            onValueChange={(values) => setPriceRange(() => values as number[])}
            step={0.01}
            value={priceRange}
          />
          <p aria-live="polite" className="pl-3 text-sm text-ink">
            Preço: {ethPriceFormatter.format(priceRange[0])} -{" "}
            {ethPriceFormatter.format(priceRange[1])} ETH
          </p>
          <Button
            className="ml-3 h-9 bg-primary px-3 font-bold text-[#140D0A] shadow-none hover:bg-primary/90"
            onClick={() =>
              onUpdate({
                minPrice:
                  priceRange[0] > sliderMinPrice ? priceRange[0] : undefined,
                maxPrice:
                  priceRange[1] < sliderMaxPrice ? priceRange[1] : undefined,
              })
            }
          >
            Aplicar
          </Button>
        </div>
      </section>
      <section aria-labelledby={`${idPrefix}-networks-heading`}>
        <h2
          className={filterTitleClassName}
          id={`${idPrefix}-networks-heading`}
        >
          Rede
        </h2>
        <div className="mt-5 space-y-4 pl-3">
          {networks.map((network) => (
            <button
              aria-pressed={search.network === network}
              className={cn(
                filterItemClassName,
                search.network === network ? "text-accent" : "text-[#CFB28C]",
              )}
              key={network}
              onClick={() =>
                onUpdate({
                  network: search.network === network ? undefined : network,
                })
              }
              type="button"
            >
              <span>{network}</span>
              {counts ? (
                <span>({counts[network] ?? 0})</span>
              ) : (
                <Skeleton className="h-4 w-7" />
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export { CatalogFilters };