import { expect, test } from "@playwright/test";
import {
  completeCollectorLogin,
  openLogin,
  expectLoggedOut,
} from "../helpers/auth";

test("abre e fecha o modal em qualquer página sem trocar a rota", async ({
  page,
}, testInfo) => {
  for (const path of ["/", "/nfts/emerald-ape-042", "/account/profile"]) {
    await page.goto(path);
    await openLogin(page);
    const modal = page.getByRole("dialog", { name: "Entrar na Kurio" });
    await expect(modal).toBeVisible();
    await expect(page).toHaveURL(path);
    const bounds = (await modal.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    if (path === "/")
      await page.screenshot({ path: testInfo.outputPath("login-modal.png") });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(path);
  }
});

test("entra, preserva a página e mantém o usuário após recarregar", async ({
  page,
}) => {
  await page.goto("/nfts/emerald-ape-042");
  await page.getByRole("button", { name: "Favoritar", exact: true }).click();
  await completeCollectorLogin(page);
  await expect(page).toHaveURL("/nfts/emerald-ape-042");
  await page.reload();
  await expect(page.getByLabel("Perfil de Ana Coleciona")).toBeVisible();
});

test("cadastra com confirmação de senha visível e leva ao perfil", async ({
  page,
}, testInfo) => {
  await page.goto("/nfts/emerald-ape-042");
  await page.getByRole("button", { name: "Comprar", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Carrinho com 1 itens" }),
  ).toBeVisible();
  await openLogin(page);
  await page.getByRole("tab", { name: "Criar conta", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "Criar conta", exact: true });
  await modal
    .getByRole("textbox", { name: "Nome de usuário", exact: true })
    .fill("Lia Coleciona");
  await modal
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(`lia-${crypto.randomUUID()}@kurio.test`);
  await modal.getByLabel("Senha", { exact: true }).fill("Kurio#2026");
  await modal.getByLabel("Confirmar senha", { exact: true }).fill("Outra#2026");
  await expect(modal.locator("[data-password-mask]")).toHaveText([
    "**********",
    "**********",
  ]);
  await expect(modal.getByLabel("Senha", { exact: true })).toHaveValue(
    "Kurio#2026",
  );
  await modal
    .getByRole("button", { name: "Mostrar confirmação de senha", exact: true })
    .click();
  await expect(
    modal.getByLabel("Confirmar senha", { exact: true }),
  ).toHaveAttribute("type", "text");
  await expect(modal.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await modal
    .getByRole("button", { name: "Mostrar senha", exact: true })
    .click();
  await expect(modal.getByLabel("Senha", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await expect(modal.locator("[data-password-mask]")).toHaveCount(0);
  await modal.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(modal.getByRole("alert")).toHaveText("As senhas não conferem.");
  await expect(page).toHaveURL("/nfts/emerald-ape-042");
  await modal.getByLabel("Confirmar senha", { exact: true }).fill("Kurio#2026");
  await modal
    .getByRole("button", { name: "Ocultar senha", exact: true })
    .click();
  await modal
    .getByRole("button", { name: "Ocultar confirmação de senha", exact: true })
    .click();
  await modal.getByLabel("Confirmar senha", { exact: true }).press("End");
  await modal.getByLabel("Confirmar senha", { exact: true }).press("Backspace");
  await expect(modal.locator("[data-password-mask]")).toHaveText([
    "**********",
    "*********",
  ]);
  await modal.getByLabel("Confirmar senha", { exact: true }).press("6");
  await expect(modal.locator("[data-password-mask]")).toHaveText([
    "**********",
    "**********",
  ]);
  await page.screenshot({ path: testInfo.outputPath("register-modal.png") });
  await modal.getByRole("button", { name: "Criar conta", exact: true }).click();
  await expect(page).toHaveURL("/account/profile");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /perfil do colecionador/i }),
  ).toBeVisible();
  await expect(page.getByLabel("Perfil de Lia Coleciona")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Carrinho com 1 itens" }),
  ).toBeVisible();
});

test("recupera senha apenas visualmente e permite voltar pela aba Entrar", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await openLogin(page);
  const authRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/auth/")) authRequests.push(request.url());
  });
  await page.getByRole("button", { name: "Esqueceu a senha?" }).click();
  const modal = page.getByRole("dialog", { name: "Recuperar senha" });
  await expect(modal.getByRole("textbox")).toHaveCount(1);
  await expect(
    modal.getByRole("button", { name: /Continuar com/ }),
  ).toHaveCount(0);
  await modal
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("email-invalido");
  await modal
    .getByRole("button", { name: "Enviar link de recuperação" })
    .click();
  await expect(modal.getByRole("alert")).toHaveText(
    "Informe um e-mail válido.",
  );
  await modal
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await modal
    .getByRole("button", { name: "Enviar link de recuperação" })
    .click();
  await expect(modal.getByRole("status")).toContainText(
    "você receberá um link para redefinir sua senha",
  );
  expect(authRequests).toHaveLength(0);
  await page.screenshot({
    path: testInfo.outputPath("reset-confirmation.png"),
  });
  await modal.getByRole("tab", { name: "Entrar", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Entrar na Kurio" }),
  ).toBeVisible();
  await expect(page.getByLabel("Senha", { exact: true })).toBeVisible();
});

test("mostra erros de acesso sem fechar o modal ou simular login social", async ({
  page,
}) => {
  await page.goto("/");
  await openLogin(page);
  const modal = page.getByRole("dialog", { name: "Entrar na Kurio" });
  await modal.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(modal.getByRole("alert")).toHaveCount(2);
  await modal
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await modal.getByLabel("Senha", { exact: true }).fill("senha-incorreta");
  await modal.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(modal.getByRole("alert")).toHaveText("Credenciais inválidas.");
  for (const provider of ["Google", "Facebook"]) {
    await modal
      .getByRole("button", { name: `Continuar com ${provider}` })
      .click();
    await expect(modal.getByRole("alert")).toHaveText(
      "Login social ainda não está disponível.",
    );
  }
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Fechar autenticação" }).click();
  await expectLoggedOut(page);
});

test("a ponte social rejeita um token não verificado", async ({ page }) => {
  await page.goto("/");
  const status = await page.evaluate(async () => {
    const response = await fetch("/api/auth/firebase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "token-inventado" }),
    });
    return response.status;
  });
  expect(status).toBe(401);
  await expectLoggedOut(page);
});