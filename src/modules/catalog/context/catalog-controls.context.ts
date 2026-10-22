import { createContext } from "react";

interface CatalogControlsContextValue {
  isFilterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
}

export const CatalogControlsContext =
  createContext<CatalogControlsContextValue | null>(null);