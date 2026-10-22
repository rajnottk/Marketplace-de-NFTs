import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Setting4 } from "iconsax-react";
import { useCatalogControls } from "modules/catalog/hooks/use-catalog-controls";
import { Button } from "shared/components/ui/button";

const CatalogFilterTrigger = () => {
  const navigate = useNavigate();
  const currentPath = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { setFilterOpen } = useCatalogControls();
  return (
    <Button
      aria-label="Abrir filtros"
      className="size-11 shrink-0 rounded-xl bg-primary p-0 text-[#140D0A] [&_svg]:size-6"
      onClick={() => {
        setFilterOpen(true);
        if (currentPath !== "/") void navigate({ to: "/" });
      }}
      type="button"
    >
      <Setting4 aria-hidden="true" color="currentColor" variant="Linear" />
    </Button>
  );
};

export { CatalogFilterTrigger };