import { getApps, initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";

const firebaseAppName = "kurio-auth";

export class AuthSetupError extends Error {}

export const getFirebaseAuth = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value?.trim())) {
    throw new AuthSetupError("Login social ainda não está disponível.");
  }
  const app =
    getApps().find((candidate) => candidate.name === firebaseAppName) ??
    initializeApp(config, firebaseAppName);
  const auth = getAuth(app);
  auth.languageCode = "pt-BR";
  return auth;
};

export const getExistingFirebaseAuth = () => {
  const app = getApps().find((candidate) => candidate.name === firebaseAppName);
  return app ? getAuth(app) : null;
};

// After a reload no Firebase app is initialized yet, but the social session is still persisted (IndexedDB):
// initialize it when configured so signOut really clears it.
export const signOutFirebase = async () => {
  let auth = getExistingFirebaseAuth();
  if (!auth) {
    try {
      auth = getFirebaseAuth();
    } catch (error) {
      if (error instanceof AuthSetupError) return;
      throw error;
    }
  }
  await signOut(auth);
};