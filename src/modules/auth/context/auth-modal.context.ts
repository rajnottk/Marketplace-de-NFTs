import { createContext } from "react";

export type AuthMode = "login" | "register" | "reset";

export interface AuthModalContextValue {
  openAuth: (mode?: AuthMode) => void;
}

export const AuthModalContext = createContext<AuthModalContextValue | null>(
  null,
);