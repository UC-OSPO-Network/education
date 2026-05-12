import { defineConfig, devices } from "@playwright/test";

const port = Number.parseInt(process.env.A11Y_PORT || "4321", 10);

export default defineConfig({
  testDir: "./tests/a11y",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://127.0.0.1:${port}/education/`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node scripts/accessibility/serve-local-preview.mjs",
    url: `http://127.0.0.1:${port}/education/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
