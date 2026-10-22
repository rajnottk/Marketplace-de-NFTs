import { expect, test } from "@playwright/test";

test("mantém controles do catálogo navegáveis por teclado", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Todos os NFTs" }).focus();
  await page.keyboard.press("Tab");

  await expect(page.getByLabel("Ordenar catálogo")).toBeFocused();
});