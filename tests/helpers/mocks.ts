import type { Page } from "@playwright/test";
import type { MockControls } from "../../src/mocks/controls/mock-controls";
import type { MockScenario } from "../../src/mocks/scenarios";

// Drives the MSW scenarios through `window.kurioMocks`.
type MockControlsWindow = Window & { kurioMocks: MockControls };

// The controls are exposed once the mocks finish starting (asynchronously, before the app renders).
// Requests made before that would bypass MSW and reach the dev server.
export const waitForMocks = (page: Page) => waitForMockControls(page);

const waitForMockControls = (page: Page) =>
  page.waitForFunction(() =>
    Boolean((window as unknown as Partial<MockControlsWindow>).kurioMocks),
  );

export const setMockScenario = async (
  page: Page,
  changes: Partial<MockScenario>,
) => {
  await waitForMockControls(page);
  return page.evaluate(
    (scenarioChanges) =>
      (window as unknown as MockControlsWindow).kurioMocks.setScenario(
        scenarioChanges,
      ),
    changes,
  );
};

export const changeNftPrice = async (
  page: Page,
  nftId: string,
  priceEth: string,
) => {
  await waitForMockControls(page);
  return page.evaluate(
    ([id, price]) => {
      (window as unknown as MockControlsWindow).kurioMocks.changeNftPrice(
        id,
        price,
      );
    },
    [nftId, priceEth] as const,
  );
};

export const markNftSoldOut = async (page: Page, nftId: string) => {
  await waitForMockControls(page);
  return page.evaluate((id) => {
    (window as unknown as MockControlsWindow).kurioMocks.markNftSoldOut(id);
  }, nftId);
};

export const redeliverNftEvent = async (
  page: Page,
  nftId: string,
  which: "latest" | "previous",
) => {
  await waitForMockControls(page);
  return page.evaluate(
    ([id, eventToRedeliver]) =>
      (window as unknown as MockControlsWindow).kurioMocks.redeliverNftEvent(
        id,
        eventToRedeliver,
      ),
    [nftId, which] as const,
  );
};

export const confirmPendingOrders = async (page: Page) => {
  await waitForMockControls(page);
  return page.evaluate(() =>
    (window as unknown as MockControlsWindow).kurioMocks.confirmPendingOrders(),
  );
};

export const expireSessions = async (page: Page) => {
  await waitForMockControls(page);
  return page.evaluate(() =>
    (window as unknown as MockControlsWindow).kurioMocks.expireSessions(),
  );
};

export const dropRealtime = async (page: Page) => {
  await waitForMockControls(page);
  return page.evaluate(() =>
    (window as unknown as MockControlsWindow).kurioMocks.dropRealtime(),
  );
};

export const restoreRealtime = async (page: Page) => {
  await waitForMockControls(page);
  return page.evaluate(() =>
    (window as unknown as MockControlsWindow).kurioMocks.restoreRealtime(),
  );
};