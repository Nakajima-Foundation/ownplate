import { expect, test } from "@playwright/test";

import {
  SEED_RESTAURANT_ID,
  SEED_RESTAURANT_NAME,
} from "../../scripts/seedData";
import { SEED_OWNER_PASSWORD } from "../../scripts/seedData";
import {
  addOneItemAndCheckout,
  signInAsOwner,
  signInByPhone,
  submitOwnerSignIn,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」。
// 注文も管理も、まず署名を通さないと先へ進めない。手順は helpers.ts に寄せてある。

test.describe("お客様の署名", () => {
  // 1. ログイン / ケース1、4. マイページ / ケース3 Step3
  // 「ログイン状況に電話番号、注文履歴、お気に入り、ログアウトを表示する」
  test("電話番号で署名するとマイページがログイン後の内容になる", async ({
    page,
  }) => {
    await page.goto("/u/profile");
    await page.getByText("Sign In as a User").first().click();
    await signInByPhone(page);

    await expect(page.getByText("Sign Out")).toBeVisible();
    await expect(page.getByText("Order History")).toBeVisible();
  });

  // 30. カート機能 / ケース1 Step3 の先。署名していないと注文へ進めない。
  test("署名していないとお会計で本人確認を求められる", async ({ page }) => {
    await page.goto(`/r/${SEED_RESTAURANT_ID}`);
    await page.getByText("Add", { exact: true }).first().click();
    await page.getByText("Confirm Cart").click();
    await page.getByText("Checkout").click();

    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });
});

test.describe("店舗オーナーの署名", () => {
  // 1. ログイン / ケース3「管理者画面へログインできること」
  // 6. 管理画面TOP。店舗の uid と署名した uid が一致する店だけが並ぶ。
  test("メールで署名すると自分の店舗が一覧に出る", async ({ page }) => {
    await signInAsOwner(page);

    await expect(page).toHaveURL("/admin/restaurants");
    await expect(page.getByText(SEED_RESTAURANT_NAME).first()).toBeVisible();
  });

  test("合言葉が違うと管理画面へ入れない", async ({ page }) => {
    await submitOwnerSignIn(page, "wrong-password-9999");

    await expect(page).not.toHaveURL("/admin/restaurants");
    await expect(page.getByText(SEED_RESTAURANT_NAME)).toHaveCount(0);
  });
});
