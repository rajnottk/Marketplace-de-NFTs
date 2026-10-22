import axios from "axios";
import { z } from "zod";
import type { ApiError } from "shared/contracts/marketplace";

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.string()).optional(),
    retryable: z.boolean().optional(),
  }),
});

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const parsed = errorResponseSchema.safeParse(error.response?.data);
    if (parsed.success) return parsed.data.error;
    if (error.response)
      return {
        code:
          error.response.status >= 500 ? "SERVER_ERROR" : "INVALID_RESPONSE",
        message:
          error.response.status >= 500
            ? "O serviço apresentou um erro interno. Tente novamente em instantes."
            : "O serviço não conseguiu processar a solicitação. Atualize a página e tente novamente.",
        retryable: error.response.status >= 500,
      };
    const isTimeout =
      error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    return {
      code: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      message: isTimeout
        ? "O serviço demorou para responder. Tente novamente em instantes."
        : "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.",
      retryable: true,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Ocorreu um erro inesperado.",
    retryable: false,
  };
};