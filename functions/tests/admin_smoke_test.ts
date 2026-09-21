// firebase-admin の modular API が実行時に解決できることを確かめる。
// 型チェックでは「admin.firestore が実行時に消えた」ことを検出できないため、
// 実際に Firestore emulator へ読み書きして確認する。
//
// 事前に emulator が必要:
//   firebase emulators:start --only firestore --project firestore-emulator-ownplate
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "localhost:8080";
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT ?? "firestore-emulator-ownplate";

import { describe, it } from "node:test";
import assert from "node:assert";

import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, Firestore, Timestamp, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

import * as utils from "../src/lib/utils";

const DEFAULT_APP_NAME = "[DEFAULT]";
const SMOKE_PATH = "smoke/adminMigration";
const MISSING_RESTAURANT_ID = "noSuchRestaurantForSmokeTest";

// 本番コードと同じ初期化手順。gen2 が名前付きアプリを登録しても取りこぼさない
const initialize = (): Firestore => {
  if (!getApps().some((app) => app.name === DEFAULT_APP_NAME)) {
    initializeApp({ projectId: process.env.GCLOUD_PROJECT });
  }
  return getFirestore();
};

describe("firebase-admin modular API", () => {
  it("initializes the default app and resolves Firestore", () => {
    const db = initialize();
    assert.ok(db instanceof Firestore);
    assert.strictEqual(getApps().filter((app) => app.name === DEFAULT_APP_NAME).length, 1);
  });

  it("writes with FieldValue.serverTimestamp and reads back a Timestamp", async () => {
    const db = initialize();
    await db.doc(SMOKE_PATH).set({ updatedAt: FieldValue.serverTimestamp(), marker: "ok" });
    const snapshot = await db.doc(SMOKE_PATH).get();
    assert.strictEqual(snapshot.get("marker"), "ok");
    assert.ok(snapshot.get("updatedAt") instanceof Timestamp);
    await db.doc(SMOKE_PATH).delete();
  });

  it("runs a migrated helper that takes the Firestore instance", async () => {
    const db = initialize();
    // 存在しない店舗なので undefined が返るのが正。ここで見たいのは
    // getFirestore() 由来の db が実コードのクエリで使えることのほう。
    assert.strictEqual(await utils.get_restaurant_line_config(db, MISSING_RESTAURANT_ID), undefined);
  });

  it("resolves the other migrated service entry points", () => {
    initialize();
    assert.strictEqual(typeof getAuth().getUser, "function");
    assert.strictEqual(typeof getStorage().bucket, "function");
  });
});
