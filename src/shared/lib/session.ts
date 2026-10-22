const sessionStorageKey = "kurio.session-token";

export const getSessionToken = () =>
  window.localStorage.getItem(sessionStorageKey);

export const saveSessionToken = (token: string) =>
  window.localStorage.setItem(sessionStorageKey, token);

export const clearSessionToken = () =>
  window.localStorage.removeItem(sessionStorageKey);

// Raised by the API client when an authenticated request answers 401 (expired or revoked session).
const sessionExpiredListeners = new Set<() => void>();

export const notifySessionExpired = () =>
  sessionExpiredListeners.forEach((listener) => listener());

export const onSessionExpired = (listener: () => void) => {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
};