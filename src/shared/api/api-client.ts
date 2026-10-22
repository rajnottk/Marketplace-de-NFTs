import axios, { isAxiosError } from "axios";
import {
  clearSessionToken,
  getSessionToken,
  notifySessionExpired,
} from "shared/lib/session";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 8_000,
});

apiClient.interceptors.request.use((config) => {
  const sessionToken = getSessionToken();
  if (!sessionToken) return config;

  config.headers.set("x-session-token", sessionToken);
  return config;
});

// A 401 on a request that carried a session token means the session expired or was revoked: drop the token and let
// the app clear private data and ask for a new login. Auth endpoints report their own 401s (wrong credentials).
apiClient.interceptors.response.use(undefined, (error: unknown) => {
  const sentToken =
    isAxiosError(error) &&
    Boolean(error.config?.headers?.get?.("x-session-token"));
  const isAuthEndpoint =
    isAxiosError(error) && String(error.config?.url ?? "").startsWith("/auth/");
  if (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    sentToken &&
    !isAuthEndpoint &&
    getSessionToken()
  ) {
    clearSessionToken();
    notifySessionExpired();
  }
  return Promise.reject(error);
});