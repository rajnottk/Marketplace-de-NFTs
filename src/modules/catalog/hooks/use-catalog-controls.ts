import { useContext } from "react";
import { CatalogControlsContext } from "modules/catalog/context/catalog-controls.context";

export const useCatalogControls = () => {
  const context = useContext(CatalogControlsContext);
  if (!context)
    throw new Error(
      "Os controles do catálogo precisam de CatalogControlsProvider.",
    );
  return context;
};