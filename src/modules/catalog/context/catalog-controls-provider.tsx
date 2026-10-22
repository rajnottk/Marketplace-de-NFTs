import { useRouterState } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CatalogControlsContext } from "modules/catalog/context/catalog-controls.context";

interface CatalogControlsProviderProps {
  children: ReactNode;
}
const CatalogControlsProvider = ({
  children,
}: CatalogControlsProviderProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });
  useEffect(() => {
    if (currentPath !== "/") setIsFilterOpen(() => false);
  }, [currentPath]);
  const setFilterOpen = useCallback(
    (open: boolean) => setIsFilterOpen(() => open),
    [],
  );
  const value = useMemo(
    () => ({ isFilterOpen, setFilterOpen }),
    [isFilterOpen, setFilterOpen],
  );
  return (
    <CatalogControlsContext.Provider value={value}>
      {children}
    </CatalogControlsContext.Provider>
  );
};

export { CatalogControlsProvider };