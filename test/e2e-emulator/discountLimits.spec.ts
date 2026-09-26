import { expect, test, type Page } from "@playwright/test";

import {
  SEED_FOOD_TAX_PERCENT,
  SEED_MENU_PRICE,
  SEED_PROMOTION_DISCOUNT,
  SEED_PROMOTION_TERM_TO,
  SEED_PROMOTION_THRESHOLD,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";
import {
  expectOrderPlaced,
  signInCustomer,
  waitForOrderConfirmation,
} from "./helpers";
import { setPromotionTermTo, setPromotionUsageRestriction } from "./shopState";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - ディスカウント」
// 「2. ユーザー系メニュー画面TOPとカート機能」ケース4 Step3（利用回数 1 回 →
// 使うとバナーが消える）と「4. キャンペーン期間が終わると自動OFF」。
//
// **どちらも設定を戻してから終わる。** 戻し忘れると、値引きを前提にした
// ほかの綴りが黙って落ちる。

const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;
const BANNER = /キャンペーン実施中/;
const PERCENT = 100;
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS, mode: "serial" });

const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);

const ITEMS_OVER_THRESHOLD =
  Math.floor(SEED_PROMOTION_THRESHOLD / withTax(SEED_MENU_PRICE)) + 1;

test.afterEach(async () => {
  await setPromotionUsageRestriction(false);
  await setPromotionTermTo(SEED_PROMOTION_TERM_TO);
});

const placeDiscountedOrder = async (page: Page) => {
  await page.goto(SHOP_PATH);
  await page.getByText("Add", { exact: true }).first().click();
  for (let added = 1; added < ITEMS_OVER_THRESHOLD; added += 1) {
    await page.getByText("add", { exact: true }).first().click();
  }
  await page.getByText("Confirm Cart").click();
  await page.getByText("Checkout").click();
  await waitForOrderConfirmation(page);
  await expect(
    page.getByText(`-¥${SEED_PROMOTION_DISCOUNT}`).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Place Order/i })
    .first()
    .click();
  await expectOrderPlaced(page);
};

test.describe("値引きの使える回数と期間", () => {
  // ケース4 Step3「一度使うとキャンペーンバナーを表示しない」
  test("一回限りの値引きは使うと出なくなる", async ({ page }) => {
    await setPromotionUsageRestriction(true);
    await signInCustomer(page);

    await page.goto(SHOP_PATH);
    await expect(page.getByText(BANNER)).toBeVisible();

    await placeDiscountedOrder(page);

    await page.goto(SHOP_PATH);
    await expect(page.getByText(BANNER)).toHaveCount(0);
  });

  // 「4. キャンペーン期間が終わると自動OFFになる」
  test("期間が終わった値引きは出なくなる", async ({ page }) => {
    await page.goto(SHOP_PATH);
    await expect(page.getByText(BANNER)).toBeVisible();

    await setPromotionTermTo(new Date("2020-01-02T00:00:00Z"));
    await page.reload();

    await expect(page.getByText(BANNER)).toHaveCount(0);
  });
});
