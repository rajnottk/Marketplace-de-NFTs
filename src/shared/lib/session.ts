const sessionStorageKey = "kurio.session-token";

export const getSessionToken = () =>
  window.localStorage.getItem(sessionStorageKey);

export const saveSessionToken = (token: string) =>
  window.localStorage.setItem(sessionStorageKey, token);

export const clearSessionToken = () =>
  window.localStorage.removeItem(sessionStorageKey);