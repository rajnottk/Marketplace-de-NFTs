import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/components/ui/select";

interface CheckoutSelectProps {
  id: string;
  name: string;
  label: string;
  options: readonly string[];
  value: string | null;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  compact?: boolean;
  required?: boolean;
  onValueChange: (value: string) => void;
}

const CheckoutSelect = ({
  id,
  name,
  label,
  options,
  value,
  placeholder,
  error,
  disabled,
  compact,
  required,
  onValueChange,
}: CheckoutSelectProps) => (
  <Select
    disabled={disabled}
    items={options.map((option) => ({ label: option, value: option }))}
    name={name}
    onValueChange={(nextValue) => {
      if (nextValue !== null) onValueChange(nextValue);
    }}
    required={required}
    value={value}
  >
    <SelectTrigger
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={Boolean(error)}
      aria-label={label}
      className={`mt-2 h-10 rounded-sm border border-line px-3 text-sm aria-[invalid=true]:border-danger ${compact ? "w-fit" : "w-full"} ${value ? "text-ink" : "text-muted-foreground"}`}
      id={id}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent align="start">
      {options.map((option) => (
        <SelectItem key={option} value={option}>
          {option}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export { CheckoutSelect };