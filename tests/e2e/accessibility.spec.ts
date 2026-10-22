import { expect, test } from "@playwright/test";

test("mantém controles do catálogo navegáveis por teclado", async ({
  page,
}) => {
  await page.goto("/");
  const isMobile = (page.viewportSize()?.width ?? 0) < 640;

  if (!isMobile) {
    await page.getByRole("tab", { name: "Todos os NFTs" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Ordenar catálogo")).toBeFocused();
    return;
  }

  // Below 640px sorting lives inside the filters dialog.
  const filtersButton = page.getByRole("button", {
    name: "Abrir filtros",
    exact: true,
  });
  await filtersButton.focus();
  await expect(filtersButton).toBeFocused();
  await page.keyboard.press("Enter");
  const filtersDialog = page.getByRole("dialog");
  await expect(filtersDialog).toBeVisible();
  const sortTrigger = filtersDialog.getByLabel("Ordenar catálogo");
  await sortTrigger.focus();
  await expect(sortTrigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(filtersDialog).toHaveCount(0);
  await expect(filtersButton).toBeFocused();
});