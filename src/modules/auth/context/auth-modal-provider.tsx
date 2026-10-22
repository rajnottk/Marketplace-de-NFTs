import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AuthModal } from "modules/auth/components/auth-modal";
import {
  AuthModalContext,
  type AuthMode,
} from "modules/auth/context/auth-modal.context";

interface AuthModalProviderProps {
  children: ReactNode;
}

const AuthModalProvider = ({ children }: AuthModalProviderProps) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode | null>(null);
  const openAuth = useCallback(
    (nextMode: AuthMode = "login") => setMode(() => nextMode),
    [],
  );
  const context = useMemo(() => ({ openAuth }), [openAuth]);

  return (
    <AuthModalContext.Provider value={context}>
      {children}
      {mode && (
        <AuthModal
          mode={mode}
          onAuthenticated={() => {
            setMode(() => null);
            void navigate({ to: "/" });
          }}
          onClose={() => setMode(() => null)}
          onModeChange={(nextMode) => setMode(() => nextMode)}
        />
      )}
    </AuthModalContext.Provider>
  );
};

export { AuthModalProvider };