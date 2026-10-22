import { expect, test } from "@playwright/test";
import { completeCollectorLogin, openLogin } from "../helpers/auth";
import { expireSessions, setMockScenario } from "../helpers/mocks";

// Network scenarios are selected through the MSW scenario controls; every request still goes through the handlers.

test("latência lenta mostra skeletons até os dados chegarem", async ({
  page,
}) => {
  const catalog = page.getByRole("region", {
    name: "Explorar NFTs",
    exact: true,
  });
  await page.goto("/");
  await expect(catalog.locator("article").first()).toBeVisible();
  await setMockScenario(page, { latency: "slow" });
  await page.getByRole("button", { name: "Página 2", exact: true }).click();
  await expect(catalog.getByLabel("Carregando NFTs")).toBeVisible();
  await page.waitForTimeout(1_000);
  await expect(catalog.getByLabel("Carregando NFTs")).toBeVisible();
  await expect(catalog.locator("article").first()).toBeVisible({
    timeout: 10_000,
  });
});

test("falha 5xx mostra o erro e a nova tentativa recupera o catálogo", async ({
  page,
}) => {
  const catalog = page.getByRole("region", {
    name: "Explorar NFTs",
    exact: true,
  });
  await page.goto("/");
  await setMockScenario(page, { failurePath: "/api/nfts", failureStatus: 503 });
  await page.reload();
  await expect(
    catalog.getByRole("heading", {
      name: "Não foi possível carregar o catálogo",
    }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    catalog.getByText("Serviço temporariamente indisponível. Tente novamente."),
  ).toBeVisible();

  await setMockScenario(page, { failurePath: null });
  await catalog.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(catalog.locator("article").first()).toBeVisible();
  await expect(
    catalog.getByRole("heading", {
      name: "Não foi possível carregar o catálogo",
    }),
  ).toHaveCount(0);
});

test("sem conexão informa a falha e recupera quando a rede volta", async ({
  page,
}) => {
  const catalog = page.getByRole("region", {
    name: "Explorar NFTs",
    exact: true,
  });
  await page.goto("/");
  await setMockScenario(page, { network: "offline" });
  await page.reload();
  await expect(
    catalog.getByText(
      "Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.",
    ),
  ).toBeVisible({ timeout: 15_000 });

  await setMockScenario(page, { network: "online" });
  await catalog.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(catalog.locator("article").first()).toBeVisible();
});

test("sessão expirada durante a navegação pede novo login sem perder a página", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openLogin(page);
  await completeCollectorLogin(page);
  await page.goto("/account/wallet");
  await expect(
    page.getByRole("navigation", { name: "Configurações da conta" }),
  ).toBeVisible();

  await expireSessions(page);
  await page.goto("/account/profile");
  await expect(page.locator("[data-realtime-notice]")).toContainText(
    "Sua sessão expirou",
  );
  await expect(page).toHaveURL("/account/profile");
  await expect(
    page.getByRole("dialog", { name: "Entrar na Kurio" }),
  ).toBeVisible();
});