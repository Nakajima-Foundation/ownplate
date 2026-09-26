import { expect, test } from "@playwright/test";

import {
  SEED_FOOD_TAX_PERCENT,
  SEED_MENU_NAME,
  SEED_MENU_PRICE,
} from "../../scripts/seedData";
import {
  addOneItemAndCheckout,
  signInAsOwner,
  signInByPhone,
  waitForOrderConfirmation,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」。
// 注文の一周（かご → 本人確認 → 注文確認 → 確定 → 注文状況）。決済は受け取り払い
// なので Stripe は通らない。署名まわりの手順は helpers.ts に寄せてある。

const FLOW_TIMEOUT_MS = 120_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

const PERCENT = 100;

// 画面は税込で出す。端数の落とし方まで含めて実装と合わせる。
const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);

const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

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
