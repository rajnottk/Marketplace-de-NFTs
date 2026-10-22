import { expect, test, type Page } from "@playwright/test";

// Stable visual baselines: fixed date (the mock catalog order depends on listing dates relative to "now"),
// reduced motion, fixed timezone/locale, fonts and visible images loaded, autoplay carousels masked.
const fixedNow = new Date("2026-10-20T12:00:00-03:00");

test.use({
  reducedMotion: "reduce",
  timezoneId: "America/Sao_Paulo",
  locale: "pt-BR",
});

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: fixedNow });
});

const waitForStablePage = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.locator('[aria-busy="true"]').filter({ visible: true }),
  ).toHaveCount(0);
  await page.waitForFunction(() =>
    [...document.images]
      .filter((image) => {
        const bounds = image.getBoundingClientRect();
        return (
          bounds.width > 0 &&
          bounds.bottom > 0 &&
          bounds.top < window.innerHeight
        );
      })
      .every(
        (image) =>
          image.complete &&
          image.naturalWidth > 0 &&
          getComputedStyle(image).opacity === "1",
      ),
  );
};

const expectScreenshot = async (page: Page, name: string) => {
  await waitForStablePage(page);
  await expect(page).toHaveScreenshot(name, {
    animations: "disabled",
    // Autoplay carousels.
    mask: [page.locator('[data-slot="carousel"]')],
    maxDiffPixelRatio: 0.02,
  });
};

// Runs inside the page so requests go through the MSW handlers (waits until the mocks have started).
const prepareCart = async (page: Page, { signIn }: { signIn: boolean }) => {
  await page.waitForFunction(() => "kurioMocks" in window);
  await page.evaluate(async (shouldSignIn) => {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    if (shouldSignIn) {
      const session = await (
        await fetch("/api/auth/login", {
          method: "POST",
          headers,
          body: JSON.stringify({
            email: "collector@kurio.test",
            password: "Kurio#2026",
          }),
        })
      ).json();
      window.localStorage.setItem("kurio.session-token", session.sessionToken);
      headers["x-session-token"] = session.sessionToken;
    }
    for (const nftId of ["emerald-ape-042", "sage-nomad-009"]) {
      await fetch("/api/cart", {
        method: "POST",
        headers,
        body: JSON.stringify({ nftId, quantity: 1 }),
      });
    }
  }, signIn);
};

test("início preserva a composição visual", async ({ page }, testInfo) => {
  await page.goto("/");
  const heroTitle =
    testInfo.project.name === "mobile"
      ? "SEJA DONO DA CULTURA DIGITAL"
      : "SEJA DONO DO FUTURO DA ARTE DIGITAL";
  await expect(page.getByRole("heading", { name: heroTitle })).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Explorar NFTs", exact: true })
      .locator("article")
      .first(),
  ).toBeVisible();
  await expectScreenshot(page, "home.png");
});

test("detalhe do NFT preserva a composição visual", async ({ page }) => {
  await page.goto("/nfts/emerald-ape-042");
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", level: 1 }),
  ).toBeVisible();
  await expectScreenshot(page, "nft-detail.png");
});

test("carrinho preserva a composição visual", async ({ page }) => {
  await page.goto("/");
  await prepareCart(page, { signIn: false });
  await page.goto("/cart");
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await expect(page.getByLabel("Calculando resumo")).toHaveCount(0);
  await expectScreenshot(page, "cart.png");
});

test("pagamento preserva a composição visual", async ({ page }, testInfo) => {
  await page.goto("/");
  await prepareCart(page, { signIn: true });
  await page.goto("/checkout");
  if (testInfo.project.name === "mobile")
    await expect(
      page.getByRole("heading", { name: "Pagamento com carteira" }),
    ).toBeVisible();
  else
    await expect(
      page.getByRole("button", { name: "Confirmar compra" }),
    ).toBeEnabled();
  await expect(page.getByText("Atualizando valores…")).toHaveCount(0);
  await expectScreenshot(page, "checkout.png");
});