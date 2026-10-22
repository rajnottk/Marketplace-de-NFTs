import { defineConfig, devices } from "@playwright/test";

// Dedicated port so the suite never reuses a developer's `npm run dev` (which may load a local .env with Firebase keys).
const testServerPort = 5180;
const testServerUrl = `http://127.0.0.1:${testServerPort}`;

export default defineConfig({
  testDir: "./tests",
  // Baselines are shared across operating systems (no {platform} suffix); see README for regenerating them.
  snapshotPathTemplate:
    "{testDir}/{testFileDir}/__screenshots__/{testFileName}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: testServerUrl,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${testServerPort} --strictPort`,
    url: testServerUrl,
    reuseExistingServer: !process.env.CI,
    // Process env wins over .env files in Vite: mocks on, social login unconfigured, for deterministic runs.
    env: {
      VITE_ENABLE_MOCKS: "true",
      VITE_FIREBASE_API_KEY: "",
      VITE_FIREBASE_AUTH_DOMAIN: "",
      VITE_FIREBASE_PROJECT_ID: "",
      VITE_FIREBASE_APP_ID: "",
    },
  },
});