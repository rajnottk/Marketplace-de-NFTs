import { expect, test } from "@playwright/test";

test("combina aba e filtro na URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Em alta" }).click();
  const filtersButton = page.getByRole("button", {
    name: "Abrir filtros",
    exact: true,
  });
  if (await filtersButton.isVisible()) await filtersButton.click();
  await page.getByRole("button", { name: /Polygon/ }).click();
  const resultsButton = page.getByRole("button", {
    name: "Ver resultados",
    exact: true,
  });
  if (await resultsButton.isVisible()) await resultsButton.click();

  await expect(page).toHaveURL(/tab=trending/);
  await expect(page).toHaveURL(/network=Polygon/);
  await expect(
    page.getByRole("heading", { name: "Neon Vessel #552" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042" }),
  ).not.toBeVisible();
});

test("recupera um detalhe por acesso direto e trata uma rota inexistente", async ({
  page,
}) => {
  await page.goto("/nfts/emerald-ape-042");
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042" }),
  ).toBeVisible();
  await page.goto("/nfts/nao-existe");
  await expect(
    page.getByRole("heading", { name: "NFT não encontrado" }),
  ).toBeVisible();
});