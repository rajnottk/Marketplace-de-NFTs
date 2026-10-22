import { expect, test } from "@playwright/test";
import { completeCollectorLogin } from "../helpers/auth";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile",
    "Telas de autenticação mobile.",
  );
  await page.setViewportSize({ width: 390, height: 833 });
});

test("footer abre login para visitante e perfil para usuário autenticado", async ({
  page,
}, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const profile = page
    .getByRole("navigation", { name: "Navegação mobile" })
    .getByRole("link", { name: "Perfil", exact: true });
  await profile.click();
  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Entrar", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mobile-login.png") });
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(2);
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await page.getByLabel("Senha", { exact: true }).fill("incorreta");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Credenciais inválidas.");
  await completeCollectorLogin(page);
  await expect(page).toHaveURL("/");
  await page
    .getByRole("navigation", { name: "Navegação mobile" })
    .getByRole("link", { name: "Início", exact: true })
    .click();
  await profile.click();
  await expect(page).toHaveURL("/account/profile");
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL("/");
});

test("cadastro valida confirmação de senha e abre o início", async ({
  page,
}, testInfo) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Crie uma conta", exact: true }).click();
  await expect(page).toHaveURL("/register");
  await expect(
    page.getByRole("heading", {
      name: "Criar perfil de colecionador",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Nome de usuário", exact: true }),
  ).toHaveCSS("border-top-width", "1px");
  expect(
    await page
      .getByRole("textbox", { name: "Nome de usuário", exact: true })
      .evaluate(
        (element) => getComputedStyle(element, "::placeholder").textAlign,
      ),
  ).toBe("left");
  await expect(
    page.getByRole("textbox", { name: "E-mail", exact: true }),
  ).toHaveCSS("border-top-width", "1px");
  await page.screenshot({ path: testInfo.outputPath("mobile-register.png") });
  await page
    .getByRole("textbox", { name: "Nome de usuário", exact: true })
    .fill("Lia Mobile");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(`mobile-${crypto.randomUUID()}@kurio.test`);
  await page.getByLabel("Senha", { exact: true }).fill("Kurio#2026");
  await page.getByLabel("Confirmar senha", { exact: true }).fill("Outra#2026");
  await expect(page.locator("[data-password-mask]")).toHaveText([
    "**********",
    "**********",
  ]);
  await page
    .getByRole("button", { name: "Mostrar confirmação de senha", exact: true })
    .click();
  await expect(
    page.getByLabel("Confirmar senha", { exact: true }),
  ).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Criar perfil", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("As senhas não conferem.");
  await page.getByLabel("Confirmar senha", { exact: true }).fill("Kurio#2026");
  await page
    .getByRole("button", { name: "Ocultar confirmação de senha", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Criar perfil", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page
    .getByRole("navigation", { name: "Navegação mobile" })
    .getByRole("link", { name: "Perfil", exact: true })
    .click();
  await expect(page).toHaveURL("/account/profile");
  await expect(
    page.getByRole("textbox", { name: "Nome de exibição", exact: true }),
  ).toHaveValue("Lia Mobile");
});

test("recuperação visual e login social mantêm o comportamento existente", async ({
  page,
}) => {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  for (const provider of ["Google", "Facebook"]) {
    await page
      .getByRole("button", { name: `Continuar com ${provider}` })
      .click();
    await expect(page.getByRole("alert")).toHaveText(
      "Login social ainda não está disponível.",
    );
  }
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/auth/"))
      requests.push(request.url());
  });
  await page
    .getByRole("button", { name: "Esqueceu a senha?", exact: true })
    .click();
  await expect(page.getByRole("textbox")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await page
    .getByRole("button", { name: "Enviar link de recuperação", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "você receberá um link para redefinir sua senha",
  );
  expect(requests).toHaveLength(0);
  await page
    .getByRole("button", { name: "Voltar para entrar", exact: true })
    .click();
  await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
});