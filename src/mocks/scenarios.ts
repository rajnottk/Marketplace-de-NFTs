import { z } from "zod";

// Configurable, reproducible network and business scenarios for the MSW mocks.
// Selected through `window.kurioMocks.setScenario(...)` or `?mock-scenario=key:value,key:value`,
// and persisted in localStorage so they survive a refresh.

export const mockScenarioSchema = z.object({
  latency: z.enum(["normal", "slow", "variable"]).catch("normal"),
  network: z.enum(["online", "offline"]).catch("online"),
  // Forces an HTTP error on every request whose path starts with `failurePath` (e.g. "/api/nfts").
  failurePath: z.string().nullable().catch(null),
  failureStatus: z.number().int().min(400).max(599).catch(500),
  payment: z.enum(["confirmed", "declined", "pending"]).catch("confirmed"),
  // Creates the order but answers after the client timeout, so the retry must recover it by idempotency key.
  orderTimeout: z.boolean().catch(false),
});

export type MockScenario = z.infer<typeof mockScenarioSchema>;

export const defaultMockScenario: MockScenario = {
  latency: "normal",
  network: "online",
  failurePath: null,
  failureStatus: 500,
  payment: "confirmed",
  orderTimeout: false,
};

const scenarioStorageKey = "kurio.mock-scenario";
const normalLatencyMs = 220;
const slowLatencyMs = 2_000;
const variableLatencyRangeMs = [100, 1_500] as const;
// Well beyond the Axios timeout (8s) in shared/api/api-client.ts, so the client always gives up first,
// even when timers run late on a busy machine.
export const orderTimeoutDelayMs = 15_000;
// Pending payments are confirmed by the simulated processor after this delay.
export const pendingConfirmationDelayMs = 4_000;

const readStoredScenario = (): MockScenario => {
  try {
    const rawScenario = window.localStorage.getItem(scenarioStorageKey);
    return rawScenario
      ? mockScenarioSchema.parse({
          ...defaultMockScenario,
          ...JSON.parse(rawScenario),
        })
      : defaultMockScenario;
  } catch {
    return defaultMockScenario;
  }
};

let scenario = readStoredScenario();
const listeners = new Set<(nextScenario: MockScenario) => void>();

export const getMockScenario = () => scenario;

export const setMockScenario = (changes: Partial<MockScenario>) => {
  scenario = mockScenarioSchema.parse({ ...scenario, ...changes });
  window.localStorage.setItem(scenarioStorageKey, JSON.stringify(scenario));
  listeners.forEach((listener) => listener(scenario));
  return scenario;
};

export const resetMockScenario = () => {
  window.localStorage.removeItem(scenarioStorageKey);
  scenario = defaultMockScenario;
  listeners.forEach((listener) => listener(scenario));
};

export const subscribeToMockScenario = (
  listener: (nextScenario: MockScenario) => void,
) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// `?mock-scenario=latency:slow,payment:declined,failurePath:/api/nfts,failureStatus:503,orderTimeout:true`
export const applyScenarioFromUrl = (search: string) => {
  const rawScenario = new URLSearchParams(search).get("mock-scenario");
  if (!rawScenario) return;
  const changes = Object.fromEntries(
    rawScenario.split(",").map((pair) => {
      const [key, ...valueParts] = pair.split(":");
      const value = valueParts.join(":");
      if (value === "true" || value === "false") return [key, value === "true"];
      if (key === "failureStatus") return [key, Number(value)];
      if (key === "failurePath" && value === "none") return [key, null];
      return [key, value];
    }),
  );
  setMockScenario(changes);
};

// Deterministic PRNG (mulberry32) so "variable" latency produces the same sequence on every run.
const createRandomGenerator = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};
const variableLatencySeed = 20261022;
const nextVariableRandom = createRandomGenerator(variableLatencySeed);

export const getMockLatencyMs = () => {
  if (scenario.latency === "slow") return slowLatencyMs;
  if (scenario.latency === "variable") {
    const [minimum, maximum] = variableLatencyRangeMs;
    return Math.round(minimum + nextVariableRandom() * (maximum - minimum));
  }
  return normalLatencyMs;
};