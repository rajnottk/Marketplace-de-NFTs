import { expect, type Page } from "@playwright/test";

export const completeCollectorLogin = async (page: Page) => {
  const modal = page.getByRole("dialog", { name: "Entrar na Kurio" });
  await expect(modal).toBeVisible();
  await modal
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await modal.getByLabel("Senha", { exact: true }).fill("Kurio#2026");
  await modal.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Perfil de Ana Coleciona")).toBeVisible();
};