import { expect, test } from "@playwright/test";
import {
  completeCollectorLogin,
  openLogin,
  expectLoggedIn,
  expectLoggedOut,
} from "../helpers/auth";

test.beforeEach(async ({ page }) => {
  await page.goto("/account/profile", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Ir para login" }).click();
  await completeCollectorLogin(page);
  await page.goto("/account/profile", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByLabel("Nome de exibição", { exact: true }),
  ).toHaveValue("Ana Coleciona");
});

test("salva os dados preenchidos e sincroniza o avatar com o header", async ({
  page,
}, testInfo) => {
  await expect(page.getByLabel("Nome de usuário", { exact: true })).toHaveValue(
    "ana.coleciona",
  );
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue(
    "collector@kurio.test",
  );
  await expect(page.getByLabel("Nome ENS", { exact: true })).toHaveValue("ana");
  await expect(
    page.getByLabel("Apelido da carteira", { exact: true }),
  ).toHaveValue("Carteira principal");
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Sair" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("profile.png"),
    fullPage: true,
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.getByLabel("Nome de exibição", { exact: true }).fill("");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByLabel("Nome de exibição", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toContainText(
    "Este campo precisa ser preenchido.",
  );
  await page
    .getByLabel("Nome de exibição", { exact: true })
    .fill("Ana Atualizada");
  await page
    .getByLabel("Nome de usuário", { exact: true })
    .fill("ana.atualizada");
  await page.getByLabel("E-mail", { exact: true }).fill("ana@kurio.test");
  await page.getByLabel("Nome ENS", { exact: true }).fill("ana-atualizada");
  await page.getByRole("combobox", { name: "Extensão ENS" }).click();
  await page.getByRole("option", { name: ".xyz", exact: true }).click();
  await page
    .getByLabel("Apelido da carteira", { exact: true })
    .fill("Minha Ledger");
  await page
    .getByLabel("Escolher imagem do perfil")
    .setInputFiles("src/assets/images/ape-bucket-hat.png");
  await expect(page.getByAltText("Avatar do perfil")).toHaveAttribute(
    "src",
    /^data:image\/png;base64,/,
  );
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Perfil atualizado com sucesso.",
  );
  const avatarSource = await page
    .getByAltText("Avatar do perfil")
    .getAttribute("src");
  await expect(
    page.locator("header").getByAltText("Avatar de Ana Atualizada"),
  ).toHaveAttribute("src", avatarSource!);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    page.getByLabel("Nome de exibição", { exact: true }),
  ).toHaveValue("Ana Atualizada");
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue(
    "ana@kurio.test",
  );
  await expect(page.getByLabel("Nome ENS", { exact: true })).toHaveValue(
    "ana-atualizada",
  );
  await expect(page.getByRole("combobox", { name: "Extensão ENS" })).toHaveText(
    ".xyz",
  );
  await expect(
    page.getByLabel("Apelido da carteira", { exact: true }),
  ).toHaveValue("Minha Ledger");
  await expect(
    page.locator("header").getByAltText("Avatar de Ana Atualizada"),
  ).toHaveAttribute("src", avatarSource!);
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Perfil atualizado com sucesso.",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("Sem avatar", { exact: true })).toBeVisible();
  await expect(page.getByRole("banner").getByRole("img")).toHaveCount(0);
  await expectLoggedIn(page, "Ana Atualizada");
});

test("valida a troca de senha e evita salvar o perfil com senha atual incorreta", async ({
  page,
}) => {
  await page
    .getByLabel("Nome de exibição", { exact: true })
    .fill("Nome pendente");
  await page.getByLabel("Senha atual", { exact: true }).fill("incorreta");
  await page.getByLabel("Nova senha", { exact: true }).fill("Nova#2026");
  await page
    .getByLabel("Confirmar nova senha", { exact: true })
    .fill("Outra#2026");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("As senhas não conferem.");
  await page
    .getByLabel("Confirmar nova senha", { exact: true })
    .fill("Nova#2026");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "A senha atual não confere.",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    page.getByLabel("Nome de exibição", { exact: true }),
  ).toHaveValue("Ana Coleciona");
  await page.getByLabel("Senha atual", { exact: true }).fill("Kurio#2026");
  await page.getByLabel("Nova senha", { exact: true }).fill("Nova#2026");
  await page
    .getByLabel("Confirmar nova senha", { exact: true })
    .fill("Nova#2026");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Perfil atualizado com sucesso.",
  );
  await expect(page.getByLabel("Nova senha", { exact: true })).toHaveValue("");
  await expect(page.locator("[data-password-mask]")).toHaveCount(0);
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("/");
  await openLogin(page);
  const modal =
    new URL(page.url()).pathname === "/login"
      ? page.getByRole("main")
      : page.getByRole("dialog", { name: "Entrar na Kurio" });
  await modal
    .getByLabel("E-mail", { exact: true })
    .fill("collector@kurio.test");
  await modal.getByLabel("Senha", { exact: true }).fill("Nova#2026");
  await modal.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expectLoggedIn(page);
});

test("navega pelas configurações e salva uma carteira", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  const menu = page.getByRole("navigation", { name: "Configurações da conta" });
  const indicator = await menu
    .locator("[data-account-indicator]")
    .elementHandle();
  for (const [label, path] of [
    ["Atividade", "activity"],
    ["Lista de interesse", "wishlist"],
    ["Ofertas", "offers"],
    ["Arquivos baixados", "downloads"],
    ["Suporte", "support"],
  ]) {
    await menu.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(`/account/${path}`);
    await expect(
      page.getByRole("heading", { name: /página em construção/i }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Estamos preparando esta área. Volte em breve para conferir as novidades.",
      ),
    ).toHaveCSS("color", "rgb(207, 178, 140)");
    expect(await indicator!.evaluate((element) => element.isConnected)).toBe(
      true,
    );
    await expect(
      menu.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect
      .poll(async () => {
        const bar = await menu
          .locator("[data-account-indicator]")
          .boundingBox();
        const item = await menu
          .getByRole("link", { name: label, exact: true })
          .boundingBox();
        return Math.abs(bar!.y - item!.y);
      })
      .toBeLessThan(1);
    if (testInfo.project.name === "desktop")
      await expect(
        page.getByRole("tab", { name: "Início", exact: true }),
      ).toHaveAttribute("aria-selected", "true");
  }
  await menu.getByRole("link", { name: "Carteiras", exact: true }).click();
  await expect(page).toHaveURL("/account/wallet");
  await expect(
    page.getByRole("heading", { name: "Carteira principal", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("wallets.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Salvar carteira", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(2);
  await page
    .getByLabel("Apelido da carteira", { exact: true })
    .fill("Carteira atualizada");
  await page
    .getByLabel("Endereço da carteira", { exact: true })
    .fill("0x1234567890abcdef");
  await page.getByRole("combobox", { name: "Rede", exact: true }).click();
  await page.getByRole("option", { name: "Polygon", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Tipo de carteira", exact: true })
    .click();
  await page.getByRole("option", { name: "MetaMask", exact: true }).click();
  await page
    .getByLabel("Código de indicação", { exact: true })
    .fill("KURIO2026");
  await page.getByRole("button", { name: "Salvar carteira" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Carteira salva com sucesso.",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    page.getByLabel("Apelido da carteira", { exact: true }),
  ).toHaveValue("Carteira atualizada");
  await expect(
    page.getByRole("combobox", { name: "Rede", exact: true }),
  ).toHaveText("Polygon");
  await expect(
    page.getByLabel("Código de indicação", { exact: true }),
  ).toHaveValue("KURIO2026");
  const secondary = page.getByRole("region", {
    name: "Carteira secundária",
    exact: true,
  });
  const walletWrites: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().includes("/api/wallets") &&
      ["POST", "PATCH"].includes(request.method())
    )
      walletWrites.push(request.method());
  });
  await secondary
    .getByRole("button", { name: "Adicionar", exact: true })
    .click();
  await secondary
    .getByLabel("Apelido da carteira", { exact: true })
    .fill("Rascunho anterior");
  await secondary
    .getByLabel("E-mail", { exact: true })
    .fill("rascunho@kurio.test");
  await secondary
    .getByRole("radio", { name: "Igual à carteira principal" })
    .check();
  await expect(
    secondary.getByLabel("Apelido da carteira", { exact: true }),
  ).toHaveValue("");
  await expect(secondary.getByLabel("E-mail", { exact: true })).toHaveValue(
    "collector@kurio.test",
  );
  await secondary
    .getByRole("radio", { name: "Igual à carteira principal" })
    .click();
  await expect(secondary.locator("form")).toHaveCount(0);
  await expect(
    secondary.getByRole("radio", { name: "Igual à carteira principal" }),
  ).not.toBeChecked();
  await secondary
    .getByRole("button", { name: "Adicionar", exact: true })
    .click();
  await expect(
    secondary.getByLabel("Apelido da carteira", { exact: true }),
  ).toHaveValue("Rascunho anterior");
  await expect(secondary.getByLabel("E-mail", { exact: true })).toHaveValue(
    "rascunho@kurio.test",
  );
  await secondary
    .getByRole("button", { name: "Cancelar", exact: true })
    .click();
  await secondary
    .getByRole("radio", { name: "Igual à carteira principal" })
    .check();
  await expect(
    secondary.getByLabel("Nome de exibição", { exact: true }),
  ).toHaveValue("");
  await expect(
    secondary.getByLabel("Nome do perfil", { exact: true }),
  ).toHaveValue("ana.coleciona");
  await expect(secondary.getByLabel("E-mail", { exact: true })).toHaveValue(
    "collector@kurio.test",
  );
  await expect(secondary.getByLabel("Nome ENS", { exact: true })).toHaveValue(
    "ana",
  );
  await expect(
    secondary.getByRole("combobox", { name: "Extensão ENS", exact: true }),
  ).toHaveText(".eth");
  await expect(
    secondary.getByRole("combobox", { name: "Rede", exact: true }),
  ).toHaveText("Polygon");
  await expect(
    secondary.getByRole("combobox", { name: "Tipo de carteira", exact: true }),
  ).toHaveText("MetaMask");
  for (const label of [
    "Nome de exibição",
    "Apelido da carteira",
    "Endereço da carteira",
    "Código de indicação",
    "ENS ou carteira secundária (opcional)",
  ]) {
    await expect(secondary.getByLabel(label, { exact: true })).toHaveValue("");
  }
  expect(walletWrites).toHaveLength(0);
  await secondary
    .getByLabel("Nome de exibição", { exact: true })
    .fill("Ana Secundária");
  await secondary
    .getByLabel("Apelido da carteira", { exact: true })
    .fill("Ledger secundária");
  await secondary
    .getByLabel("Endereço da carteira", { exact: true })
    .fill("0xabcdef1234567890");
  await secondary
    .getByLabel("Código de indicação", { exact: true })
    .fill("SECUNDARIA");
  await page.clock.install();
  await secondary
    .getByRole("button", { name: "Salvar carteira", exact: true })
    .click();
  await expect(secondary.getByRole("status")).toHaveText(
    "Carteira salva com sucesso.",
  );
  expect(walletWrites).toEqual(["POST"]);
  // Pause relative to the page clock (not Node's): the auto-close timer started on save, so keep the offset small.
  const pageNow = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(pageNow + 100));
  await page.clock.runFor(1000);
  await expect(secondary.locator("form")).toBeVisible();
  await page.clock.runFor(1100);
  await expect(secondary.locator("form")).toHaveCount(0);
  await expect(
    secondary.getByRole("radio", { name: "Igual à carteira principal" }),
  ).not.toBeChecked();
  await page.clock.resume();
  const primaryForm = page.locator("main form").first();
  await primaryForm
    .getByLabel("Apelido da carteira", { exact: true })
    .fill("Principal alterada novamente");
  await primaryForm
    .getByRole("button", { name: "Salvar carteira", exact: true })
    .click();
  await expect(primaryForm.getByRole("status")).toHaveText(
    "Carteira salva com sucesso.",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    secondary.getByRole("radio", { name: "Igual à carteira principal" }),
  ).not.toBeChecked();
  await expect(
    secondary.getByText(/Ledger secundária · Polygon/),
  ).toBeVisible();
  await menu
    .getByRole("link", { name: "Dados do perfil", exact: true })
    .click();
  await expect(page).toHaveURL("/account/profile");
  await menu.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expectLoggedOut(page);
});