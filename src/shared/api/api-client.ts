import axios from "axios";
import { getSessionToken } from "shared/lib/session";

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