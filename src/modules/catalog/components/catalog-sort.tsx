import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/components/ui/select";
import type { CatalogSearch } from "shared/contracts/marketplace";

const sortOptions = [
  { label: "Listados recentemente", value: "recent" },
  { label: "Preço (decrescente)", value: "price-desc" },
  { label: "Preço (crescente)", value: "price-asc" },
] as const;
interface CatalogSortProps {
  value: CatalogSearch["sort"];
  onChange: (value: CatalogSearch["sort"]) => void;
}
const CatalogSort = ({ value, onChange }: CatalogSortProps) => (
  <Select
    items={sortOptions}
    onValueChange={(selected) =>
      onChange((selected ?? "recent") as CatalogSearch["sort"])
    }
    value={value ?? "recent"}
  >
    <SelectTrigger
      aria-label="Ordenar catálogo"
      className="max-w-full text-sm text-ink sm:text-base"
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
);

export { CatalogSort };