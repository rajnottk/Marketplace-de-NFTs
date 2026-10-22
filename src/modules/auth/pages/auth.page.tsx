import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getApiError } from "shared/api/api-error";
import { login, queryKeys, register } from "shared/api/marketplace.api";
import { Button } from "shared/components/ui/button";
import { Input } from "shared/components/ui/input";
import { saveSessionToken } from "shared/lib/session";
import imagemFundoAutenticacao from "assets/images/ape-green-jacket.png";

const loginFormSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

const registerFormSchema = loginFormSchema
  .extend({
    displayName: z.string().min(2, "Use pelo menos dois caracteres."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

interface AuthFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthPageProps {
  mode: "login" | "register";
}

const AuthPage = ({ mode }: AuthPageProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isRegister = mode === "register";
  const form = useForm<AuthFormValues>({
    defaultValues: {
      displayName: "",
      email: isRegister ? "" : "collector@kurio.test",
      password: isRegister ? "" : "Kurio#2026",
      confirmPassword: "",
    },
  });
  const authMutation = useMutation({
    mutationFn: (values: AuthFormValues) =>
      isRegister
        ? register(values.displayName, values.email, values.password)
        : login(values.email, values.password),
    onSuccess: (session) => {
      saveSessionToken(session.sessionToken);
      queryClient.setQueryData(queryKeys.session, session);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      navigate({ to: "/" });
    },
  });
  const error = authMutation.error ? getApiError(authMutation.error) : null;
  const submit = form.handleSubmit((values) => {
    const validation = (
      isRegister ? registerFormSchema : loginFormSchema
    ).safeParse(values);
    if (validation.success) {
      authMutation.mutate(values);
      return;
    }

    validation.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (
        field === "displayName" ||
        field === "email" ||
        field === "password" ||
        field === "confirmPassword"
      ) {
        form.setError(field, { message: issue.message });
      }
    });
  });

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-10">
      <section className="grid w-full max-w-4xl overflow-hidden rounded-kurio border border-line bg-panel shadow-panel md:grid-cols-[1fr_0.85fr]">
        <div
          className="hidden min-h-[35rem] bg-cover bg-center p-8 md:flex md:flex-col md:justify-end"
          style={{
            backgroundImage: `linear-gradient(rgba(22,11,8,.35),rgba(22,11,8,.75)),url(${imagemFundoAutenticacao})`,
          }}
        >
          <p className="font-display text-3xl font-bold text-ink">KURIO</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-ink/80">
            Colecione arte digital com contexto, autoria e uma carteira sob seu
            controle.
          </p>
        </div>
        <div className="p-6 sm:p-9">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            {isRegister ? "Novo colecionador" : "Bem-vindo de volta"}
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold">
            {isRegister ? "CRIAR CONTA" : "ENTRAR"}
          </h1>
          <p className="mt-3 text-xs leading-5 text-muted">
            {isRegister
              ? "Crie seu perfil e conecte uma carteira quando quiser."
              : "Use as credenciais de demonstração para explorar o fluxo completo."}
          </p>
          <form className="mt-7 space-y-4" onSubmit={submit}>
            {isRegister ? (
              <label className="block text-xs text-muted" htmlFor="displayName">
                Nome de usuário
                <Input
                  aria-describedby={
                    form.formState.errors.displayName
                      ? "displayName-error"
                      : undefined
                  }
                  className="mt-2"
                  id="displayName"
                  {...form.register("displayName")}
                />
              </label>
            ) : null}
            <label className="block text-xs text-muted" htmlFor="email">
              E-mail
              <Input
                aria-describedby={
                  form.formState.errors.email ? "email-error" : undefined
                }
                className="mt-2"
                id="email"
                type="email"
                {...form.register("email")}
              />
            </label>
            <label className="block text-xs text-muted" htmlFor="password">
              Senha
              <Input
                aria-describedby={
                  form.formState.errors.password ? "password-error" : undefined
                }
                className="mt-2"
                id="password"
                type="password"
                {...form.register("password")}
              />
            </label>
            {isRegister ? (
              <label
                className="block text-xs text-muted"
                htmlFor="confirmPassword"
              >
                Confirmar senha
                <Input
                  aria-describedby={
                    form.formState.errors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                  className="mt-2"
                  id="confirmPassword"
                  type="password"
                  {...form.register("confirmPassword")}
                />
              </label>
            ) : null}
            {Object.entries(form.formState.errors).map(([field, issue]) => (
              <p
                className="text-xs text-danger"
                id={`${field}-error`}
                key={field}
                role="alert"
              >
                {issue.message}
              </p>
            ))}
            {error ? (
              <p className="text-xs text-danger" role="alert">
                {error.message}
              </p>
            ) : null}
            <Button
              className="mt-2 w-full"
              disabled={authMutation.isPending}
              size="lg"
              type="submit"
            >
              {isRegister ? "Criar conta" : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">
            {isRegister ? "Já tem uma conta?" : "Ainda não faz parte?"}{" "}
            <Link
              className="text-accent underline"
              to={isRegister ? "/auth/login" : "/auth/register"}
            >
              {isRegister ? "Entrar" : "Criar conta"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export { AuthPage };