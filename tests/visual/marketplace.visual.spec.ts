import { expect, test } from "@playwright/test";

test("catálogo preserva a composição visual", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "SEJA DONO DO FUTURO DA ARTE DIGITAL" }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("catalog.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.02,
  });
});