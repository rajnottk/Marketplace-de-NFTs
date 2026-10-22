import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthForm } from "modules/auth/components/auth-form";
import { SocialLoginButtons } from "modules/auth/components/social-login-buttons";
import { getAuthErrorMessage } from "modules/auth/apis/firebase-auth.api";
import { useAuthSubmission } from "modules/auth/hooks/use-auth-submission";
import type { AuthMode } from "modules/auth/context/auth-modal.context";
import { useSession } from "shared/hooks/use-session";

interface AuthPageProps {
  mode: "login" | "register";
}

const AuthPage = ({ mode }: AuthPageProps) => {
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession();
  const [isReset, setIsReset] = useState(false);
  const currentMode = isReset ? "reset" : mode;
  const mutation = useAuthSubmission(
    currentMode,
    () => void navigate({ to: "/", replace: true }),
  );
  const changeMode = (nextMode: AuthMode) => {
    if (mutation.isPending) return;
    mutation.reset();
    if (nextMode === "reset") {
      setIsReset(() => true);
      return;
    }
    setIsReset(() => false);
    if (nextMode !== mode)
      void navigate({ to: nextMode === "register" ? "/register" : "/login" });
  };

  if (session) return <Navigate replace to="/" />;
  if (isLoading)
    return (
      <main
        className="px-8 py-16 text-center text-sm text-[#CFB28C]"
        role="status"
      >
        Carregando…
      </main>
    );

  return (
    <main className="mx-auto min-h-[calc(100dvh-6.5rem)] w-full max-w-[440px] px-8 pb-10 pt-[clamp(4rem,14dvh,7.5rem)]">
      <Link
        aria-label="Kurio: página inicial"
        className="mx-auto block w-fit text-3xl font-bold tracking-[0.12em] text-ink"
        to="/"
      >
        KURIO
      </Link>
      <div className="mx-auto mt-20 w-full max-w-[320px]">
        <h1 className="mb-7 text-center text-base font-bold text-ink">
          {isReset
            ? "Recuperar senha"
            : mode === "register"
              ? "Criar perfil de colecionador"
              : "Entrar"}
        </h1>
        <AuthForm
          isPending={mutation.isPending}
          key={currentMode}
          mode={currentMode}
          onModeChange={changeMode}
          onSubmit={(values) =>
            mutation.mutate({ type: "credentials", values })
          }
          presentation="page"
        />
        {mutation.error && (
          <p className="mt-4 text-sm leading-6 text-danger" role="alert">
            {getAuthErrorMessage(mutation.error)}
          </p>
        )}
        {!isReset && (
          <>
            <div className="mb-3 mt-8 flex items-center gap-2 text-[10px]">
              <span className="h-px flex-1 bg-line" />
              <span>Ou continue com</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <SocialLoginButtons
              disabled={mutation.isPending}
              onSignIn={(provider) =>
                mutation.mutate({ type: "social", provider })
              }
            />
            <p className="mt-9 text-center text-xs text-[#CFB28C]">
              {mode === "register" ? "Já tem uma conta? " : "Novo na Kurio? "}
              <Link
                className="hover:text-accent"
                to={mode === "register" ? "/login" : "/register"}
              >
                {mode === "register" ? "Entre" : "Crie uma conta"}
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export { AuthPage };