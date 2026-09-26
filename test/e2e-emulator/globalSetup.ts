import { execFileSync } from "node:child_process";

import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";

// エミュレーターが上がったあと、試験が始まる前に一度だけ種を蒔く。
export default () => {
  execFileSync("npx", ["tsx", "scripts/seedEmulator.ts"], {
    stdio: "inherit",
    env: {
      ...process.env,
      FIRESTORE_EMULATOR_HOST: `${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}`,
    },
  });
};
