// e2e 用の店舗を Firestore エミュレーターへ入れる。
// FIRESTORE_EMULATOR_HOST が無ければ止まる（本物へ書く事故を防ぐ）。
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
} from "../src/config/emulatorPorts.ts";
import {
  SEED_MENU_ID,
  SEED_OPTION_MENU_ID,
  SEED_OWNER_EMAIL,
  SEED_OWNER_PASSWORD,
  SEED_OWNER_UID,
  SEED_RESTAURANT_ID,
  SEED_RESTAURANT_NAME,
  seedMenu,
  seedOptionMenu,
  seedRestaurant,
} from "./seedData.ts";

// アプリが使う projectId と同じでなければ、エミュレーターの中で別の入れ物になる。
const PROJECT_ID = "ownplate-dev";

// 何度走らせても同じ並びになるよう、固定の時刻を使う。
const SEEDED_AT = new Date("2026-01-01T00:00:00Z");

const requireEmulator = () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error(
      `FIRESTORE_EMULATOR_HOST がありません。${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT} を指してから実行してください。`,
    );
  }
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    throw new Error(
      `FIREBASE_AUTH_EMULATOR_HOST がありません。${EMULATOR_HOST}:${AUTH_EMULATOR_PORT} を指してから実行してください。`,
    );
  }
};

// 何度走らせても同じ状態になるように、同じメールを持つ古い利用者を消してから作る。
// uid を変えたときに「メールは使用中、uid は無い」で詰まるのを避ける。
const upsertOwner = async () => {
  const auth = getAuth();
  const existing = await auth
    .getUserByEmail(SEED_OWNER_EMAIL)
    .catch(() => null);
  if (existing) {
    await auth.deleteUser(existing.uid);
  }
  await auth.createUser({
    uid: SEED_OWNER_UID,
    email: SEED_OWNER_EMAIL,
    password: SEED_OWNER_PASSWORD,
    emailVerified: true,
  });
};

const main = async () => {
  requireEmulator();
  initializeApp({ projectId: PROJECT_ID });
  const db = getFirestore();
  const restaurant = db.doc(`restaurants/${SEED_RESTAURANT_ID}`);
  await restaurant.set(seedRestaurant(SEEDED_AT));
  await restaurant.collection("menus").doc(SEED_MENU_ID).set(seedMenu());
  await restaurant
    .collection("menus")
    .doc(SEED_OPTION_MENU_ID)
    .set(seedOptionMenu());
  // inStore を立てると受け取り払いになり、Stripe 無しで注文まで進める。
  // PaymentInfo の stripe は文字列なので、偽の false を置くのは誤り。
  await upsertOwner();
  await db
    .doc(`admins/${SEED_OWNER_UID}/public/payment`)
    .set({ inStore: true });
  process.stdout.write(
    `種まき完了: restaurants/${SEED_RESTAURANT_ID}（${SEED_RESTAURANT_NAME}）\n`,
  );
};

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
