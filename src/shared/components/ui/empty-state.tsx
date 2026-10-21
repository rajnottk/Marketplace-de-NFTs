import { SearchX } from "lucide-react";
import { Button } from "shared/components/ui/button";

interface EmptyStateProps {
  actionLabel?: string;
  description: string;
  onAction?: () => void;
  title: string;
}

const EmptyState = ({
  actionLabel,
  description,
  onAction,
  title,
}: EmptyStateProps) => (
  <section className="grid min-h-72 place-items-center rounded-kurio border border-dashed border-line bg-surface p-8 text-center">
    <div className="max-w-sm space-y-3">
      <SearchX aria-hidden="true" className="mx-auto text-accent" size={32} />
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="text-sm leading-6 text-muted">{description}</p>
      {actionLabel && onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </div>
  </section>
);

export { EmptyState };