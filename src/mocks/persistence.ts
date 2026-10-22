// Single source for the localStorage key of the mock database (also used by the Playwright helpers).
export const mockStatePersistenceKey = "kurio.mock-state.v7";

export class MockPersistenceError extends Error {
  readonly code: "BROWSER_STORAGE_FULL" | "BROWSER_STORAGE_UNAVAILABLE";

  constructor(cause: unknown) {
    const isFull =
      cause instanceof Error &&
      (cause.name === "QuotaExceededError" ||
        cause.name === "NS_ERROR_DOM_QUOTA_REACHED");
    super(
      isFull
        ? "Não há espaço disponível no navegador para salvar os dados. Libere espaço deste site e tente novamente."
        : "O navegador bloqueou o armazenamento dos dados. Permita o armazenamento deste site e tente novamente.",
    );
    this.name = "MockPersistenceError";
    this.code = isFull ? "BROWSER_STORAGE_FULL" : "BROWSER_STORAGE_UNAVAILABLE";
  }
}

export const persistMockState = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (cause) {
    throw new MockPersistenceError(cause);
  }
};