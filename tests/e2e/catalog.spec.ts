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

test("ordena por preço, pagina e restaura o estado pelo histórico e no refresh", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "No mobile, ordenação e filtros ficam no modal (coberto em mobile-home.spec.ts).",
  );
  const catalog = page.getByRole("region", {
    name: "Explorar NFTs",
    exact: true,
  });
  // Wait for the skeleton to give way to the cards before reading prices.
  const cardPrices = async () => {
    await expect(catalog.getByLabel("Carregando NFTs")).toHaveCount(0);
    await expect(catalog.locator("article").first()).toBeVisible();
    return (await catalog.locator("article p").allTextContents()).map((text) =>
      Number.parseFloat(text),
    );
  };

  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Ordenar catálogo" })
    .filter({ visible: true })
    .click();
  await page
    .getByRole("option", { name: "Preço (crescente)", exact: true })
    .click();
  await expect(page).toHaveURL(/sort=price-asc/);
  await catalog
    .getByRole("button", { name: /^Ethereum/ })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/network=Ethereum/);

  const firstPagePrices = await cardPrices();
  expect(firstPagePrices.length).toBeGreaterThan(0);
  expect(firstPagePrices).toEqual(
    [...firstPagePrices].sort((left, right) => left - right),
  );

  await page.getByRole("button", { name: "Página 2", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page).toHaveURL(/sort=price-asc/);
  await expect(page).toHaveURL(/network=Ethereum/);
  await expect(
    page.getByRole("button", { name: "Página 2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  const secondPagePrices = await cardPrices();
  expect(Math.min(...secondPagePrices)).toBeGreaterThanOrEqual(
    Math.max(...firstPagePrices),
  );

  await page.reload();
  await expect(
    page.getByRole("button", { name: "Página 2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  expect(await cardPrices()).toEqual(secondPagePrices);

  await page.goBack();
  await expect(page).not.toHaveURL(/page=2/);
  await expect(page).toHaveURL(/network=Ethereum/);
  expect(await cardPrices()).toEqual(firstPagePrices);
  await page.goBack();
  await expect(page).not.toHaveURL(/network=Ethereum/);
  await expect(page).toHaveURL(/sort=price-asc/);
  await page.goForward();
  await expect(page).toHaveURL(/network=Ethereum/);
  await expect(
    catalog
      .getByRole("button", { name: /^Ethereum/ })
      .filter({ visible: true }),
  ).toHaveAttribute("aria-pressed", "true");
});