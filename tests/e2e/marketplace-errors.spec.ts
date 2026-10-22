import { expect, test } from "@playwright/test";
import { completeCollectorLogin, openLogin } from "../helpers/auth";
import { simulateFullMockStorage } from "../helpers/storage";

test("falha de armazenamento não esvazia o carrinho e permite repetir a compra", async ({
  page,
}, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openLogin(page);
  await completeCollectorLogin(page);
  await page.evaluate(async () => {
    const response = await fetch("/api/wallets/wallet-main", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-session-token": localStorage.getItem("kurio.session-token")!,
      },
      body: JSON.stringify({
        label: "Principal",
        address: "0xprincipal",
        network: "Ethereum",
        isPrimary: true,
        connectedState: "connected",
        displayName: "Ana",
        username: "ana",
        profileName: "Coleção Ana",
        walletType: "MetaMask",
        email: "collector@kurio.test",
        ensSuffix: ".eth",
      }),
    });
    if (!response.ok) throw new Error("Não foi possível preparar a carteira.");
  });
  await page.goto("/nfts/emerald-ape-042", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByText("Adicionado ao carrinho.", { exact: true }),
  ).toBeVisible();
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
  if (testInfo.project.name === "desktop") {
    await page.getByLabel("Nome de usuário").fill("ana");
    await page.getByLabel("Nome do perfil").fill("Coleção Ana");
    await page
      .getByRole("combobox", { name: "Tipo de carteira", exact: true })
      .click();
    await page.getByRole("option", { name: "MetaMask", exact: true }).click();
  }
  await expect(page.getByText("1.211 ETH", { exact: true })).toBeVisible();
  const restoreStorage = await simulateFullMockStorage(page);
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível confirmar a compra. Não há espaço disponível no navegador",
  );
  const itemCount = await page.evaluate(async () => {
    const response = await fetch("/api/cart", {
      headers: {
        "x-session-token": localStorage.getItem("kurio.session-token")!,
      },
    });
    const cart = await response.json();
    return cart.items.length;
  });
  expect(itemCount).toBe(1);
  await restoreStorage();
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada", exact: true }),
  ).toBeVisible();
});