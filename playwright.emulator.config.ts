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
  // **手元も一人で走らせる。** 種まきは一つの店舗を皆で使い、売り切れや支払い方法を
  // 切り替える試験がある。並べると隣の試験の足元が変わる。CI と同じ走らせ方にする。
  workers: 1,
  reporter: "html",
  // 画面を配るのは build 済みの静的ファイルだが、冷えた runner は最初の描画が遅い。
  // 既定の 5 秒だと取りこぼす。
  expect: { timeout: 20_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // 秘密の偽物は**エミュレーターが上がる前**に置く。起動時に読まれるので、
      // globalSetup では間に合わない。
      command:
        "npx tsx scripts/writeEmulatorSecrets.ts && " +
        "firebase emulators:start --project ownplate-dev --only auth,firestore,functions",
      url: `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      // 注文が失敗しても画面には「売り切れかもしれません」としか出ない。
      // どの分岐で落ちたかは関数側の console だけが持っているので、流す。
      stdout: "pipe",
      stderr: "pipe",
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
