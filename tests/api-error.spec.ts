import { expect, test } from "@playwright/test";
import { AxiosError, AxiosHeaders } from "axios";
import { getApiError } from "../src/shared/api/api-error";

test("distingue resposta interna inválida, timeout e falha de conexão", () => {
  const serverError = new AxiosError(
    "Request failed",
    "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    {
      status: 500,
      statusText: "Internal Server Error",
      data: { message: "Internal exception" },
      headers: {},
      config: { headers: new AxiosHeaders() },
    },
  );
  expect(getApiError(serverError).code).toBe("SERVER_ERROR");
  expect(getApiError(serverError).message).toContain("erro interno");
  expect(getApiError(new AxiosError("timeout", "ECONNABORTED")).code).toBe(
    "TIMEOUT",
  );
  expect(
    getApiError(new AxiosError("network failure", "ERR_NETWORK")).code,
  ).toBe("NETWORK_ERROR");
});