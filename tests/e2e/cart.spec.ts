import { expect, test } from "@playwright/test";

test("organiza os cards, remove itens e compartilha o botão de voltar", async ({
  page,
}, testInfo) => {
  for (const id of ["emerald-ape-042", "sage-nomad-009"]) {
    await page.goto(`/nfts/${id}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
    await expect(
      page.getByText("Adicionado ao carrinho.", { exact: true }),
    ).toBeVisible();
  }
  const isMobile = testInfo.project.name === "mobile";
  const backIcon = isMobile
    ? await page
        .getByRole("button", { name: "Voltar", exact: true })
        .locator("svg")
        .innerHTML()
    : null;
  await page.locator('a[href="/cart"]:visible').first().click();
  await expect(page).toHaveURL("/cart");
  const applyButton = page.getByRole("button", {
    name: "Aplicar",
    exact: true,
  });
  await expect(applyButton).toHaveCSS("color", "rgb(247, 243, 236)");
  await expect(applyButton).toHaveCSS(
    "background-image",
    "linear-gradient(93.11deg, rgba(210, 138, 76, 0.54) -0.94%, rgb(210, 138, 76) 105.02%)",
  );
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(2);
  await page.screenshot({
    path: testInfo.outputPath("cart.png"),
    fullPage: true,
  });
  if (isMobile) {
    await expect(
      page.getByRole("heading", { name: "Carrinho de NFTs", exact: true }),
    ).toBeVisible();
    expect(
      await page
        .getByRole("button", { name: "Voltar", exact: true })
        .locator("svg")
        .innerHTML(),
    ).toBe(backIcon);
    for (const row of await rows.all()) {
      const price = (await row.locator("td").nth(4).boundingBox())!;
      const remove = (await row
        .getByRole("button", { name: /^Remover/ })
        .boundingBox())!;
      const quantity = (await row
        .getByRole("group", { name: /^Quantidade/ })
        .boundingBox())!;
      const edition = (await row.getByText(/^Edição:/).boundingBox())!;
      expect(
        Math.abs(
          edition.y + edition.height / 2 - quantity.y - quantity.height / 2,
        ),
      ).toBeLessThan(1);
      await expect(row).toHaveCSS("border-radius", "14px");
      await expect(row.getByRole("button", { name: /^Remover/ })).toHaveCSS(
        "color",
        "rgb(210, 138, 76)",
      );
      expect(
        Math.abs(price.y + price.height / 2 - remove.y - remove.height / 2),
      ).toBeLessThan(1);
      expect(remove.y).toBeGreaterThanOrEqual(quantity.y + quantity.height);
    }
    await expect(
      page.getByRole("complementary", { name: "Resumo da carteira" }),
    ).toHaveCSS("border-top-left-radius", "40px");
    await expect(
      page.getByRole("complementary", { name: "Resumo da carteira" }),
    ).toHaveCSS("border-top-right-radius", "40px");
  }
  await page
    .getByRole("button", { name: "Aumentar Emerald Ape #042", exact: true })
    .click();
  await expect(
    page
      .getByRole("group", { name: "Quantidade de Emerald Ape #042" })
      .getByRole("status"),
  ).toHaveText("2");
  const removeButton = page.getByRole("button", {
    name: "Remover Sage Nomad #009",
    exact: true,
  });
  await expect(removeButton).toBeEnabled();
  await removeButton.click();
  await expect(rows).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  if (isMobile) {
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    await expect(page).toHaveURL("/nfts/sage-nomad-009");
  }
});

test("recusa cupom inválido, aplica o válido e mantém o carrinho após refresh", async ({
  page,
}) => {
  for (const id of ["emerald-ape-042", "sage-nomad-009"]) {
    await page.goto(`/nfts/${id}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
    await expect(
      page.getByText("Adicionado ao carrinho.", { exact: true }),
    ).toBeVisible();
  }
  await page.goto("/cart");
  const summary = page.getByRole("complementary");
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(2);
  await page
    .getByRole("button", { name: "Aumentar Sage Nomad #009", exact: true })
    .click();
  await expect(
    page
      .getByRole("group", { name: "Quantidade de Sage Nomad #009" })
      .locator("output"),
  ).toHaveText("2");

  const couponField = page.getByLabel("Código promocional", { exact: true });
  await couponField.fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Este cupom não é válido." }),
  ).toBeVisible();
  await expect(summary.getByText(/\(−\) 0\.00 ETH/)).toBeVisible();

  await couponField.fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByText("Código KURIO10 aplicado.")).toBeVisible();
  await expect(summary.getByText(/\(−\) 0\.00 ETH/)).toHaveCount(0);
  const totalWithDiscount = await summary.locator("dd").last().textContent();

  await page.reload();
  await expect(rows).toHaveCount(2);
  await expect(
    page
      .getByRole("group", { name: "Quantidade de Sage Nomad #009" })
      .locator("output"),
  ).toHaveText("2");
  await expect(page.getByText("Código KURIO10 aplicado.")).toBeVisible();
  await expect(summary.locator("dd").last()).toHaveText(totalWithDiscount!);
});

test("informa cupom expirado sem aplicar desconto", async ({ page }) => {
  await page.goto("/nfts/emerald-ape-042", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByText("Adicionado ao carrinho.", { exact: true }),
  ).toBeVisible();
  await page.goto("/cart");
  await page
    .getByLabel("Código promocional", { exact: true })
    .fill("KURIO-EXPIRADO");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Este cupom expirou." }),
  ).toBeVisible();
  await expect(
    page.getByRole("complementary").getByText(/\(−\) 0\.00 ETH/),
  ).toBeVisible();
});