import { expect, test } from "@playwright/test";
import { completeCollectorLogin } from "../helpers/auth";

test("preserva o carrinho do visitante ao autenticar e conclui uma compra", async ({
  page,
}, testInfo) => {
  await page.goto("/nfts/emerald-ape-042");
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByRole("link", {
      name: "Carrinho com 1 itens",
      includeHidden: true,
    }),
  ).toHaveCount(1);

  await page.locator('a[href="/cart"]:visible').first().click();
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await completeCollectorLogin(page);

  await page.locator('a[href="/cart"]:visible').first().click();
  await page.getByPlaceholder("Digite o código promocional...").fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await expect(
    page.getByRole("button", { name: /Tem um código promocional/ }),
  ).toHaveCount(0);
  const isMobile = testInfo.project.name === "mobile";
  if (isMobile)
    await page
      .getByRole("button", { name: "Trocar carteira", exact: true })
      .click();
  else await expect(page.getByText("Código KURIO10 aplicado.")).toBeVisible();
  await page.getByLabel("Nome de usuário").fill("ana-coleciona");
  await page.getByLabel("Nome do perfil").fill("Coleção da Ana");
  await page.getByRole("combobox", { name: "Tipo de carteira" }).click();
  await page.getByRole("option", { name: "MetaMask", exact: true }).click();
  if (isMobile) {
    await page
      .getByRole("button", { name: "Salvar carteira", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Configurar carteira" }),
    ).toHaveCount(0);
  }
  await page
    .getByRole("group", { name: "Carteira e rede" })
    .getByRole("radio", { name: "MetaMask", exact: true })
    .check();
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  const modal = page.getByRole("dialog", { name: "Compra confirmada" });
  await expect(modal).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(
    modal.getByText("Seus NFTs agora estão na sua carteira"),
  ).toBeVisible();
  await expect(modal.getByText(/^0x[A-F0-9]{4}…[A-F0-9]{4}$/)).toBeVisible();
  await expect(modal.getByText("MetaMask", { exact: true })).toBeVisible();
  await expect(
    modal.getByText(/Transação confirmada na Ethereum/),
  ).toBeVisible();
  await expect(
    modal.getByRole("link", { name: "Ver no Etherscan" }),
  ).toHaveAttribute("href", "https://etherscan.io/");
  await modal.getByRole("button", { name: "Fechar confirmação" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});