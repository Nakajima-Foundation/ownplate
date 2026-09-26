import { execFileSync } from "node:child_process";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";

const READY_WAIT_MS = 60_000;
const READY_POLL_MS = 250;

// playwright が待つのは firestore の口だけで、auth はそのあと少し遅れて上がる。
// 先に種を蒔くと auth への接続が拒否されるので、両方が答えるまで待つ。
const waitUntilAnswering = async (port: number) => {
  const deadline = Date.now() + READY_WAIT_MS;
  for (;;) {
    try {
      await fetch(`http://${EMULATOR_HOST}:${port}/`);
      return;
    } catch {
      if (Date.now() > deadline) {
        throw new Error(`エミュレーターの ${port} が答えません`);
      }
      await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
    }
  }
};

// エミュレーターが上がったあと、試験が始まる前に一度だけ種を蒔く。
export default async () => {
  await waitUntilAnswering(FIRESTORE_EMULATOR_PORT);
  await waitUntilAnswering(AUTH_EMULATOR_PORT);
  execFileSync("npx", ["tsx", "scripts/seedEmulator.ts"], {
    stdio: "inherit",
    env: {
      ...process.env,
      FIRESTORE_EMULATOR_HOST: `${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}`,
      FIREBASE_AUTH_EMULATOR_HOST: `${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`,
    },
  });
};
