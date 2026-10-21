import { useQuery } from "@tanstack/react-query";
import { getSession, queryKeys } from "shared/api/marketplace.api";
import { getSessionToken } from "shared/lib/session";

export const useSession = () =>
  useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    enabled: Boolean(getSessionToken()),
    retry: false,
    staleTime: 60_000,
  });