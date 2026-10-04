import { expect, test } from "@playwright/test";

import {
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
  FUNCTIONS_EMULATOR_PORT,
} from "../../src/config/emulatorPorts";
import { SEED_RESTAURANT_ID } from "../../scripts/seedData";
import { signInAsOwner } from "./helpers";

// 招待を出す → 端末が引き換える → その招待で出した QR だけが閉じる、を通しで動かす。
// 画面・Functions・Firestore をまたぐので、純粋関数の試験では届かない。
//
// **端末側の登録ページは踏めない。** 実際の FCM プロジェクトから installation id を
// 取る作りなので、エミュレーターでは回らない。そこだけ関数を直に叩く（引き換えは
// 認証不要で、トークンを知っていることが唯一の資格）。

const PUSH_LIST = `/admin/restaurants/${SEED_RESTAURANT_ID}/pushlist`;
const REDEEM_URL =
  `http://${EMULATOR_HOST}:${FUNCTIONS_EMULATOR_PORT}` +
  `/ownplate-dev/asia-northeast1/redeemPushInvite2`;
const REGISTRATION_URL =
  `http://${EMULATOR_HOST}:${FIRESTORE_EMULATOR_PORT}` +
  `/v1/projects/ownplate-dev/databases/(default)/documents` +
  `/restaurants/${SEED_RESTAURANT_ID}/pushRegistrations`;
const TEST_FID = "e2e-fid-invite-correlation";
const OTHER_FID = "e2e-fid-other-invite";

const removeRegistration = async (fid: string) => {
  await fetch(`${REGISTRATION_URL}/${fid}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer owner" },
  });
};

const redeem = async (token: string, fid: string) => {
  const response = await fetch(REDEEM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: { token, fid, platform: "other", name: "試験端末" },
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`引き換えに失敗: ${response.status} ${body}`);
  }
  return body;
};

// 画面に出ている招待 URL からトークンを取る。端末が読む QR と同じ値。
const shownToken = (text: string) => {
  const match = text.match(/\/pushdevice\/([A-Za-z0-9_-]+)/u);
  if (!match) {
    throw new Error(`招待 URL が読めません: ${text}`);
  }
  return match[1];
};

test.describe.configure({ mode: "serial" });

test.afterEach(async () => {
  await removeRegistration(TEST_FID);
  await removeRegistration(OTHER_FID);
});

test("引き換えると、その招待で出した QR が閉じる", async ({ page }) => {
  await signInAsOwner(page);
  await page.goto(PUSH_LIST);
  await page.getByRole("button", { name: /Add a device/u }).click();

  const urlBox = page.locator("text=/\\/pushdevice\\//").first();
  await expect(urlBox).toBeVisible();
  const token = shownToken((await urlBox.textContent()) ?? "");

  await redeem(token, TEST_FID);

  await expect(page.getByText("To register another device")).toBeVisible();
  await expect(urlBox).toHaveCount(0);
});

test("別の招待で登録されても、出している QR は閉じない", async ({ page }) => {
  await signInAsOwner(page);
  await page.goto(PUSH_LIST);

  // 1つ目を出してトークンだけ控え、閉じずに 2つ目を出す
  await page.getByRole("button", { name: /Add a device/u }).click();
  const urlBox = page.locator("text=/\\/pushdevice\\//").first();
  await expect(urlBox).toBeVisible();
  const firstToken = shownToken((await urlBox.textContent()) ?? "");

  // 2枚目に入れ替わるのを待つ。先に読むと1枚目のままを掴む。
  await page.getByRole("button", { name: /Add a device/u }).click();
  await expect(urlBox).not.toContainText(firstToken);
  const secondToken = shownToken((await urlBox.textContent()) ?? "");

  // 画面に出ているのは2つ目。1つ目で登録しても閉じてはいけない。
  await redeem(firstToken, OTHER_FID);
  await expect(page.getByText(secondToken)).toBeVisible();
  await expect(page.getByText("To register another device")).toHaveCount(0);

  // 出しているほうで登録すれば閉じる
  await redeem(secondToken, TEST_FID);
  await expect(page.getByText("To register another device")).toBeVisible();
});
