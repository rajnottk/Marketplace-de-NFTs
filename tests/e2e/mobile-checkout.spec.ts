import { expect, test } from "@playwright/test";
import { completeCollectorLogin, openLogin } from "../helpers/auth";
import { simulateFullMockStorage } from "../helpers/storage";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Fluxo exclusivo do mobile.");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openLogin(page);
  await completeCollectorLogin(page);
  const result = await page.evaluate(async () => {
    const response = await fetch("/api/wallets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-token": localStorage.getItem("kurio.session-token")!,
      },
      body: JSON.stringify({
        label: "Reserva",
        address: "0xreserva",
        network: "Polygon",
        isPrimary: false,
        connectedState: "connected",
        displayName: "Ana Reserva",
        username: "ana-reserva",
        profileName: "Coleção reserva",
        walletType: "MetaMask",
        email: "reserva@kurio.test",
        ensName: "nova.kurio",
        ensSuffix: ".eth",
      }),
    });
    return response.status;
  });
  expect(result).toBe(201);
  await page.goto("/nfts/emerald-ape-042", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Comprar NFT", exact: true }).click();
  await expect(
    page.getByText("Adicionado ao carrinho.", { exact: true }),
  ).toBeVisible();
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Pagamento com carteira" }),
  ).toBeVisible();
});

test("valida e salva apenas a carteira editada, preservando a seleção", async ({
  page,
}, testInfo) => {
  const connected = page.getByRole("group", {
    name: "Carteiras conectadas",
    exact: true,
  });
  await expect(connected.getByRole("radio").first()).toBeChecked();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  const orders: string[] = [];
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname === "/api/orders" &&
      request.method() === "POST"
    )
      orders.push(request.url());
  });
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText(
    "Complete os dados obrigatórios da carteira selecionada. Toque em “Trocar carteira” para configurá-la.",
  );
  expect(orders).toHaveLength(0);
  await page
    .getByRole("button", { name: "Configurar Reserva", exact: true })
    .click();
  const modal = page.getByRole("dialog", {
    name: "Configurar carteira",
    exact: true,
  });
  await expect(modal).not.toContainText(
    "preencha os dados obrigatórios para usar esta carteira no pagamento",
  );
  await expect(modal).toHaveCSS(
    "scrollbar-color",
    "rgb(176, 145, 106) rgb(36, 22, 18)",
  );
  await expect(
    modal.getByRole("textbox", { name: "Nome do perfil", exact: true }),
  ).toHaveValue("Coleção reserva");
  await modal
    .getByRole("textbox", { name: "Nome do perfil", exact: true })
    .fill("Descartar alteração");
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
  await expect(connected.getByRole("radio").first()).toBeChecked();
  await page
    .getByRole("button", { name: "Trocar carteira", exact: true })
    .click();
  await expect(
    modal.getByRole("textbox", { name: "Endereço da carteira", exact: true }),
  ).toHaveValue("0x1af9...7bd2");
  await modal
    .getByRole("button", { name: "Salvar carteira", exact: true })
    .click();
  await expect(
    modal.getByRole("textbox", { name: "Nome do perfil", exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await modal
    .getByRole("textbox", { name: "Nome de exibição", exact: true })
    .fill("Ana Principal");
  await modal
    .getByRole("textbox", { name: "Nome de usuário", exact: true })
    .fill("ana-principal");
  await modal
    .getByRole("textbox", { name: "Nome do perfil", exact: true })
    .fill("Coleção principal");
  await modal
    .getByRole("combobox", { name: "Tipo de carteira", exact: true })
    .click();
  await page.getByRole("option", { name: "MetaMask", exact: true }).click();
  const restoreStorage = await simulateFullMockStorage(page);
  await modal
    .getByRole("button", { name: "Salvar carteira", exact: true })
    .click();
  await expect(modal.getByRole("alert")).toContainText(
    "Não há espaço disponível no navegador",
  );
  await expect(
    modal.getByRole("textbox", { name: "Nome do perfil", exact: true }),
  ).toHaveValue("Coleção principal");
  await restoreStorage();
  await modal
    .getByRole("button", { name: "Salvar carteira", exact: true })
    .click();
  await expect(modal).toHaveCount(0);
  await expect(
    connected.getByRole("radio", { name: /Carteira principal/ }),
  ).toBeChecked();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Trocar carteira", exact: true })
    .click();
  await expect(
    modal.getByRole("textbox", { name: "Nome de usuário", exact: true }),
  ).toHaveValue("ana-principal");
  await page.screenshot({
    path: testInfo.outputPath("wallet-configuration.png"),
  });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Configurar Reserva", exact: true })
    .click();
  await expect(
    modal.getByRole("textbox", { name: "Nome do perfil", exact: true }),
  ).toHaveValue("Coleção reserva");
  await page.keyboard.press("Escape");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(connected.getByRole("radio").first()).toBeChecked();
});

test("recalcula a rede selecionada e confirma a compra", async ({
  page,
}, testInfo) => {
  await expect(
    page.getByRole("button", { name: "Confirmar compra", exact: true }),
  ).toHaveCSS("background-color", "rgb(210, 138, 76)");
  await expect(
    page.getByRole("button", { name: "Confirmar compra", exact: true }),
  ).toHaveCSS("background-image", "none");
  const connected = page.getByRole("group", {
    name: "Carteiras conectadas",
    exact: true,
  });
  await connected.getByRole("radio", { name: /Reserva/ }).check();
  await expect(
    page.getByText("Atualizando total…", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("group", { name: "Carteira e rede", exact: true })
    .getByRole("radio", { name: "WalletConnect", exact: true })
    .check();
  await page.screenshot({ path: testInfo.outputPath("mobile-checkout.png") });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  const confirmation = page.getByRole("dialog", {
    name: "Compra confirmada",
    exact: true,
  });
  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByText(/Transação confirmada na Polygon/),
  ).toBeVisible();
  await expect(
    confirmation.getByText("WalletConnect", { exact: true }),
  ).toBeVisible();
});

test("aceita uma única carteira configurada pelo perfil e mantém o tamanho do botão ao salvar", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const headers = {
      "Content-Type": "application/json",
      "x-session-token": localStorage.getItem("kurio.session-token")!,
    };
    const wallets = (await (
      await fetch("/api/wallets", { headers })
    ).json()) as { id: string; isPrimary: boolean; profileName?: string }[];
    for (const wallet of wallets) {
      const response = await fetch(`/api/wallets/${wallet.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          ...wallet,
          connectedState: "disconnected",
          profileName: wallet.isPrimary ? wallet.profileName : "",
        }),
      });
      if (!response.ok)
        throw new Error("Não foi possível preparar as carteiras do cenário.");
    }
  });
  await page.goto("/account/wallet", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("textbox", { name: "Apelido da carteira", exact: true })
    .fill("Carteira do perfil");
  await page
    .getByRole("textbox", { name: "Nome de exibição", exact: true })
    .fill("Ana Principal");
  await page
    .getByRole("textbox", { name: "Nome do perfil", exact: true })
    .fill("Coleção principal");
  await page
    .getByRole("combobox", { name: "Tipo de carteira", exact: true })
    .click();
  await page.getByRole("option", { name: "MetaMask", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Código de indicação", exact: true })
    .fill("KURIO2026");
  await page
    .getByRole("textbox", { name: "Nome ENS", exact: true })
    .fill("ana");
  const saveButton = page.getByRole("button", {
    name: "Salvar carteira",
    exact: true,
  });
  const before = (await saveButton.boundingBox())!;
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 100));
  await saveButton.evaluate((element: HTMLButtonElement) => element.click());
  await expect(saveButton).toHaveAttribute("aria-busy", "true");
  await expect(saveButton).toHaveText("Salvar carteira");
  await expect(saveButton.locator("svg")).toBeVisible();
  const during = (await saveButton.boundingBox())!;
  expect(during.width).toBe(before.width);
  expect(during.height).toBe(before.height);
  await page.clock.resume();
  await expect(
    page.getByText("Carteira salva com sucesso.", { exact: true }),
  ).toBeVisible();
  await expect(saveButton).toHaveAttribute("aria-busy", "false");
  await page.goto("/checkout", { waitUntil: "domcontentloaded" });
  const wallets = page.getByRole("group", {
    name: "Carteiras conectadas",
    exact: true,
  });
  await expect(wallets.getByRole("radio")).toHaveCount(1);
  await expect(
    wallets.getByRole("radio", { name: /Carteira do perfil/ }),
  ).toBeChecked();
  await expect(
    page.getByText("Você ainda não tem uma carteira conectada.", {
      exact: false,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Compra confirmada", exact: true }),
  ).toBeVisible();
});