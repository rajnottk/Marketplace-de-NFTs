import type { Page } from "@playwright/test";

export const simulateFullMockStorage = async (page: Page) => {
  const original = await page.evaluateHandle(() => Storage.prototype.setItem);
  await page.evaluate((setItem) => {
    Storage.prototype.setItem = function (key, value) {
      if (key === "kurio.mock-state.v5")
        throw new DOMException("Storage quota exceeded", "QuotaExceededError");
      setItem.call(this, key, value);
    };
  }, original);
  return async () => {
    await page.evaluate((setItem) => {
      Storage.prototype.setItem = setItem;
    }, original);
    await original.dispose();
  };
};