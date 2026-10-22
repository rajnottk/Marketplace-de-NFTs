import { expect, test, type Page } from "@playwright/test";
import { completeCollectorLogin, openLogin } from "../helpers/auth";
import { prepareDesktopCheckout } from "../helpers/checkout";
import {
  changeNftPrice,
  confirmPendingOrders,
  dropRealtime,
  redeliverNftEvent,
  restoreRealtime,
  setMockScenario,
} from "../helpers/mocks";

// Every event below goes through socket.io-client and the MSW Socket.IO binding (no direct cache updates).

const detailPrice = (page: Page) =>
  page
    .locator("section[aria-labelledby='nft-title']")
    .getByText(/^\d+\.\d{2} ETH$/)
    .first();

test("alteração de preço via Socket.IO durante o checkout avisa, atualiza o resumo e entra no recibo", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Fluxo de checkout desktop; o mobile compartilha a mesma regra de cotação.",
  );
  await prepareDesktopCheckout(page);
  const summary = page.getByRole("complementary", { name: "Seus NFTs" });
  await expect(summary.getByText("1.19 ETH").first()).toBeVisible();

  await changeNftPrice(page, "emerald-ape-042", "2.50");
  await expect(page.locator("[data-realtime-notice]")).toContainText(
    "O preço de Emerald Ape #042 mudou para 2.50 ETH",
  );
  await expect(summary.getByText("2.50 ETH").first()).toBeVisible();
  await expect(summary.getByText("Atualizando valores…")).toHaveCount(0);

  await page.getByRole("button", { name: "Confirmar compra" }).click();
  const receipt = page.getByRole("dialog", { name: "Compra confirmada" });
  await expect(receipt).toBeVisible();
  await expect(receipt.getByText(/2\.5/).first()).toBeVisible();
});

test("ignora eventos duplicados e antigos sem regredir o preço", async ({
  page,
}) => {
  await page.goto("/nfts/emerald-ape-042");
  await expect(detailPrice(page)).toHaveText("1.19 ETH");
  await changeNftPrice(page, "emerald-ape-042", "2.50");
  await expect(detailPrice(page)).toHaveText("2.50 ETH");
  await changeNftPrice(page, "emerald-ape-042", "3.00");
  await expect(detailPrice(page)).toHaveText("3.00 ETH");

  expect(await redeliverNftEvent(page, "emerald-ape-042", "previous")).toBe(
    true,
  );
  expect(await redeliverNftEvent(page, "emerald-ape-042", "latest")).toBe(true);
  // Give the redelivered events time to be processed, then make sure nothing regressed.
  await page.waitForTimeout(500);
  await expect(detailPrice(page)).toHaveText("3.00 ETH");
});

test("após queda do socket, a reconexão reconcilia os dados pela API", async ({
  page,
}) => {
  await page.goto("/nfts/emerald-ape-042");
  await expect(detailPrice(page)).toHaveText("1.19 ETH");
  await page.waitForTimeout(300);
  await dropRealtime(page);
  await changeNftPrice(page, "emerald-ape-042", "4.20");
  // No connection: the event is lost and the screen still shows the old price.
  await page.waitForTimeout(500);
  await expect(detailPrice(page)).toHaveText("1.19 ETH");

  await restoreRealtime(page);
  // socket.io-client reconnects on its own; the connect handler refetches the active resources through REST.
  await expect(detailPrice(page)).toHaveText("4.20 ETH", { timeout: 15_000 });
});

test("o pedido de outro usuário não é entregue e é retomado pelo dono após novo login", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Fluxo de checkout desktop.");
  await prepareDesktopCheckout(page);
  await setMockScenario(page, { payment: "pending" });
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByText(/Pagamento em processamento/)).toBeVisible();

  // Ana leaves; Lia (second seeded user) signs in on the same browser.
  await page.goto("/account/profile");
  await page
    .getByRole("navigation", { name: "Configurações da conta" })
    .getByRole("button", { name: "Sair", exact: true })
    .click();
  await expect(page).toHaveURL("/");
  await openLogin(page);
  const dialog = page.getByRole("dialog", { name: "Entrar na Kurio" });
  await dialog
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("lia@kurio.test");
  await dialog.getByLabel("Senha", { exact: true }).fill("Kurio#2026");
  await dialog.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(
    page
      .getByRole("banner")
      .getByRole("link", { name: "Perfil de Lia Coleciona", exact: true }),
  ).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByText(/Pagamento em processamento/)).toHaveCount(0);

  // Ana's order is confirmed while Lia is connected: the event must not reach Lia's session.
  await confirmPendingOrders(page);
  await page.waitForTimeout(800);
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada" }),
  ).toHaveCount(0);

  // Back as Ana: the pending order is recovered from the API and shows the confirmed receipt.
  await page.goto("/account/profile");
  await page
    .getByRole("navigation", { name: "Configurações da conta" })
    .getByRole("button", { name: "Sair", exact: true })
    .click();
  await openLogin(page);
  await completeCollectorLogin(page);
  await page.goto("/checkout");
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada" }),
  ).toBeVisible();
});