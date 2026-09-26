// e2e 用の店舗を Firestore エミュレーターへ入れる。
// FIRESTORE_EMULATOR_HOST が無ければ止まる（本物へ書く事故を防ぐ）。
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../src/config/emulatorPorts.ts";
import {
  SEED_MENU_ID,
  SEED_OWNER_UID,
  SEED_RESTAURANT_ID,
  SEED_RESTAURANT_NAME,
  seedMenu,
  seedRestaurant,
} from "./seedData.ts";

// アプリが使う projectId と同じでなければ、エミュレーターの中で別の入れ物になる。
const PROJECT_ID = "ownplate-dev";

const requireEmulator = () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      `FIRESTORE_EMULATOR_HOST がありません。${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT} を指してから実行してください。`,
    );
  }
};

const main = async () => {
  requireEmulator();
  initializeApp({ projectId: PROJECT_ID });
  const db = getFirestore();
  const restaurant = db.doc(`restaurants/${SEED_RESTAURANT_ID}`);
  await restaurant.set(seedRestaurant());
  await restaurant.collection("menus").doc(SEED_MENU_ID).set(seedMenu());
  await db
    .doc(`admins/${SEED_OWNER_UID}/public/payment`)
    .set({ stripe: false });
  process.stdout.write(
    `種まき完了: restaurants/${SEED_RESTAURANT_ID}（${SEED_RESTAURANT_NAME}）\n`,
  );
};

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
