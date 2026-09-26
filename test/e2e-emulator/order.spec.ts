import { expect, test, type Page } from "@playwright/test";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
} from "../../src/config/emulatorPorts";
import {
  SEED_FOOD_TAX_PERCENT,
  SEED_MENU_NAME,
  SEED_MENU_PRICE,
  SEED_OWNER_EMAIL,
  SEED_OWNER_PASSWORD,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」。
// 注文の一周（かご → 本人確認 → 注文確認 → 確定 → 注文状況）と、それが店舗側に
// 見えるところまで。決済は受け取り払いなので Stripe は通らない。

// かごに入れる → 本人確認 → 注文確認 → 確定、と関数呼び出しを何度も挟むので、
// 既定の 30 秒では足りない。遅い機械でも通る幅を取る。
const FLOW_TIMEOUT_MS = 120_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

const PERCENT = 100;
const PHONE_NUMBER = "09012345678";
const VERIFICATION_CODES_URL = `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}/emulator/v1/projects/ownplate-dev/verificationCodes`;
const CODE_WAIT_MS = 15_000;
const CODE_POLL_MS = 250;

const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);
const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

const verificationCodes = async (): Promise<{ code: string }[]> => {
  const response = await fetch(VERIFICATION_CODES_URL);
  const body = (await response.json()) as {
    verificationCodes: { code: string }[];
  };
  return body.verificationCodes;
};

// 確認コードはすぐには届かない。増えるまで見に行く。
const waitForNewVerificationCode = async (seen: number): Promise<string> => {
  const deadline = Date.now() + CODE_WAIT_MS;
  for (;;) {
    const codes = await verificationCodes();
    if (codes.length > seen) {
      return codes[codes.length - 1].code;
    }
    if (Date.now() > deadline) {
      throw new Error("エミュレーターに確認コードが増えませんでした");
    }
    await new Promise((resolve) => setTimeout(resolve, CODE_POLL_MS));
  }
};

// 各段階が出てから次を押す。まとめて押すと、まだ手が付いていない画面を叩いて
// 静かに進まなくなる（待ち時間を足しても直らない）。
const addOneItemAndCheckout = async (page: Page) => {
  await page.goto(`/r/${SEED_RESTAURANT_ID}`);
  await page.getByText("Add", { exact: true }).first().click();
  await expect(page.getByText(/Subtotal:/).first()).toBeVisible();

  await page.getByText("Confirm Cart").click();
  await expect(page.getByText("Checkout")).toBeVisible();

  await page.getByText("Checkout").click();
  await expect(page.locator('input[type="tel"]')).toBeVisible();
};

const signInByPhone = async (page: Page) => {
  const before = (await verificationCodes()).length;
  await page.locator('input[type="tel"]').fill(PHONE_NUMBER);
  await page.getByRole("button", { name: "Send SMS" }).click();

  const codeField = page.getByPlaceholder(
    "Please type the code you've received",
  );
  await expect(codeField).toBeVisible();
  await codeField.fill(await waitForNewVerificationCode(before));

  const nameField = page.locator('input[placeholder="John Smith"]');
  await expect(nameField).toBeVisible();
  await nameField.fill("試験 太郎");
  await page.getByRole("button", { name: "Send", exact: true }).click();
};

// 署名のあと、注文が作られて注文確認へ移るまで待つ。
const waitForOrderConfirmation = async (page: Page) => {
  await page.waitForURL(new RegExp(`/r/${SEED_RESTAURANT_ID}/order/`));
  await expect(
    page.getByRole("button", { name: /Place Order/i }).first(),
  ).toBeVisible();
};

test.describe("注文の一周", () => {
  // 30. カート機能 / ケース1 の先。orderCreated が金額を組み立て直すので、
  // ここが落ちると注文が status: error で止まり「売り切れかも」とだけ出る。
  test("注文確認画面に小計・税・合計が出る", async ({ page }) => {
    await addOneItemAndCheckout(page);
    await signInByPhone(page);
    await waitForOrderConfirmation(page);

    await expect(
      page.getByText(yen(withTax(SEED_MENU_PRICE))).first(),
    ).toBeVisible();
  });

  test("確定すると注文状況が Order Placed になる", async ({ page }) => {
    await addOneItemAndCheckout(page);
    await signInByPhone(page);
    await waitForOrderConfirmation(page);
    await page
      .getByRole("button", { name: /Place Order/i })
      .first()
      .click();

    await expect(page.getByText("Order Placed")).toBeVisible();
    await expect(page.getByText(SEED_MENU_NAME).first()).toBeVisible();
    await expect(
      page.getByText(yen(withTax(SEED_MENU_PRICE))).first(),
    ).toBeVisible();
  });
});

test.describe("店舗側から見える注文", () => {
  // 8. 管理画面 > 飲食店カード > 注文を確認。お客様が出した注文が店舗に届くこと。
  test("確定した注文が店舗の未処理件数に出る", async ({ page }) => {
    await addOneItemAndCheckout(page);
    await signInByPhone(page);
    await waitForOrderConfirmation(page);
    await page
      .getByRole("button", { name: /Place Order/i })
      .first()
      .click();
    await expect(page.getByText("Order Placed")).toBeVisible();

    await page.goto("/admin/user/signin");
    await page.locator('input[type="email"]').fill(SEED_OWNER_EMAIL);
    await page.locator('input[type="password"]').fill(SEED_OWNER_PASSWORD);
    await page.getByRole("button", { name: "Next" }).click();

    await expect(page).toHaveURL("/admin/restaurants");
    await expect(page.getByText(/Incomplete/).first()).toBeVisible();
    await expect(page.getByText("0 Incomplete")).toHaveCount(0);
  });
});
