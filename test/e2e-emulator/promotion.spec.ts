import { expect, test, type Page } from "@playwright/test";

import {
  SEED_FOOD_TAX_PERCENT,
  SEED_MENU_PRICE,
  SEED_PROMOTION_DISCOUNT,
  SEED_PROMOTION_NAME,
  SEED_PROMOTION_THRESHOLD,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";
import {
  expectOrderPlaced,
  signInCustomer,
  waitForOrderConfirmation,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「17. 管理画面 > 飲食店一覧 > 飲食店カード > 値引き」ケース1 Step3・Step4。
//
// **欄が出ないことも見る。** 値引きが効かない注文で欄が出てしまう筋があった
// （omochikaeri-docs #224 の #1973）。出る側だけを見ると、その筋は素通りする。

const FLOW_TIMEOUT_MS = 180_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;
const PERCENT = 100;

const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);

const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

// 閾値を越えるのに要る個数。値段を変えても、ここが自分で数え直す。
const ITEMS_OVER_THRESHOLD =
  Math.floor(SEED_PROMOTION_THRESHOLD / withTax(SEED_MENU_PRICE)) + 1;
const OVER_THRESHOLD_TOTAL = withTax(SEED_MENU_PRICE * ITEMS_OVER_THRESHOLD);

const addPlainItems = async (page: Page, count: number) => {
  await page.goto(SHOP_PATH);
  await page.getByText("Add", { exact: true }).first().click();
  for (let added = 1; added < count; added += 1) {
    await page.getByText("add", { exact: true }).first().click();
  }
  await expect(
    page.getByText(`Subtotal: ${yen(withTax(SEED_MENU_PRICE * count))}`),
  ).toBeVisible();
  await page.getByText("Confirm Cart").click();
  await expect(page.getByText("Checkout")).toBeVisible();
  await page.getByText("Checkout").click();
};

test.describe("値引きキャンペーン", () => {
  // ケース1 Step3「割引期間内：『最大￥100値引きキャンペーン実施中！』を表示する」
  test("かごが空のとき店舗の画面にキャンペーンが出る", async ({ page }) => {
    await page.goto(SHOP_PATH);

    await expect(page.getByText(/キャンペーン実施中/)).toBeVisible();
    await expect(
      page.getByText(new RegExp(`最大.*${SEED_PROMOTION_DISCOUNT}`)),
    ).toBeVisible();
  });

  // ケース1 Step4「合計金額2000円未満：割引なし」
  test("閾値に届かない注文では値引きの欄が出ない", async ({ page }) => {
    await signInCustomer(page);
    await addPlainItems(page, 1);
    await waitForOrderConfirmation(page);

    // 「Total Charge」の字は値引きが無くても出るので、それでは見分けられない。
    // 値引きの欄にしか出ないもの——名前と引かれる額——で見る。
    await expect(page.getByText(SEED_PROMOTION_NAME)).toHaveCount(0);
    await expect(
      page.getByText(`-${yen(SEED_PROMOTION_DISCOUNT)}`),
    ).toHaveCount(0);
    // 欄が出ないだけでなく、画面が最後まで描けていること。
    await expect(
      page.getByText(yen(withTax(SEED_MENU_PRICE))).first(),
    ).toBeVisible();
  });

  // ケース1 Step4「合計金額2000円以上：100円引き」
  test("閾値を越えた注文では値引きが引かれる", async ({ page }) => {
    await signInCustomer(page);
    await addPlainItems(page, ITEMS_OVER_THRESHOLD);
    await waitForOrderConfirmation(page);

    await expect(page.getByText(SEED_PROMOTION_NAME).first()).toBeVisible();
    await expect(
      page.getByText(`-${yen(SEED_PROMOTION_DISCOUNT)}`).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(yen(OVER_THRESHOLD_TOTAL - SEED_PROMOTION_DISCOUNT))
        .first(),
    ).toBeVisible();

    await page
      .getByRole("button", { name: /Place Order/i })
      .first()
      .click();
    await expectOrderPlaced(page);
  });
});
