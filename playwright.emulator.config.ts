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
  // dev server は要求されて初めて変換するので、最初に開く画面だけ描画が遅い。
  // 既定の 5 秒だと冷えた状態（CI は毎回これ）で取りこぼす。
  expect: { timeout: 20_000 },
  // dev server は要求されて初めて変換するので、最初に開く画面だけ描画が遅い。
  // 既定の 5 秒だと冷えた状態（CI は毎回これ）で取りこぼす。
  expect: { timeout: 20_000 },
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
      // dev server はその場で変換するので、最初に開く画面の描画が機械の速さに
      // 引きずられる（遅い runner では何十秒も待たされる）。**本番と同じ build を
      // 配る。** 旗は build 時に埋め込まれるので、build 側にも渡す。
      command: "yarn build && npx vite preview --port 3000 --strictPort",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      env: { VITE_FIREBASE_EMULATOR: "true" },
      timeout: 300_000,
    },
  ],
});
