import { defineConfig } from "@playwright/test";

// Runs against a real gateway and Stellar testnet, so steps wait on ledgers: be generous.
export default defineConfig({
  testDir: "e2e",
  timeout: 8 * 60_000,
  expect: { timeout: 90_000 },
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:5173", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "pnpm dev", url: "http://localhost:5173", reuseExistingServer: true },
});
