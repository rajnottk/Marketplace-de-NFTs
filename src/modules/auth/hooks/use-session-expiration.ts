import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthModal } from "modules/auth/hooks/use-auth-modal";
import { queryKeys } from "shared/api/marketplace.api";
import { showRealtimeNotice } from "shared/lib/realtime-notices";
import { onSessionExpired } from "shared/lib/session";

const privateQueryKeys = [
  queryKeys.favorites,
  queryKeys.wallets,
  queryKeys.profile,
  ["order"],
];

// When the API reports an expired session: drop private data, keep the current page (context preserved for resuming)
// and ask the user to sign in again.
export const useSessionExpiration = () => {
  const queryClient = useQueryClient();
  const { openAuth } = useAuthModal();

  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.setQueryData(queryKeys.session, null);
        privateQueryKeys.forEach((queryKey) =>
          queryClient.removeQueries({ queryKey }),
        );
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        showRealtimeNotice(
          "Sua sessão expirou. Entre novamente para continuar de onde parou.",
        );
        openAuth();
      }),
    [openAuth, queryClient],
  );
};