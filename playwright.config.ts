import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  timeout: process.env.E2E_BASE_URL ? 120_000 : 30_000,
  expect: { timeout: process.env.E2E_BASE_URL ? 15_000 : 5_000 },
  testDir: "./e2e",
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
