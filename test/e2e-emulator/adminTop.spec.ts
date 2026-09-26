import { expect, test } from "@playwright/test";

import {
  SEED_RESTAURANT_ID,
  SEED_RESTAURANT_NAME,
} from "../../scripts/seedData";
import { setSimpleMode, signInAsOwner } from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「6. 管理画面TOP」。飲食店カードの各導線が行き先へ着くかを見る。
//
// **「シンプル/全て」は管理者ごとに Firestore へ残る。** 画面から押して確かめると
// 次の試験へ持ち越すので、状態は先に置いてから開く。

const ADMIN_TOP = "/admin/restaurants";
const CARD_BASE = `/admin/restaurants/${SEED_RESTAURANT_ID}`;

test.describe.configure({ mode: "serial" });

test.afterEach(async () => {
  await setSimpleMode(false);
});

test.describe("管理画面トップの飲食店カード", () => {
  // ケース6 Step3「公開中飲食店の『ページを確認』→ プレビュー画面」
  test("ページを確認から店舗の画面へ行ける", async ({ page }) => {
    await signInAsOwner(page);
    await page.getByText("View Page").first().click();

    await expect(page).toHaveURL(new RegExp(`/r/${SEED_RESTAURANT_ID}`));
    await expect(page.getByText(SEED_RESTAURANT_NAME).first()).toBeVisible();
  });

  // ケース6 Step5「『店舗情報の変更』→ 飲食店編集画面。
  // 『キャンセル』をクリックすると管理画面に戻る」
  test("店情報の変更へ入って戻れる", async ({ page }) => {
    await signInAsOwner(page);
    await page.getByText("Edit Info").first().click();
    await expect(page).toHaveURL(CARD_BASE);

    // 戻り先は一覧だが、押した店舗の位置まで飛ぶので錨が付く。
    await page.getByText("Cancel").first().click();
    await expect(page).toHaveURL(new RegExp(`${ADMIN_TOP}/?(#.*)?$`));
  });

  // ケース6 Step7「『注文を確認 {件数}の未完了』→ 注文一覧画面」
  test("注文を確認から注文一覧へ行ける", async ({ page }) => {
    await signInAsOwner(page);
    await page.getByText("View Orders").first().click();

    await expect(page).toHaveURL(`${CARD_BASE}/orders`);
  });

  // ケース6 Step8「『メニュー {メニュー数}』→ メニュー一覧編集画面」
  test("メニューから商品一覧へ行ける", async ({ page }) => {
    await signInAsOwner(page);
    await page.getByText("Menu", { exact: true }).first().click();

    await expect(page).toHaveURL(`${CARD_BASE}/menus`);
  });

  // ケース4 Step1/Step2「『シンプル』→ 限られた導線だけ。『全て』→ 通知なども出す」
  test("シンプルにすると導線が絞られ、全てにすると戻る", async ({ page }) => {
    await setSimpleMode(false);
    await signInAsOwner(page);
    await expect(page.getByText("Discount").first()).toBeVisible();

    await setSimpleMode(true);
    await expect(page.getByText("Discount")).toHaveCount(0);
    // 絞られても、注文とメニューへは行ける。
    await expect(page.getByText("View Orders").first()).toBeVisible();
    await expect(page.getByText("Menu", { exact: true }).first()).toBeVisible();

    await setSimpleMode(false);
    await expect(page.getByText("Discount").first()).toBeVisible();
  });
});
