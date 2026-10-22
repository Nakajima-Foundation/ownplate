import { execFileSync } from "node:child_process";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
  FUNCTIONS_EMULATOR_PORT,
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

// functions は最初に呼ばれたときに実体を読み込み、宣言された secret も取りに行く。
// 注文を作る関数は secret を14個持つので、その初回ぶんが最初の注文に乗ると
// アプリ側が待ちきれず「Failed to perform the checkout process」になる。
// 署名なしで呼べば弾かれるが、読み込みと secret の解決だけは済む。
const WARM_UP_FUNCTIONS = ["ping2", "orderCreatedJp2"];

const warmUpFunctions = async () => {
  for (const name of WARM_UP_FUNCTIONS) {
    const url =
      `http://${EMULATOR_HOST}:${FUNCTIONS_EMULATOR_PORT}` +
      `/ownplate-dev/asia-northeast1/${name}`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: {} }),
    }).catch(() => undefined);
  }
};

// エミュレーターが上がったあと、試験が始まる前に一度だけ種を蒔く。
export default async () => {
  await waitUntilAnswering(FIRESTORE_EMULATOR_PORT);
  await waitUntilAnswering(AUTH_EMULATOR_PORT);
  // 注文の確定は Callable を呼ぶ。functions は一番あとに上がるので、ここを待たないと
  // 最初の注文だけが「売り切れかも」で落ちる。
  await waitUntilAnswering(FUNCTIONS_EMULATOR_PORT);
  await warmUpFunctions();
  execFileSync("npx", ["tsx", "scripts/seedEmulator.ts"], {
    stdio: "inherit",
    env: {
      ...process.env,
      FIRESTORE_EMULATOR_HOST: `${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}`,
      FIREBASE_AUTH_EMULATOR_HOST: `${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`,
    },
  });
};
