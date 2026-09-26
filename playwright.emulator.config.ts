import { defineConfig, devices } from "@playwright/test";

import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "./src/config/emulatorPorts";

// 本物の Firebase ではなくエミュレーターに向けて動かす e2e。
// 種まきは globalSetup で、エミュレーターが上がったあとに走る。
export default defineConfig({
  testDir: "./test/e2e-emulator",
  globalSetup: "./test/e2e-emulator/globalSetup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command:
        "firebase emulators:start --project ownplate-dev --only auth,firestore,functions",
      url: `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "yarn start",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      env: { VITE_FIREBASE_EMULATOR: "true" },
    },
  ],
});
