import { expect, type Page } from "@playwright/test";

export const openLogin = async (page: Page) => {
  const headerLogin = page
    .getByRole("banner")
    .getByRole("button", { name: "Entrar", exact: true });
  if (
    (page.viewportSize()?.width ?? 0) >= 768 ||
    new URL(page.url()).pathname !== "/"
  ) {
    await headerLogin.click();
    return;
  }
  await page
    .getByRole("navigation", { name: "Navegação mobile" })
    .getByRole("button", { name: "Perfil", exact: true })
    .click();
};

export const expectLoggedIn = async (
  page: Page,
  displayName = "Ana Coleciona",
) => {
  const headerProfile = page
    .getByRole("banner")
    .getByRole("link", { name: `Perfil de ${displayName}`, exact: true });
  if (
    (page.viewportSize()?.width ?? 0) >= 768 ||
    new URL(page.url()).pathname !== "/"
  ) {
    await expect(headerProfile).toBeVisible();
    return;
  }
  await expect(
    page
      .getByRole("navigation", { name: "Navegação mobile" })
      .getByRole("link", { name: "Perfil", exact: true }),
  ).toBeVisible();
};

export const expectLoggedOut = async (page: Page) => {
  const headerLogin = page
    .getByRole("banner")
    .getByRole("button", { name: "Entrar", exact: true });
  if (
    (page.viewportSize()?.width ?? 0) >= 768 ||
    new URL(page.url()).pathname !== "/"
  ) {
    await expect(headerLogin).toBeVisible();
    return;
  }
  await expect(
    page
      .getByRole("navigation", { name: "Navegação mobile" })
      .getByRole("button", { name: "Perfil", exact: true }),
  ).toBeVisible();
};

export const completeCollectorLogin = async (page: Page) => {
  const modal = page.getByRole("dialog", { name: "Entrar na Kurio" });
  await expect(modal).toBeVisible();
  await modal
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await modal.getByLabel("Senha", { exact: true }).fill("Kurio#2026");
  await modal.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expectLoggedIn(page);
};