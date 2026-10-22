import { Eye, EyeOff } from "lucide-react";
import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { Input } from "shared/components/ui/input";
import { cn } from "shared/lib/utils";

interface PasswordFieldProps extends ComponentProps<typeof Input> {
  visibilityLabel?: string;
}

const PasswordField = ({
  className,
  visibilityLabel = "senha",
  disabled,
  ref,
  onChange,
  onInput,
  onScroll,
  value,
  defaultValue,
  ...props
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [passwordLength, setPasswordLength] = useState(
    () => String(value ?? defaultValue ?? "").length,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const maskRef = useRef<HTMLSpanElement>(null);
  const maskLength =
    value === undefined ? passwordLength : String(value).length;
  const isMasked = !isVisible && maskLength > 0;
  const VisibilityIcon = isVisible ? Eye : EyeOff;

  useImperativeHandle(ref, () => inputRef.current!, []);

  useLayoutEffect(() => {
    if (maskRef.current && inputRef.current)
      maskRef.current.scrollLeft = inputRef.current.scrollLeft;
  }, [maskLength, isVisible]);

  return (
    <div className="relative">
      <Input
        {...props}
        ref={inputRef}
        className={cn("pr-11", className)}
        data-password-masked={isMasked || undefined}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(event) => {
          const length = event.currentTarget.value.length;
          setPasswordLength(() => length);
          onChange?.(event);
        }}
        onInput={(event) => {
          const length = event.currentTarget.value.length;
          setPasswordLength(() => length);
          onInput?.(event);
        }}
        onScroll={(event) => {
          if (maskRef.current)
            maskRef.current.scrollLeft = event.currentTarget.scrollLeft;
          onScroll?.(event);
        }}
        type={isVisible ? "text" : "password"}
        value={value}
      />
      {isMasked && (
        <span
          ref={maskRef}
          aria-hidden="true"
          data-password-mask=""
          className="pointer-events-none absolute inset-y-0 left-3 right-11 flex select-none items-center overflow-hidden whitespace-pre text-base text-ink md:text-sm"
        >
          {"*".repeat(maskLength)}
        </span>
      )}
      <button
        aria-label={`${isVisible ? "Ocultar" : "Mostrar"} ${visibilityLabel}`}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-accent disabled:opacity-50"
        disabled={disabled}
        onClick={() => setIsVisible((previous) => !previous)}
        type="button"
      >
        <VisibilityIcon
          aria-hidden="true"
          className={cn(!isVisible && "-scale-x-100")}
          size={22}
          strokeWidth={1.8}
        />
      </button>
    </div>
  );
};

export { PasswordField };