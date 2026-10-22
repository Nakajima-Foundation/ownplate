import { expect, test } from "@playwright/test";

import {
  SEED_MENU_NAME,
  SEED_MENU_PRICE,
  SEED_RESTAURANT_ID,
  SEED_RESTAURANT_NAME,
  SEED_FOOD_TAX_PERCENT,
} from "../../scripts/seedData";

// 店舗ページは Firestore を読めないと何も描かない。本物の Firebase は App Check を
// 要求するので手元では読めず、ここが通しで確かめられない唯一の画面だった。
// エミュレーターに向けることで、種まきした店舗で実際に描けることを見る。

const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;
const priceWithTax = Math.floor(
  (SEED_MENU_PRICE * (100 + SEED_FOOD_TAX_PERCENT)) / 100,
);

test.describe("店舗ページ（エミュレーター）", () => {
  test("店舗名と説明が出る", async ({ page }) => {
    await page.goto(SHOP_PATH);
    await expect(page.getByText(SEED_RESTAURANT_NAME).first()).toBeVisible();
    await expect(page).toHaveTitle(new RegExp(SEED_RESTAURANT_NAME));
  });

  // menuLists に id が無いと品物は画面に出ない。種まきと画面の両方を押さえる。
  test("品物が価格つきで出る", async ({ page }) => {
    await page.goto(SHOP_PATH);
    await expect(page.getByText(SEED_MENU_NAME).first()).toBeVisible();
    await expect(page.getByText(`¥${priceWithTax}`).first()).toBeVisible();
  });

  // openTimes / businessDay が欠けると受取時刻の組み立てが undefined を踏んで
  // 画面ごと落ちる。描けていること自体がその守り。
  test("受取時刻の案内が出る", async ({ page }) => {
    await page.goto(SHOP_PATH);
    await expect(
      page.getByText(/Minimum available time|受取/).first(),
    ).toBeVisible();
  });

  test("公開されていない店舗は見つからない扱いになる", async ({ page }) => {
    await page.goto("/r/does-not-exist-e2e");
    await expect(page.getByText(SEED_RESTAURANT_NAME)).toHaveCount(0);
  });
});
