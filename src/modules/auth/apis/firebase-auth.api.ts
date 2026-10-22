import { FirebaseError } from "firebase/app";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { apiClient } from "shared/api/api-client";
import { getApiError } from "shared/api/api-error";
import type { Session } from "shared/contracts/marketplace";
import { AuthSetupError, getFirebaseAuth } from "shared/lib/firebase";

export type SocialProvider = "google" | "facebook";

export const signInWithSocial = async (providerName: SocialProvider) => {
  const auth = getFirebaseAuth();
  const provider =
    providerName === "google"
      ? new GoogleAuthProvider()
      : new FacebookAuthProvider();
  if (provider instanceof GoogleAuthProvider)
    provider.setCustomParameters({ prompt: "select_account" });
  if (provider instanceof FacebookAuthProvider) provider.addScope("email");
  // Start the popup before the first await to retain the user's click gesture.
  const credential = await signInWithPopup(auth, provider);
  try {
    const idToken = await credential.user.getIdToken();
    const response = await apiClient.post<Session>("/auth/firebase", {
      idToken,
    });
    return response.data;
  } catch (error) {
    await signOut(auth).catch(() => undefined);
    throw error;
  }
};

export const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof AuthSetupError) return error.message;
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      "auth/popup-closed-by-user":
        "O login foi cancelado. Você pode tentar novamente.",
      "auth/cancelled-popup-request": "Uma janela de login já está aberta.",
      "auth/popup-blocked": "Permita pop-ups neste site e tente novamente.",
      "auth/unauthorized-domain":
        "O login social não está disponível neste endereço do site.",
      "auth/operation-not-allowed":
        "Este provedor de login ainda não está disponível.",
      "auth/account-exists-with-different-credential":
        "Este e-mail já usa outro método de acesso. Entre pelo método original.",
      "auth/network-request-failed":
        "Não foi possível conectar ao serviço de login. Tente novamente.",
    };
    return (
      messages[error.code] ??
      "Não foi possível entrar com esta conta. Tente novamente."
    );
  }
  return getApiError(error).message;
};