import { expect, test, type Page } from "@playwright/test";

const isFocusInside = (page: Page, selector: string) =>
  page.evaluate(
    (dialogSelector) =>
      Boolean(document.activeElement?.closest(dialogSelector)),
    selector,
  );

test("abre o login pelo teclado, prende o foco no diálogo e o devolve ao fechar", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Navegação por teclado físico é avaliada no desktop.",
  );
  await page.goto("/");
  const loginButton = page
    .getByRole("banner")
    .getByRole("button", { name: "Entrar", exact: true });

  // Reach the header "Entrar" button with Tab only.
  for (
    let step = 0;
    step < 30 &&
    !(await loginButton.evaluate(
      (button) => button === document.activeElement,
    ));
    step += 1
  ) {
    await page.keyboard.press("Tab");
  }
  await expect(loginButton).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Entrar na Kurio" });
  await expect(dialog).toBeVisible();
  // The dialog moves focus asynchronously after opening.
  await expect.poll(() => isFocusInside(page, '[role="dialog"]')).toBe(true);
  for (let step = 0; step < 15; step += 1) {
    await page.keyboard.press("Tab");
    await expect.poll(() => isFocusInside(page, '[role="dialog"]')).toBe(true);
  }
  for (let step = 0; step < 15; step += 1) {
    await page.keyboard.press("Shift+Tab");
    await expect.poll(() => isFocusInside(page, '[role="dialog"]')).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(loginButton).toBeFocused();
});

test("valida o login e associa as mensagens de erro aos campos", async ({
  page,
}) => {
  await page.goto("/nfts/emerald-ape-042");
  await page
    .getByRole("button", { name: /^Favoritar( NFT)?$/ })
    .filter({ visible: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Entrar na Kurio" });
  await dialog.getByRole("button", { name: "Entrar", exact: true }).click();

  for (const field of [
    dialog.getByRole("textbox", { name: "E-mail", exact: true }),
    dialog.getByLabel("Senha", { exact: true }),
  ]) {
    await expect(field).toHaveAttribute("aria-invalid", "true");
    const errorId = await field.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    await expect(page.locator(`[id="${errorId}"]`)).toHaveAttribute(
      "role",
      "alert",
    );
    await expect(page.locator(`[id="${errorId}"]`)).not.toBeEmpty();
  }

  await dialog
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("collector@kurio.test");
  await dialog.getByLabel("Senha", { exact: true }).fill("Kurio#2026");
  await dialog.getByLabel("Senha", { exact: true }).press("Enter");
  await expect(dialog).toHaveCount(0);
});