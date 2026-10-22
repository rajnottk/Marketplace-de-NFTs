import type { ReactNode } from "react";

export const accountInputClassName =
  "h-9 rounded-[3px] border-line bg-transparent text-sm shadow-none aria-[invalid=true]:border-danger";

interface AccountFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  compact?: boolean;
}

const AccountField = ({
  id,
  label,
  required,
  error,
  children,
  compact,
}: AccountFieldProps) => (
  <div className="min-w-0">
    <div className={`flex items-baseline gap-1 ${compact ? "" : "mb-3"}`}>
      <label className="text-sm" htmlFor={id}>
        {label}
      </label>
      {required && (
        <span aria-hidden="true" className="text-lg leading-none text-accent">
          *
        </span>
      )}
    </div>
    {children}
    {error && (
      <p className="mt-1.5 text-xs text-danger" id={`${id}-error`} role="alert">
        {error}
      </p>
    )}
  </div>
);

export { AccountField };