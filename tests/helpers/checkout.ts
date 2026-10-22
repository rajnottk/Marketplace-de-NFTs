import { expect, type Page } from "@playwright/test";
import { completeCollectorLogin, openLogin } from "./auth";

// Desktop checkout ready to confirm: signed in, one NFT in the cart, required collector fields filled.
export const prepareDesktopCheckout = async (
  page: Page,
  nftId = "emerald-ape-042",
) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openLogin(page);
  await completeCollectorLogin(page);
  await page.goto(`/nfts/${nftId}`);
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByText("Adicionado ao carrinho.", { exact: true }),
  ).toBeVisible();
  await page.goto("/checkout");
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
  await page.getByLabel("Nome de usuário").fill("ana-coleciona");
  await page.getByLabel("Nome do perfil").fill("Coleção da Ana");
  await page.getByRole("combobox", { name: "Tipo de carteira" }).click();
  await page.getByRole("option", { name: "MetaMask", exact: true }).click();
  await page
    .getByRole("group", { name: "Carteira e rede" })
    .getByRole("radio", { name: "MetaMask", exact: true })
    .check();
};

// Records every order creation request (idempotency key and body).
export const recordOrderRequests = (page: Page) => {
  const requests: { key: string | undefined; body: string | null }[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/orders"
    ) {
      requests.push({
        key: request.headers()["idempotency-key"],
        body: request.postData(),
      });
    }
  });
  return requests;
};