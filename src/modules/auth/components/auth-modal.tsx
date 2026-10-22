import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  getAuthErrorMessage,
  signInWithSocial,
  type SocialProvider,
} from "modules/auth/apis/firebase-auth.api";
import {
  AuthForm,
  type AuthFormValues,
} from "modules/auth/components/auth-form";
import { SocialLoginButtons } from "modules/auth/components/social-login-buttons";
import type { AuthMode } from "modules/auth/context/auth-modal.context";
import { login, queryKeys, register } from "shared/api/marketplace.api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "shared/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "shared/components/ui/tabs";
import { saveSessionToken } from "shared/lib/session";

interface AuthModalProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onAuthenticated: (mode: AuthMode) => void;
}

type AuthRequest =
  | { type: "credentials"; values: AuthFormValues }
  | { type: "social"; provider: SocialProvider };
const descriptions: Record<AuthMode, string> = {
  login: "Entre para gerenciar sua carteira, coleção e perfil de criador.",
  register:
    "Crie seu perfil de colecionador e conecte uma carteira quando quiser.",
  reset: "Informe seu e-mail para receber um link de recuperação de senha.",
};
const privateQueryNames = new Set(["cart", "profile", "wallets", "favorites"]);
const tabClassName =
  "px-0 text-lg font-medium text-ink after:hidden hover:text-accent data-[active]:text-accent";

const AuthModal = ({
  mode,
  onModeChange,
  onClose,
  onAuthenticated,
}: AuthModalProps) => {
  const queryClient = useQueryClient();
  const authMutation = useMutation({
    mutationFn: (request: AuthRequest) => {
      if (request.type === "social") return signInWithSocial(request.provider);
      const { displayName, email, password } = request.values;
      return mode === "register"
        ? register(displayName, email, password)
        : login(email, password);
    },
    onSuccess: async (session) => {
      await queryClient.cancelQueries({
        predicate: (query) => privateQueryNames.has(String(query.queryKey[0])),
      });
      saveSessionToken(session.sessionToken);
      for (const key of [
        queryKeys.profile,
        queryKeys.wallets,
        queryKeys.favorites,
      ])
        queryClient.removeQueries({ queryKey: key });
      queryClient.setQueryData(queryKeys.session, session);
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      onAuthenticated(mode);
    },
  });
  const changeMode = (nextMode: AuthMode) => {
    if (authMutation.isPending) return;
    authMutation.reset();
    onModeChange(nextMode);
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen && !authMutation.isPending) onClose();
      }}
      open
    >
      <DialogContent
        className="left-[50dvw] top-[50dvh] max-h-[calc(100dvh-2rem)] w-[calc(100dvw-2rem)] max-w-[440px] overflow-y-auto rounded-lg border-b-8 border-primary bg-[#241612] pb-16 text-ink"
        overlayClassName="bg-[#140D0A]/60"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {mode === "register"
            ? "Criar conta"
            : mode === "reset"
              ? "Recuperar senha"
              : "Entrar na Kurio"}
        </DialogTitle>
        <DialogClose
          aria-label="Fechar autenticação"
          className="absolute right-3 top-3 z-10 grid h-6 w-6 place-items-center text-accent hover:text-ink disabled:opacity-50"
          disabled={authMutation.isPending}
        >
          <X aria-hidden="true" size={18} strokeWidth={1.5} />
        </DialogClose>
        <Tabs
          className="items-center pt-9"
          onValueChange={(value) => {
            if (value === "login" || value === "register") changeMode(value);
          }}
          value={mode === "register" ? "register" : "login"}
        >
          <TabsList className="gap-2" variant="line">
            <TabsTrigger
              className={tabClassName}
              disabled={authMutation.isPending}
              onClick={() => changeMode("login")}
              value="login"
            >
              Entrar
            </TabsTrigger>
            <span aria-hidden="true" className="h-5 w-px bg-primary" />
            <TabsTrigger
              className={tabClassName}
              disabled={authMutation.isPending}
              value="register"
            >
              Criar conta
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <DialogDescription className="mx-auto mt-6 max-w-sm px-6 text-center text-xs leading-4 text-ink">
          {descriptions[mode]}
        </DialogDescription>
        <div className="mx-auto mt-5 w-[calc(100%-3rem)] sm:w-[70%]">
          <AuthForm
            isPending={authMutation.isPending}
            key={mode}
            mode={mode}
            onModeChange={changeMode}
            onSubmit={(values) =>
              authMutation.mutate({ type: "credentials", values })
            }
          />
          {authMutation.error && (
            <p className="mt-4 text-xs leading-5 text-danger" role="alert">
              {getAuthErrorMessage(authMutation.error)}
            </p>
          )}
        </div>
        {mode !== "reset" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs">
              <span className="h-px flex-1 bg-line" />
              <span>Ou continue com</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="mx-auto w-[calc(100%-3rem)] sm:w-[70%]">
              <SocialLoginButtons
                disabled={authMutation.isPending}
                onSignIn={(provider) =>
                  authMutation.mutate({ type: "social", provider })
                }
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { AuthModal };