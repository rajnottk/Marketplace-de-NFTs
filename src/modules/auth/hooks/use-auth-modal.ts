import { useContext } from "react";
import { AuthModalContext } from "modules/auth/context/auth-modal.context";

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal requires AuthModalProvider.");
  return context;
};