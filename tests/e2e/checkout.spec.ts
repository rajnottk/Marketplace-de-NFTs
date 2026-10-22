import { expect, test, type Page } from "@playwright/test";

const fillRequiredFields = async (page: Page) => {
  await page.getByLabel("Nome de usuário").fill("ana-coleciona");
  await page.getByLabel("Nome do perfil").fill("Coleção da Ana");
  await page.getByRole("combobox", { name: "Tipo de carteira" }).click();
  await page.getByRole("option", { name: "MetaMask", exact: true }).click();
};

test.beforeEach(async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByRole("main").getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByLabel("Perfil de Ana Coleciona")).toBeVisible();
  await page.goto("/nfts/emerald-ape-042");
  await page.getByRole("button", { name: "Comprar" }).click();
  await expect(
    page.getByRole("link", { name: "Carrinho com 1 itens" }),
  ).toBeVisible();
  await page.goto("/checkout");
  await expect(
    page.getByRole("combobox", { name: "Rede", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("textbox", { name: "Endereço da carteira", exact: true }),
  ).toHaveValue("0x1af9...7bd2");
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
});

test("abre o campo de cupom, informa erro e preserva desconto ao trocar a rede", async ({
  page,
}, testInfo) => {
  await fillRequiredFields(page);
  await expect(
    page.getByPlaceholder("Digite o código promocional..."),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Tem um código promocional/ }).click();
  await page
    .getByPlaceholder("Digite o código promocional...")
    .fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Este cupom não é válido.");
  await page.getByPlaceholder("Digite o código promocional...").fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByText("Código KURIO10 aplicado.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Tem um código promocional/ }),
  ).toHaveCount(0);
  const summary = page.getByRole("complementary", { name: "Seus NFTs" });
  const originalTotal = await summary.locator("dl > div").last().textContent();
  await page.getByRole("combobox", { name: "Rede", exact: true }).click();
  await page.getByRole("option", { name: "Polygon", exact: true }).click();
  await expect(page.getByText("Atualizando valores…")).toHaveCount(0);
  await expect(summary.locator("dl > div").last()).not.toHaveText(
    originalTotal!,
  );
  await expect(page.getByText("Código KURIO10 aplicado.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("textbox", { name: "Endereço da carteira", exact: true }),
  ).toHaveValue("0x1af9...7bd2");
  await page.getByRole("combobox", { name: "Rede", exact: true }).click();
  await page.getByRole("option", { name: "Ethereum", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
  await expect(summary.locator("dl > div").last()).toHaveText(originalTotal!);
  await page.reload();
  await expect(page.getByText("Código KURIO10 aplicado.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Tem um código promocional/ }),
  ).toHaveCount(0);
  await fillRequiredFields(page);
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
  await page.screenshot({
    path: testInfo.outputPath("checkout.png"),
    fullPage: true,
  });
});

test("valida os dados obrigatórios e mantém o checkout dentro da largura da tela", async ({
  page,
}) => {
  const confirm = page.getByRole("button", { name: "Confirmar compra" });
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByRole("alert")).toHaveCount(3);
  await expect(
    page.getByRole("textbox", { name: "Nome de usuário", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("combobox", { name: "Tipo de carteira" }),
  ).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("combobox", { name: "Tipo de carteira" }),
  ).toHaveCSS("border-top-color", "rgb(216, 92, 85)");
  await expect(page).toHaveURL(/\/checkout$/);
  await fillRequiredFields(page);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(confirm).toBeEnabled();
  for (const label of [
    "Nome de exibição",
    "Nome de usuário",
    "Nome do perfil",
    "E-mail",
    "Endereço da carteira",
  ]) {
    const field = page.getByRole("textbox", { name: label, exact: true });
    const previousValue = await field.inputValue();
    await field.fill("");
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveCSS("border-top-color", "rgb(216, 92, 85)");
    await expect(page.getByRole("alert")).toHaveText(
      "Este campo precisa ser preenchido.",
    );
    await expect(page).toHaveURL(/\/checkout$/);
    await field.fill(previousValue);
    await expect(field).toHaveAttribute("aria-invalid", "false");
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(confirm).toBeEnabled();
  }
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("email-invalido");
  await confirm.click();
  await expect(page.getByRole("alert")).toHaveText("Informe um e-mail válido.");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await expect(confirm).toBeEnabled();
  await page.getByLabel("Usar outra carteira?").check();
  await expect(
    page.getByRole("textbox", { name: "Endereço da carteira", exact: true }),
  ).toBeEditable();
  await expect(
    page.getByRole("textbox", { name: "Endereço da carteira", exact: true }),
  ).toHaveValue("0x1af9...7bd2");
  await expect(confirm).toBeEnabled();
  await expect(
    page.getByRole("radio", { name: "Usar outra carteira?" }),
  ).toBeChecked();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByLabel("Observação do colecionador (opcional)"),
  ).toHaveCSS("resize", "none");
});

test("segue os controles e o posicionamento do protótipo", async ({
  page,
}, testInfo) => {
  const breadcrumb = page.getByRole("navigation", { name: "breadcrumb" });
  await breadcrumb.getByRole("link", { name: "Início", exact: true }).hover();
  await expect(
    breadcrumb.getByRole("link", { name: "Início", exact: true }),
  ).toHaveCSS("color", "rgb(232, 155, 85)");
  const ensSelect = page.getByRole("combobox", {
    name: "Nome ENS",
    exact: true,
  });
  await expect(ensSelect).toHaveText(".eth");
  await expect(page.getByRole("textbox", { name: /Nome ENS/ })).toHaveCount(0);
  await ensSelect.click();
  await expect(page.getByRole("option")).toHaveText([
    ".eth",
    ".com",
    ".org",
    ".xyz",
  ]);
  await page.getByRole("option", { name: ".xyz", exact: true }).click();
  await expect(ensSelect).toHaveText(".xyz");
  const paymentGroup = page.getByRole("group", { name: "Carteira e rede" });
  const badge = paymentGroup.getByText("METAMASK · WALLETCONNECT · COINBASE", {
    exact: true,
  });
  await expect(badge).toHaveCSS("background-color", "rgb(56, 34, 15)");
  await expect(badge).toHaveCSS("color", "rgb(232, 155, 85)");
  await expect(
    page.getByRole("radio", { name: "Usar outra carteira?" }),
  ).toHaveCSS("cursor", "pointer");
  await expect(
    paymentGroup.getByRole("radio", { name: "MetaMask", exact: true }),
  ).toHaveCSS("cursor", "pointer");
  await expect(paymentGroup.getByRole("radio")).toHaveCount(3);
  await expect(
    paymentGroup.getByRole("radio", { name: "Coinbase Wallet", exact: true }),
  ).toBeChecked();
  await paymentGroup
    .getByRole("radio", { name: "MetaMask", exact: true })
    .check();
  await expect(
    paymentGroup.getByRole("radio", { name: "MetaMask", exact: true }),
  ).toBeChecked();
  await expect(paymentGroup.getByText("Carteira principal")).toHaveCount(0);
  const summary = page.getByRole("complementary", { name: "Seus NFTs" });
  await page.evaluate(() => window.scrollTo(0, 0));
  const initialTop = (await summary.boundingBox())!.y;
  await page.evaluate(() => window.scrollTo(0, 250));
  await expect
    .poll(async () => (await summary.boundingBox())!.y)
    .toBeLessThan(initialTop - 200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("checkout-controls.png"),
    fullPage: true,
  });
});

test("conclui uma compra em uma rede sem carteira cadastrada", async ({
  page,
}) => {
  await fillRequiredFields(page);
  await page.getByRole("combobox", { name: "Rede", exact: true }).click();
  await page.getByRole("option", { name: "Solana", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Confirmar compra" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(
    page.getByRole("heading", { name: "ARTE GARANTIDA" }),
  ).toBeVisible();
});

test("mantém as cores do tema no estado de autofill do navegador", async ({
  page,
  context,
}) => {
  const client = await context.newCDPSession(page);
  await client.send("DOM.enable");
  await client.send("CSS.enable");
  const { root } = await client.send("DOM.getDocument");
  const { nodeId } = await client.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: "#email",
  });
  await client.send("CSS.forcePseudoState", {
    nodeId,
    forcedPseudoClasses: ["autofill"],
  });
  const email = page.getByRole("textbox", { name: "E-mail", exact: true });
  await expect(email).toHaveCSS(
    "-webkit-text-fill-color",
    "rgb(245, 241, 235)",
  );
  await expect(email).toHaveCSS(
    "box-shadow",
    /rgb\(22, 14, 10\).*1000px.*inset/,
  );
  await client.detach();
});