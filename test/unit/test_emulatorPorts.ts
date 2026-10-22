import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

import {
  AUTH_EMULATOR_PORT,
  FIRESTORE_EMULATOR_PORT,
} from "../../src/config/emulatorPorts.ts";

// 口の番号は2箇所にある。firebase.json はエミュレーターが読み、定数の方はアプリと
// 種まきが読む。ずれても誰も落ちず、e2e が「店舗が無い」という顔で失敗するだけ
// なので、原因に辿り着けない。ここで一致を見る。

const firebaseJson: unknown = JSON.parse(
  readFileSync(new URL("../../firebase.json", import.meta.url), "utf8"),
);

const isRecord = (value: unknown): value is { [key: string]: unknown } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const portOf = (name: string): unknown => {
  assert.ok(isRecord(firebaseJson), "firebase.json の形が違う");
  const emulators = firebaseJson.emulators;
  assert.ok(isRecord(emulators), "firebase.json に emulators がない");
  const entry = emulators[name];
  assert.ok(isRecord(entry), `firebase.json の emulators.${name} がない`);
  return entry.port;
};

describe("エミュレーターの口", () => {
  it("firestore の番号が firebase.json と一致する", () => {
    assert.strictEqual(portOf("firestore"), FIRESTORE_EMULATOR_PORT);
  });

  it("auth の番号が firebase.json と一致する", () => {
    assert.strictEqual(portOf("auth"), AUTH_EMULATOR_PORT);
  });

  // 本物の Firebase へ繋がらないよう、demo でない projectId でも使えるように
  // 1プロジェクトに閉じる設定にしてある。
  it("singleProjectMode が入っている", () => {
    assert.ok(isRecord(firebaseJson));
    const emulators = firebaseJson.emulators;
    assert.ok(isRecord(emulators));
    assert.strictEqual(emulators.singleProjectMode, true);
  });
});
