import { expect, test } from "@playwright/test";
import { completeCollectorLogin } from "../helpers/auth";

test("adapta os detalhes e preserva a galeria desktop", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "mobile")
    await page.setViewportSize({ width: 390, height: 833 });
  await page.goto("/nfts/emerald-ape-042");
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
  if (testInfo.project.name === "desktop") {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Ampliar imagem" }),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Imagens do NFT" }).getByRole("button"),
    ).toHaveCount(4);
    await expect(
      page.getByRole("button", { name: "Comprar", exact: true }),
    ).toBeVisible();
    return;
  }
  await expect(page.getByRole("banner")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navegação mobile" }),
  ).toBeVisible();
  const purchaseActions = page.locator("[data-nft-purchase-actions]");
  const informationPanel = page.locator('section[aria-labelledby="nft-title"]');
  await expect(informationPanel).toHaveCSS("border-bottom-left-radius", "0px");
  await expect(informationPanel).toHaveCSS("border-bottom-right-radius", "0px");
  await expect(informationPanel).toHaveCSS("border-top-left-radius", "31px");
  await expect(purchaseActions).toHaveCSS("border-bottom-left-radius", "0px");
  await expect(purchaseActions).toHaveCSS("border-bottom-right-radius", "0px");
  await expect(
    page.getByRole("button", { name: "Ampliar imagem" }),
  ).toHaveCount(0);
  await expect(page.locator("main img:visible").first()).toHaveAttribute(
    "alt",
    "NFT Emerald Ape #042",
  );
  await expect(
    page.getByRole("link", { name: "Compartilhar no LinkedIn" }),
  ).toHaveCount(0);
  const information = page.locator("#nft-information");
  expect((await information.boundingBox())!.y).toBeGreaterThan(
    page.viewportSize()!.height,
  );
  const image = page.locator("main img:visible").first();
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("nft-mobile.png") });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("link", { name: /^Ver \d+ avaliações, nota/ }).click();
  await expect
    .poll(async () => (await information.boundingBox())!.y)
    .toBeLessThan(100);
  await expect(
    page.getByRole("tab", { name: /Avaliações de colecionadores/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByText("Avaliações em manutenção", { exact: true }),
  ).toBeVisible();
  const recommendations = page.locator(
    '[data-slot="carousel"][aria-label="Mais desta coleção"]',
  );
  await recommendations.scrollIntoViewIfNeeded();
  const track = recommendations.locator('[data-slot="carousel-content"] > div');
  const transform = await track.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await expect
    .poll(
      () => track.evaluate((element) => getComputedStyle(element).transform),
      { timeout: 8000 },
    )
    .not.toBe(transform);
  await page
    .getByRole("button", { name: "Favoritar NFT", exact: true })
    .click();
  await completeCollectorLogin(page);
  await page.goto("/nfts/emerald-ape-042", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("button", { name: "Remover dos favoritos", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Favoritar NFT", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Aumentar quantidade" }).click();
  await page.getByRole("button", { name: "Comprar NFT", exact: true }).click();
  await expect(
    purchaseActions.getByText("Adicionado ao carrinho.", { exact: true }),
  ).toBeVisible();
  const purchaseBounds = (await page
    .getByRole("button", { name: "Comprar NFT", exact: true })
    .boundingBox())!;
  const messageBounds = (await purchaseActions
    .getByText("Adicionado ao carrinho.", { exact: true })
    .boundingBox())!;
  expect(messageBounds.y).toBeGreaterThanOrEqual(
    purchaseBounds.y + purchaseBounds.height,
  );
  await page.getByRole("link", { name: "Ir para o carrinho" }).click();
  await expect(page).toHaveURL("/cart");
  await expect(page.getByRole("banner")).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "Navegação mobile" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/nfts/emerald-ape-042", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Comprar NFT", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("voltar retorna à página anterior ou ao catálogo no acesso direto", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/nfts/emerald-ape-042");
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page
    .getByRole("navigation", { name: "Navegação mobile" })
    .getByRole("link", { name: "Carrinho", exact: true })
    .click();
  await page.getByRole("button", { name: "Explorar NFT aleatório" }).click();
  await expect(page).toHaveURL(/\/nfts\//);
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page).toHaveURL("/cart");
});