import { expect, test } from "@playwright/test";

test("preserva o carrinho do visitante ao autenticar e conclui uma compra", async ({
  page,
}) => {
  await page.goto("/nfts/emerald-ape-042");
  await page.getByRole("button", { name: "Comprar" }).click();
  await expect(
    page.getByRole("link", { name: "Carrinho com 1 itens" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Carrinho com 1 itens" }).click();
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  await page.getByRole("main").getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByLabel("Perfil de Ana Coleciona")).toBeVisible();

  await page.getByRole("link", { name: /Carrinho com 1 itens/ }).click();
  await page.getByPlaceholder("Digite o código promocional...").fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await expect(
    page.getByRole("button", { name: /Tem um código promocional/ }),
  ).toHaveCount(0);
  await expect(page.getByText("Código KURIO10 aplicado.")).toBeVisible();
  await page.getByLabel("Nome de usuário").fill("ana-coleciona");
  await page.getByLabel("Nome do perfil").fill("Coleção da Ana");
  await page.getByRole("combobox", { name: "Tipo de carteira" }).click();
  await page.getByRole("option", { name: "MetaMask", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  await expect(
    page.getByRole("heading", { name: "ARTE GARANTIDA" }),
  ).toBeVisible();
  await expect(page.getByText(/0x/)).toBeVisible();
});