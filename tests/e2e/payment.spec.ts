import { expect, test } from "@playwright/test";
import {
  prepareDesktopCheckout,
  recordOrderRequests,
} from "../helpers/checkout";
import { confirmPendingOrders, setMockScenario } from "../helpers/mocks";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "O pagamento mobile tem cobertura própria; aqui o foco é o resultado do pedido.",
  );
  await prepareDesktopCheckout(page);
});

test("pagamento recusado mantém o carrinho e a nova tentativa usa outro pedido", async ({
  page,
}) => {
  const orderRequests = recordOrderRequests(page);
  await setMockScenario(page, { payment: "declined" });
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(
    page.getByText(
      "Pagamento não aprovado. Revise a carteira e tente novamente.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "Carrinho com 1 itens",
      includeHidden: true,
    }),
  ).toHaveCount(1);

  await setMockScenario(page, { payment: "confirmed" });
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada" }),
  ).toBeVisible();
  expect(orderRequests).toHaveLength(2);
  expect(orderRequests[0].key).not.toBe(orderRequests[1].key);
});

test("timeout após criar o pedido recupera o mesmo pedido sem duplicar a compra", async ({
  page,
}) => {
  test.setTimeout(45_000);
  const orderRequests = recordOrderRequests(page);
  const createdOrderIds: string[] = [];
  page.on("response", async (response) => {
    if (
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/orders" &&
      response.status() === 201
    ) {
      createdOrderIds.push((await response.json()).id);
    }
  });
  await setMockScenario(page, { orderTimeout: true });
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  // The mock creates the order but answers after the client timeout (8s).
  await expect(page.getByText(/O serviço demorou para responder/)).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("button", { name: "Confirmar compra" }).click();
  const receipt = page.getByRole("dialog", { name: "Compra confirmada" });
  await expect(receipt).toBeVisible();
  expect(orderRequests).toHaveLength(2);
  expect(orderRequests[1].key).toBe(orderRequests[0].key);
  expect(orderRequests[1].body).toBe(orderRequests[0].body);
  expect(createdOrderIds).toHaveLength(1);
  await receipt.getByRole("button", { name: "Fechar confirmação" }).click();
  await expect(
    page.getByRole("link", {
      name: "Carrinho com 0 itens",
      includeHidden: true,
    }),
  ).toHaveCount(1);
});

test("pedido pendente sobrevive ao refresh e é confirmado pelo Socket.IO", async ({
  page,
}) => {
  await setMockScenario(page, { payment: "pending" });
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  const pendingNotice = page.getByText(/Pagamento em processamento/);
  await expect(pendingNotice).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^(Confirmar compra|Confirmando…)$/ }),
  ).toBeDisabled();

  await page.reload();
  await expect(pendingNotice).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^(Confirmar compra|Confirmando…)$/ }),
  ).toBeDisabled();
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada" }),
  ).toHaveCount(0);

  // The simulated processor confirms the order and notifies its owner through `order.updated`.
  await confirmPendingOrders(page);
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada" }),
  ).toBeVisible();
});