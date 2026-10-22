import { expect, test, type Page } from "@playwright/test";
import { completeCollectorLogin, openLogin } from "../helpers/auth";
import { simulateFullMockStorage } from "../helpers/storage";

// Desktop shows a labelled "Favoritar" button; mobile shows an icon button labelled "Favoritar NFT".
const favoriteButton = (page: Page) =>
  page
    .getByRole("button", {
      name: /^(Favoritar|Favoritado|Favoritar NFT|Remover dos favoritos)$/,
    })
    .filter({ visible: true });

test("falha ao favoritar mostra erro, mantém o estado e recupera na nova tentativa", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openLogin(page);
  await completeCollectorLogin(page);
  await page.goto("/nfts/sage-nomad-009");
  await expect(favoriteButton(page)).toHaveAttribute("aria-pressed", "false");

  const restoreStorage = await simulateFullMockStorage(page);
  await favoriteButton(page).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível atualizar o favorito." })
      .filter({ visible: true }),
  ).toBeVisible();
  await expect(favoriteButton(page)).toHaveAttribute("aria-pressed", "false");

  await restoreStorage();
  await favoriteButton(page).click();
  await expect(favoriteButton(page)).toHaveAttribute("aria-pressed", "true");
  await expect(
    page
      .getByText("Não foi possível atualizar o favorito.")
      .filter({ visible: true }),
  ).toHaveCount(0);

  await page.reload();
  await expect(favoriteButton(page)).toHaveAttribute("aria-pressed", "true");
});

test("visitante é levado ao login ao favoritar e nada é salvo", async ({
  page,
}) => {
  await page.goto("/nfts/sage-nomad-009");
  await favoriteButton(page).click();
  await expect(
    page.getByRole("dialog", { name: "Entrar na Kurio" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(favoriteButton(page)).toHaveAttribute("aria-pressed", "false");
});