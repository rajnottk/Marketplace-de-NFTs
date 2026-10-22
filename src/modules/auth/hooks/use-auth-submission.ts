import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  signInWithSocial,
  type SocialProvider,
} from "modules/auth/apis/firebase-auth.api";
import type { AuthFormValues } from "modules/auth/components/auth-form";
import type { AuthMode } from "modules/auth/context/auth-modal.context";
import { login, queryKeys, register } from "shared/api/marketplace.api";
import { saveSessionToken } from "shared/lib/session";

type AuthRequest =
  | { type: "credentials"; values: AuthFormValues }
  | { type: "social"; provider: SocialProvider };
const privateQueryNames = new Set(["cart", "profile", "wallets", "favorites"]);

export const useAuthSubmission = (
  mode: AuthMode,
  onAuthenticated: (mode: AuthMode) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
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
};