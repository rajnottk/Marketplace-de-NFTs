import { expect, test } from "@playwright/test";
import { completeCollectorLogin } from "../helpers/auth";

test("pesquisa só pelo título com debounce e preserva os filtros", async ({
  page,
}, testInfo) => {
  await page.goto("/?network=Ethereum&page=2", {
    waitUntil: "domcontentloaded",
  });
  if (testInfo.project.name === "desktop")
    await page.getByRole("button", { name: "Abrir pesquisa de NFTs" }).click();
  const input = page.getByRole("searchbox", {
    name: "Pesquisar NFTs pelo título",
  });
  await expect(input).toBeVisible();
  if (testInfo.project.name === "desktop") {
    const headerBounds = (await page.getByRole("banner").boundingBox())!;
    const inputBounds = (await input.boundingBox())!;
    expect(headerBounds.height).toBe(68);
    expect(inputBounds.y).toBeGreaterThanOrEqual(headerBounds.y);
    expect(inputBounds.y + inputBounds.height).toBeLessThanOrEqual(
      headerBounds.y + headerBounds.height,
    );
    await page.screenshot({
      path: testInfo.outputPath("desktop-inline-search.png"),
    });
  }
  const requests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/nfts" && url.searchParams.has("q"))
      requests.push(url.searchParams.get("q")!);
  });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 100));
  await input.fill("Emer");
  await page.clock.runFor(200);
  await input.fill("emerald");
  await page.clock.runFor(299);
  expect(requests).toHaveLength(0);
  await page.clock.runFor(1);
  await expect(page).toHaveURL(/q=emerald/);
  await page.clock.resume();
  await expect(page).toHaveURL(/network=Ethereum/);
  expect(new URL(page.url()).searchParams.get("page")).toBe("1");
  const catalog = page.getByRole("region", {
    name: "Explorar NFTs",
    exact: true,
  });
  await expect(
    catalog.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
  const titles = await catalog
    .getByRole("heading", { level: 3 })
    .allTextContents();
  expect(titles.length).toBeGreaterThan(0);
  expect(titles.every((title) => title.toLowerCase().includes("emerald"))).toBe(
    true,
  );
  expect(requests).toEqual(["emerald"]);
  await input.fill("Nina Cobalt");
  await expect(
    catalog.getByRole("heading", { name: "Nenhuma obra encontrada" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Limpar pesquisa", exact: true })
    .click();
  await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBeNull();
  await expect(
    catalog.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
});

test("mobile abre os filtros em modal e navega pela barra inferior", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  test.skip(
    testInfo.project.name !== "mobile",
    "Controles exclusivos do mobile.",
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("searchbox", { name: "Pesquisar NFTs pelo título" }),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mobile-home.png") });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);
  const nav = page.getByRole("navigation", {
    name: "Navegação mobile",
    exact: true,
  });
  const randomButton = nav.getByRole("button", {
    name: "Explorar NFT aleatório",
    exact: true,
  });
  await expect(randomButton).toHaveCSS("width", "65px");
  await expect(randomButton).toHaveCSS("height", "65px");
  await expect(randomButton).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(randomButton).toHaveCSS(
    "background-image",
    "linear-gradient(rgba(210, 138, 76, 0.4) -16.92%, rgb(210, 138, 76) 109.23%)",
  );
  await expect(randomButton).toHaveCSS("border-width", "0px");
  await expect(nav.locator("[data-mobile-nav-surface]")).toHaveCSS(
    "background-color",
    "rgb(36, 22, 18)",
  );
  const navBounds = (await nav.boundingBox())!;
  expect(navBounds.x).toBe(0);
  expect(navBounds.width).toBe(page.viewportSize()!.width);
  const hero = page.getByRole("region", {
    name: "Destaques mobile da coleção Kurio",
    exact: true,
  });
  expect((await hero.boundingBox())!.height).toBeLessThan(230);
  await expect(
    hero.getByRole("heading", { name: /SEJA DONO DA/ }),
  ).toBeVisible();
  const copy = hero.locator("[data-hero-copy]");
  const copyBounds = await copy.boundingBox();
  const ellipses = hero.locator("[data-hero-ellipse]");
  await expect(ellipses).toHaveCount(2);
  for (const ellipse of await ellipses.all()) {
    await expect(ellipse).toHaveCSS("width", "248px");
    await expect(ellipse).toHaveCSS("height", "248px");
  }
  await expect(ellipses.nth(0)).toHaveCSS("left", "73px");
  await expect(ellipses.nth(0)).toHaveCSS("top", "-10px");
  await expect(ellipses.nth(1)).toHaveCSS("left", "-80px");
  await expect(ellipses.nth(1)).toHaveCSS("top", "-31px");
  const imageCarousel = hero.getByRole("region", {
    name: "Imagens de NFTs em destaque",
    exact: true,
  });
  await expect(hero.locator("img")).toHaveCount(3);
  await expect(imageCarousel.locator("img")).toHaveCount(3);
  const firstImage = imageCarousel.locator("img").first();
  const firstImageX = (await firstImage.boundingBox())!.x;
  await hero
    .getByRole("button", { name: "Mostrar destaque 2", exact: true })
    .click();
  await expect(
    hero.getByRole("button", { name: "Mostrar destaque 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await expect
    .poll(async () => (await firstImage.boundingBox())!.x)
    .toBeLessThan(firstImageX - 50);
  expect(await copy.boundingBox()).toEqual(copyBounds);
  await expect(
    page.getByRole("tab", { name: "Todos os NFTs", exact: true }),
  ).toHaveCSS("font-size", "14px");
  await expect(
    nav.getByRole("link", { name: "Início", exact: true }),
  ).toHaveCSS("color", "rgb(232, 155, 85)");
  await expect(
    nav.getByRole("link", { name: "Favoritos", exact: true }),
  ).toHaveCSS("color", "rgb(207, 178, 140)");
  const featured = page.getByRole("region", {
    name: "NFT em destaque",
    exact: true,
  });
  expect((await featured.boundingBox())!.height).toBeLessThanOrEqual(180);
  const creators = page.getByRole("region", { name: "Criadores", exact: true });
  expect(
    (await creators.getByRole("article").first().boundingBox())!.height,
  ).toBeLessThanOrEqual(220);
  await creators.screenshot({
    path: testInfo.outputPath("mobile-compact-creators.png"),
  });
  await page
    .getByRole("region", { name: "Diário da Cunhagem", exact: true })
    .screenshot({ path: testInfo.outputPath("mobile-compact-posts.png") });
  await page
    .getByRole("button", { name: "Abrir filtros", exact: true })
    .click();
  const filters = page.getByRole("dialog", { name: "Filtros", exact: true });
  await expect(filters).toBeVisible();
  await filters.getByRole("button", { name: /Polygon/ }).click();
  await expect(page).toHaveURL(/network=Polygon/);
  await page.screenshot({ path: testInfo.outputPath("mobile-filters.png") });
  await filters
    .getByRole("button", { name: "Ver resultados", exact: true })
    .click();
  await expect(filters).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Explorar NFTs", exact: true })
      .getByRole("heading", { name: "Neon Vessel #552" }),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "Explorar NFTs", exact: true })
    .getByRole("heading", { name: "Neon Vessel #552" })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("mobile-catalog.png") });
  await nav.getByRole("link", { name: "Favoritos", exact: true }).click();
  await expect(page).toHaveURL("/favorites");
  await expect(
    nav.getByRole("link", { name: "Favoritos", exact: true }),
  ).toHaveCSS("color", "rgb(232, 155, 85)");
  await expect(
    nav.getByRole("link", { name: "Início", exact: true }),
  ).toHaveCSS("color", "rgb(207, 178, 140)");
  await expect(
    page.getByRole("heading", { name: /página em construção/i }),
  ).toBeVisible();
  await nav.getByRole("link", { name: "Carrinho", exact: true }).click();
  await expect(page).toHaveURL("/cart");
  await nav.getByRole("link", { name: "Início", exact: true }).click();
  await expect(page).toHaveURL("/");
  await nav.getByRole("button", { name: "Perfil", exact: true }).click();
  await completeCollectorLogin(page);
  await expect(nav.locator("img")).toHaveCount(0);
  await nav.getByRole("link", { name: "Perfil", exact: true }).click();
  await expect(page).toHaveURL("/account/profile");
  await randomButton.click();
  await expect(page).toHaveURL(/\/nfts\/[^/]+$/);
  const firstNftUrl = page.url();
  await randomButton.click();
  await expect.poll(() => page.url()).not.toBe(firstNftUrl);
  await expect(page).toHaveURL(/\/nfts\/[^/]+$/);
});