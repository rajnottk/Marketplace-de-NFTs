import axios from "axios";
import type { ApiError } from "shared/contracts/marketplace";

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError<{ error: ApiError }>(error)) {
    return (
      error.response?.data.error ?? {
        code: "NETWORK_ERROR",
        message: "Não foi possível falar com o marketplace. Tente novamente.",
        retryable: true,
      }
    );
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Ocorreu um erro inesperado.",
    retryable: false,
  };
};