import { expect, test, type Page } from "@playwright/test";

// Contract tests for the orders API, executed in the page so every request goes through the MSW handlers.
type ApiResponse = {
  status: number;
  body: { id?: string; error?: { code: string } } & Record<string, unknown>;
};

const callApi = (
  page: Page,
  path: string,
  init: {
    method?: string;
    token?: string;
    body?: unknown;
    idempotencyKey?: string;
  } = {},
) =>
  page.evaluate(
    async ({ path, init }) => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      if (init.token) headers["x-session-token"] = init.token;
      if (init.idempotencyKey) headers["idempotency-key"] = init.idempotencyKey;
      const response = await fetch(`/api${path}`, {
        method: init.method ?? "GET",
        headers,
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
      });
      return {
        status: response.status,
        body: await response.json().catch(() => ({})),
      } as ApiResponse;
    },
    { path, init },
  );

const signIn = async (page: Page) => {
  const response = await callApi(page, "/auth/login", {
    method: "POST",
    body: { email: "collector@kurio.test", password: "Kurio#2026" },
  });
  expect(response.status).toBe(200);
  return String(response.body.sessionToken);
};

const signUp = async (page: Page) => {
  const response = await callApi(page, "/auth/register", {
    method: "POST",
    body: {
      displayName: "Lia Segura",
      email: `lia-${crypto.randomUUID()}@kurio.test`,
      password: "Kurio#2026",
    },
  });
  expect(response.status).toBe(201);
  return String(response.body.sessionToken);
};

// Adds an NFT and quotes the cart, returning the cart version the user "reviewed".
const prepareQuotedCart = async (
  page: Page,
  token: string,
  network = "Ethereum",
) => {
  expect(
    (
      await callApi(page, "/cart", {
        method: "POST",
        token,
        body: { nftId: "emerald-ape-042", quantity: 1 },
      })
    ).status,
  ).toBe(201);
  expect(
    (
      await callApi(page, "/checkout/quote", {
        method: "POST",
        token,
        body: { coupon: null, network },
      })
    ).status,
  ).toBe(200);
  const cart = await callApi(page, "/cart", { token });
  return Number(cart.body.version);
};

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Teste de contrato da API: independe do viewport.",
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("region", { name: "Explorar NFTs", exact: true }),
  ).toBeVisible();
});

test("repetir a mesma chave recupera o mesmo pedido e outro conteúdo gera conflito", async ({
  page,
}) => {
  const token = await signIn(page);
  const cartVersion = await prepareQuotedCart(page, token);
  const idempotencyKey = crypto.randomUUID();

  const created = await callApi(page, "/orders", {
    method: "POST",
    token,
    idempotencyKey,
    body: { network: "Ethereum", cartVersion },
  });
  expect(created.status).toBe(201);
  const retried = await callApi(page, "/orders", {
    method: "POST",
    token,
    idempotencyKey,
    body: { network: "Ethereum", cartVersion },
  });
  expect(retried.status).toBe(201);
  expect(retried.body.id).toBe(created.body.id);
  expect(retried.body.transactionRef).toBe(created.body.transactionRef);

  const reusedWithOtherContent = await callApi(page, "/orders", {
    method: "POST",
    token,
    idempotencyKey,
    body: { network: "Polygon", cartVersion },
  });
  expect(reusedWithOtherContent.status).toBe(409);
  expect(reusedWithOtherContent.body.error?.code).toBe("IDEMPOTENCY_CONFLICT");
});

test("um usuário não consegue ler nem reaproveitar o pedido de outro", async ({
  page,
}) => {
  const ownerToken = await signIn(page);
  const cartVersion = await prepareQuotedCart(page, ownerToken);
  const idempotencyKey = crypto.randomUUID();
  const created = await callApi(page, "/orders", {
    method: "POST",
    token: ownerToken,
    idempotencyKey,
    body: { network: "Ethereum", cartVersion },
  });
  expect(created.status).toBe(201);

  const otherToken = await signUp(page);
  const otherRead = await callApi(page, `/orders/${created.body.id}`, {
    token: otherToken,
  });
  expect(otherRead.status).toBe(404);
  expect(otherRead.body).not.toHaveProperty("snapshot");
  const otherCartVersion = await prepareQuotedCart(page, otherToken);
  const otherReuse = await callApi(page, "/orders", {
    method: "POST",
    token: otherToken,
    idempotencyKey,
    body: { network: "Ethereum", cartVersion: otherCartVersion },
  });
  expect(otherReuse.status).toBe(409);
  expect(otherReuse.body.error?.code).toBe("IDEMPOTENCY_CONFLICT");

  const ownerRead = await callApi(page, `/orders/${created.body.id}`, {
    token: ownerToken,
  });
  expect(ownerRead.status).toBe(200);
  expect(ownerRead.body.id).toBe(created.body.id);
  expect(ownerRead.body).not.toHaveProperty("ownerId");
  expect(ownerRead.body).not.toHaveProperty("requestFingerprint");
});

test("rejeita o pedido quando o carrinho mudou depois da cotação revisada", async ({
  page,
}) => {
  const token = await signIn(page);
  const reviewedVersion = await prepareQuotedCart(page, token);
  const cart = await callApi(page, "/cart", { token });
  const [item] = cart.body.items as { id: string }[];
  expect(
    (
      await callApi(page, `/cart/${item.id}`, {
        method: "PATCH",
        token,
        body: { quantity: 2 },
      })
    ).status,
  ).toBe(200);

  const stale = await callApi(page, "/orders", {
    method: "POST",
    token,
    idempotencyKey: crypto.randomUUID(),
    body: { network: "Ethereum", cartVersion: reviewedVersion },
  });
  expect(stale.status).toBe(409);
  expect(stale.body.error?.code).toBe("QUOTE_OUTDATED");
  expect(
    ((await callApi(page, "/cart", { token })).body.items as unknown[]).length,
  ).toBe(1);
});