import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AuthMode } from "modules/auth/context/auth-modal.context";
import { PasswordField } from "shared/components/molecules/password-field";
import { Input } from "shared/components/ui/input";
import { cn } from "shared/lib/utils";

const requiredText = z
  .string()
  .trim()
  .min(1, "Este campo precisa ser preenchido.");
const emailSchema = requiredText.pipe(z.email("Informe um e-mail válido."));
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
});
const registerSchema = loginSchema
  .extend({
    displayName: z.string().trim().min(2, "Use pelo menos dois caracteres."),
    password: z.string().min(8, "Use pelo menos oito caracteres."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });
const resetSchema = z.object({ email: emailSchema });
const inputClassName =
  "h-10 rounded-[5px] border-line bg-transparent text-left text-sm text-ink placeholder:text-muted-foreground aria-[invalid=true]:border-danger";

export interface AuthFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthFormProps {
  mode: AuthMode;
  isPending: boolean;
  onSubmit: (values: AuthFormValues) => void;
  onModeChange: (mode: AuthMode) => void;
  presentation?: "modal" | "page";
}

const AuthForm = ({
  mode,
  isPending,
  onSubmit,
  onModeChange,
  presentation = "modal",
}: AuthFormProps) => {
  const isPage = presentation === "page";
  const [isResetSent, setIsResetSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AuthFormValues>({
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  const registerSubmitLabel = isPage ? "Criar perfil" : "Criar conta";
  const fieldProps = (field: keyof AuthFormValues) => ({
    ...register(field, { onChange: () => clearErrors(field) }),
    id: `auth-${field}`,
    className: cn(
      inputClassName,
      isPage && "h-11 rounded-[9px] text-xs placeholder:text-[#B0916A]",
    ),
    disabled: isPending,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `auth-${field}-error` : undefined,
  });
  const fieldError = (field: keyof AuthFormValues) =>
    errors[field] && (
      <p
        className="mt-1.5 text-xs text-danger"
        id={`auth-${field}-error`}
        role="alert"
      >
        {errors[field]?.message}
      </p>
    );
  const submit = handleSubmit((values) => {
    const schema = isReset
      ? resetSchema
      : isRegister
        ? registerSchema
        : loginSchema;
    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue, index) => {
        const field = String(issue.path[0]) as keyof AuthFormValues;
        setError(
          field,
          { message: issue.message },
          { shouldFocus: index === 0 },
        );
      });
      return;
    }
    if (isReset) {
      setIsResetSent(() => true);
      return;
    }
    onSubmit({
      ...values,
      email: values.email.trim(),
      displayName: values.displayName.trim(),
    });
  });

  if (isResetSent)
    return (
      <div className="space-y-6 py-3">
        <p
          className="text-center text-sm leading-6 text-muted-foreground"
          role="status"
        >
          Se o e-mail estiver cadastrado, você receberá um link para redefinir
          sua senha.
        </p>
        <button
          className="w-full text-sm text-accent hover:underline"
          onClick={() => onModeChange("login")}
          type="button"
        >
          Voltar para entrar
        </button>
      </div>
    );

  return (
    <form noValidate onSubmit={submit}>
      <fieldset
        className={cn("space-y-3", isPage && "[&>legend+div]:mt-0")}
        disabled={isPending}
      >
        <legend className="sr-only">
          {isReset
            ? "Recuperar senha"
            : isRegister
              ? "Dados de cadastro"
              : "Dados de acesso"}
        </legend>
        {isRegister && (
          <div>
            <label className="sr-only" htmlFor="auth-displayName">
              Nome de usuário
            </label>
            <Input
              {...fieldProps("displayName")}
              autoComplete="username"
              placeholder="Nome de usuário"
              required
            />
            {fieldError("displayName")}
          </div>
        )}
        <div>
          <label className="sr-only" htmlFor="auth-email">
            E-mail
          </label>
          <Input
            {...fieldProps("email")}
            autoComplete="email"
            placeholder={
              isRegister || isReset ? "Digite seu e-mail" : "contato@email.com"
            }
            required
            type="email"
          />
          {fieldError("email")}
        </div>
        {!isReset && (
          <div>
            <label className="sr-only" htmlFor="auth-password">
              Senha
            </label>
            <PasswordField
              {...fieldProps("password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="Senha"
              required
            />
            {fieldError("password")}
          </div>
        )}
        {isRegister && (
          <div>
            <label className="sr-only" htmlFor="auth-confirmPassword">
              Confirmar senha
            </label>
            <PasswordField
              {...fieldProps("confirmPassword")}
              autoComplete="new-password"
              placeholder="Confirmar senha"
              required
              visibilityLabel="confirmação de senha"
            />
            {fieldError("confirmPassword")}
          </div>
        )}
      </fieldset>
      {!isRegister && !isReset && (
        <button
          className="mt-2 block w-full text-right text-xs text-accent hover:underline"
          disabled={isPending}
          onClick={() => onModeChange("reset")}
          type="button"
        >
          Esqueceu a senha?
        </button>
      )}
      <button
        className={cn(
          "mt-7 h-11 w-full rounded-[5px] bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-accent-strong disabled:opacity-50",
          isPage && "h-14 rounded-[9px]",
        )}
        disabled={isPending}
        type="submit"
      >
        {isPending
          ? "Aguarde…"
          : isReset
            ? "Enviar link de recuperação"
            : isRegister
              ? registerSubmitLabel
              : "Entrar"}
      </button>
      {isReset && (
        <button
          className="mt-5 w-full text-center text-xs text-accent hover:underline"
          onClick={() => onModeChange("login")}
          type="button"
        >
          Voltar para entrar
        </button>
      )}
    </form>
  );
};

export { AuthForm };