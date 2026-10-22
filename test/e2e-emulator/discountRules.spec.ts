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
  signInAsOwner,
  signInCustomer,
  waitForOrderConfirmation,
} from "./helpers";
import { setPromotionPaymentRestriction } from "./shopState";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - ディスカウント」
// （Vue3-full-test の 17 とは別の綴り）。
//
// 「1. 管理系ディスカウント設定」ケース1 のアクセス権限と、
// 「2. ユーザー系メニュー画面TOPとカート機能」の**支払い方法で絞った割引**。
//
// 手順書は割引の画面を /admin/discounts と書いているが、実装は店舗の下
// （/admin/restaurants/:id/discounts）。**実装の経路で見る。**
//
// 支払いは受け取り払いだけで通せる。カード限定の割引が受け取り払いで効かないこと、
// 現地払い限定の割引が効くこと——絞りの両側がこれで見られる。

const DISCOUNTS_PATH = `/admin/restaurants/${SEED_RESTAURANT_ID}/discounts`;
const SIGNIN_PATH = "/admin/user/signin";
const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;
const PERCENT = 100;
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS, mode: "serial" });

const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);
const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;
const discounted = `-${yen(SEED_PROMOTION_DISCOUNT)}`;

// 閾値を越えるのに要る個数。値段が変わってもここが数え直す。
const ITEMS_OVER_THRESHOLD =
  Math.floor(SEED_PROMOTION_THRESHOLD / withTax(SEED_MENU_PRICE)) + 1;

// ほかの綴りは「絞らない」割引を前提にしている。必ず戻す。
test.afterEach(async () => {
  await setPromotionPaymentRestriction(null);
});

const orderOverThreshold = async (page: Page) => {
  await page.goto(SHOP_PATH);
  await page.getByText("Add", { exact: true }).first().click();
  for (let added = 1; added < ITEMS_OVER_THRESHOLD; added += 1) {
    await page.getByText("add", { exact: true }).first().click();
  }
  await page.getByText("Confirm Cart").click();
  await page.getByText("Checkout").click();
  await waitForOrderConfirmation(page);
};

test.describe("値引きのアクセス権限", () => {
  // ケース1「未ログインユーザー → 割引設定に入れない」
  test("署名していなければ割引設定に入れない", async ({ page }) => {
    await page.goto(DISCOUNTS_PATH);

    await expect(page).toHaveURL(new RegExp(`^.*${SIGNIN_PATH}`));
    await expect(page.getByText("Sign In (for Restaurant)")).toBeVisible();
  });

  // ケース1「テイクアウトご注文のお客様 → 割引設定に入れない」
  test("注文者として署名していても割引設定に入れない", async ({ page }) => {
    await signInCustomer(page);
    await page.goto(DISCOUNTS_PATH);

    await expect(page).toHaveURL(new RegExp(`^.*${SIGNIN_PATH}`));
  });

  test("店舗オーナーは割引設定を開ける", async ({ page }) => {
    await signInAsOwner(page);
    await page.goto(DISCOUNTS_PATH);

    await expect(page).toHaveURL(DISCOUNTS_PATH);
    await expect(page.getByText(SEED_PROMOTION_NAME).first()).toBeVisible();
  });
});

test.describe("支払い方法で絞った値引き", () => {
  // 「カード払い限定の割引 → 受け取り払いでは割引しない金額で決済する」
  test("カード限定の値引きは受け取り払いでは引かれない", async ({ page }) => {
    await setPromotionPaymentRestriction("stripe");

    await signInCustomer(page);
    await orderOverThreshold(page);
    await page
      .getByRole("button", { name: /Place Order/i })
      .first()
      .click();
    await expectOrderPlaced(page);

    await expect(page.getByText(discounted)).toHaveCount(0);
  });

  // 「現地払い限定の割引 → 受け取り払いで割引する」
  test("現地払い限定の値引きは受け取り払いで引かれる", async ({ page }) => {
    await setPromotionPaymentRestriction("instore");

    await signInCustomer(page);
    await orderOverThreshold(page);
    await page
      .getByRole("button", { name: /Place Order/i })
      .first()
      .click();
    await expectOrderPlaced(page);

    await expect(page.getByText(discounted).first()).toBeVisible();
  });
});
