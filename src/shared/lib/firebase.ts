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

export const signOutFirebase = async () => {
  const auth = getExistingFirebaseAuth();
  if (auth) await signOut(auth);
};