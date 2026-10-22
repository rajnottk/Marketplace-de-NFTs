import { expect, test, type Page } from "@playwright/test";

// The MSW handlers wait a simulated latency with page timers: pausing the page clock holds every response,
// so the loading states can be asserted deterministically. Resume (not runFor) to release them: TanStack Query
// also schedules its cache notifications with timers, which must keep running after the response arrives.
const pausePageClock = async (page: Page) => {
  await page.clock.install();
  const pageNow = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(pageNow + 1_000));
};

test("mostra skeletons enquanto catálogo, detalhe e resumo do carrinho carregam", async ({
  page,
}) => {
  const catalog = page.getByRole("region", {
    name: "Explorar NFTs",
    exact: true,
  });
  await page.goto("/");
  await expect(catalog.locator("article").first()).toBeVisible();

  await pausePageClock(page);
  await page.getByRole("button", { name: "Página 2", exact: true }).click();
  const catalogSkeleton = catalog.getByLabel("Carregando NFTs");
  await expect(catalogSkeleton).toBeVisible();
  await expect(
    catalogSkeleton.locator('[data-slot="skeleton"]').first(),
  ).toBeVisible();
  await page.clock.resume();
  await expect(catalogSkeleton).toHaveCount(0);
  await expect(catalog.locator("article").first()).toBeVisible();

  // A catalog grid card (the sidebar "featured NFT" link is also labelled "Ver …").
  const firstCard = catalog
    .locator("a:has(article)")
    .filter({ visible: true })
    .first();
  const nftName = (await firstCard.getAttribute("aria-label"))!.replace(
    /^Ver /,
    "",
  );
  await pausePageClock(page);
  await firstCard.click();
  await expect(
    page.getByLabel("Carregando NFT", { exact: true }),
  ).toBeVisible();
  await page.clock.resume();
  await expect(
    page.getByRole("heading", { name: nftName, level: 1 }),
  ).toBeVisible();

  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByText("Adicionado ao carrinho.", { exact: true }),
  ).toBeVisible();

  await pausePageClock(page);
  await page.locator('a[href="/cart"]:visible').first().click();
  await expect(page.getByLabel("Calculando resumo")).toBeVisible();
  await page.clock.resume();
  await expect(page.getByLabel("Calculando resumo")).toHaveCount(0);
  await expect(
    page
      .getByRole("complementary")
      .locator("dt")
      .filter({ hasText: /^Total$/ }),
  ).toBeVisible();
});