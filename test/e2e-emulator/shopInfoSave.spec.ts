import { expect, test, type Page } from "@playwright/test";

import {
  SEED_EDIT_MENU_PRICE,
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
  SEED_EDIT_RESTAURANT_ID,
  SEED_EDIT_RESTAURANT_NAME,
  SEED_FOOD_TAX_PERCENT,
} from "../../scripts/seedData";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「7. 管理画面 > … > 店情報の変更」ケース2 Step12・Step13・Step23-1/23-2。
//
// **ここだけ保存する。** そのために編集専用のオーナーと店舗を種まきしてある
// （seedEditRestaurant）。ほかの試験が使う店舗には触れない。

const ADMIN_TOP = "/admin/restaurants";
const EDIT_PATH = `/admin/restaurants/${SEED_EDIT_RESTAURANT_ID}`;
const SHOP_PATH = `/r/${SEED_EDIT_RESTAURANT_ID}`;
const PERCENT = 100;
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS, mode: "serial" });

const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;
const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);

const signInAsEditOwner = async (page: Page) => {
  await page.goto("/admin/user/signin");
  await page.locator('input[type="email"]').fill(SEED_EDIT_OWNER_EMAIL);
  await page.locator('input[type="password"]').fill(SEED_EDIT_OWNER_PASSWORD);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(ADMIN_TOP);
};

const save = async (page: Page) => {
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page).toHaveURL(new RegExp(`${ADMIN_TOP}/?(#.*)?$`));
};

// 名前は戻す。次に走るときも同じ状態から始められるように。
test.afterEach(async ({ page }) => {
  await page.goto(EDIT_PATH);
  const name = page.getByPlaceholder("Enter restaurant name");
  if ((await name.count()) > 0) {
    await name.fill(SEED_EDIT_RESTAURANT_NAME);
    const inclusive = page.getByText("Tax Icnluded");
    if (await inclusive.isVisible()) {
      const box = page.locator('input[type="checkbox"]').first();
      if (await box.isChecked()) {
        await inclusive.click();
      }
    }
    await save(page);
  }
});

test.describe("店情報の保存", () => {
  // Step12「『飲食店名』を変更し『キャンセル』→ 管理画面。名前は変わらない」
  test("キャンセルすると変更が捨てられる", async ({ page }) => {
    await signInAsEditOwner(page);
    await page.goto(EDIT_PATH);

    await page.getByPlaceholder("Enter restaurant name").fill("捨てられる名前");
    await page.getByText("Cancel").first().click();
    await expect(page).toHaveURL(new RegExp(`${ADMIN_TOP}/?(#.*)?$`));

    await expect(page.getByText(SEED_EDIT_RESTAURANT_NAME)).toBeVisible();
    await expect(page.getByText("捨てられる名前")).toHaveCount(0);
  });

  // Step13「『飲食店名』を変更し保存 → 飲食店カードに変更した名前を表示する」
  // Step14「『ページを確認』→ 入力した値を表示する」
  test("保存すると管理画面とお客様の画面に反映される", async ({ page }) => {
    const renamed = `E2E 改名食堂 ${Date.now()}`;
    await signInAsEditOwner(page);
    await page.goto(EDIT_PATH);

    await page.getByPlaceholder("Enter restaurant name").fill(renamed);
    await save(page);

    await expect(page.getByText(renamed)).toBeVisible();
    await page.goto(SHOP_PATH);
    await expect(page.getByText(renamed).first()).toBeVisible();
  });

  // Step23-1/23-2「内税 ON/OFF で保存 → お客様の金額がすべてその計算になる」
  test("内税で保存するとお客様の金額が内税になる", async ({ page }) => {
    await signInAsEditOwner(page);

    await page.goto(SHOP_PATH);
    await expect(
      page.getByText(yen(withTax(SEED_EDIT_MENU_PRICE))).first(),
    ).toBeVisible();

    await page.goto(EDIT_PATH);
    await page.getByText("Tax Icnluded").click();
    await save(page);

    await page.goto(SHOP_PATH);
    await expect(
      page.getByText(yen(SEED_EDIT_MENU_PRICE)).first(),
    ).toBeVisible();
    await expect(
      page.getByText(yen(withTax(SEED_EDIT_MENU_PRICE))),
    ).toHaveCount(0);
  });
});
