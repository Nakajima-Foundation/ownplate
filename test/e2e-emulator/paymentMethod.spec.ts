import { expect, test } from "@playwright/test";

import { SEED_RESTAURANT_ID } from "../../scripts/seedData";
import { setInStorePayment } from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「20. 管理画面 > お支払い方法」ケース1 Step4-6。
// 支払い方法が一つも無い店では注文を受けられない。Stripe は絡めず、受け取り払いの
// 可否だけで見る（noPaymentMethod は stripe と inStore の両方が無いときに真）。

const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;

// ほかの試験は受け取り払いが有効な前提で動く。必ず戻す。
test.afterEach(async () => {
  await setInStorePayment(true);
});

test.describe("支払い方法と注文の可否", () => {
  // Step5「非活性の『オンライン注文未対応』ボタンを表示する」
  test("受け取り払いを切ると注文へ進めない", async ({ page }) => {
    await setInStorePayment(false);

    await page.goto(SHOP_PATH);
    await page.getByText("Add", { exact: true }).first().click();
    await expect(page.getByText(/Subtotal:/).first()).toBeVisible();

    await expect(page.getByText("Online Order Unavailable")).toBeVisible();
    await expect(page.getByText("Confirm Cart")).toHaveCount(0);
  });

  // Step6「受け取り払を許可のチェックを入れ、リロードする → カートに入れられる」
  test("受け取り払いを戻すと注文へ進める", async ({ page }) => {
    await setInStorePayment(false);
    await page.goto(SHOP_PATH);
    await page.getByText("Add", { exact: true }).first().click();
    await expect(page.getByText("Online Order Unavailable")).toBeVisible();

    await setInStorePayment(true);
    await page.reload();
    await page.getByText("Add", { exact: true }).first().click();

    await expect(page.getByText("Confirm Cart")).toBeVisible();
    await expect(page.getByText("Online Order Unavailable")).toHaveCount(0);
  });
});
