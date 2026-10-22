import { expect, test } from "@playwright/test";

test("preserva o carrinho do visitante ao autenticar e conclui uma compra", async ({
  page,
}) => {
  await page.goto("/nfts/emerald-ape-042");
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(
    page.getByRole("link", { name: "Carrinho com 1 itens" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Entrar" }).click();
  await page.getByRole("main").getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByLabel("Perfil de Ana Coleciona")).toBeVisible();

  await page.getByRole("link", { name: /Carrinho com 1 itens/ }).click();
  await page.getByPlaceholder("Cupom").fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await page.getByRole("button", { name: "Ir para pagamento" }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  await expect(
    page.getByRole("heading", { name: "ARTE GARANTIDA" }),
  ).toBeVisible();
  await expect(page.getByText(/0x/)).toBeVisible();
});