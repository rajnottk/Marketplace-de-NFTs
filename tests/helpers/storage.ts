import type { Page } from "@playwright/test";
import { mockStatePersistenceKey } from "../../src/mocks/persistence";

export const simulateFullMockStorage = async (page: Page) => {
  const original = await page.evaluateHandle(() => Storage.prototype.setItem);
  await page.evaluate(
    ([setItem, blockedKey]) => {
      Storage.prototype.setItem = function (key, value) {
        if (key === blockedKey)
          throw new DOMException(
            "Storage quota exceeded",
            "QuotaExceededError",
          );
        setItem.call(this, key, value);
      };
    },
    [original, mockStatePersistenceKey] as const,
  );
  return async () => {
    await page.evaluate((setItem) => {
      Storage.prototype.setItem = setItem;
    }, original);
    await original.dispose();
  };
};