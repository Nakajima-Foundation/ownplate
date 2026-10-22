import { expect, test, type Page } from "@playwright/test";

import {
  SEED_EDIT_MENU_ID,
  SEED_FOOD_TAX_PERCENT,
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
  SEED_EDIT_RESTAURANT_ID,
} from "../../scripts/seedData";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「10. … > 商品編集」Step10〜Step13（オプションの下見）。
//
// **保存しない。** 入力したそばから下見が変わるところだけを見るので、
// 品物の中身は触らずに済む。

const ADMIN_TOP = "/admin/restaurants";
const ITEM_PATH = `/admin/restaurants/${SEED_EDIT_RESTAURANT_ID}/menus/${SEED_EDIT_MENU_ID}`;
// 下見の金額は**税込**で出る（displayOptionPrice が taxRate を掛ける）。
// 税率は種まきの店舗のもの。
const PERCENT = 100;
const withTax = (amount: number) =>
  Math.round((amount * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);
const plusYen = (amount: number) => `+¥${withTax(amount)}`;

const FLOW_TIMEOUT_MS = 180_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

const signInAsEditOwner = async (page: Page) => {
  await page.goto("/admin/user/signin");
  await page.locator('input[type="email"]').fill(SEED_EDIT_OWNER_EMAIL);
  await page.locator('input[type="password"]').fill(SEED_EDIT_OWNER_PASSWORD);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(ADMIN_TOP);
};

// 種まきの品物は選択肢を持たないので、まず空の欄を一つ足す。
const openItemWithOneOption = async (page: Page) => {
  await signInAsEditOwner(page);
  await page.goto(ITEM_PATH);
  await page.getByRole("button", { name: "Add Option" }).click();
  return page.getByPlaceholder("Enter item option").first();
};

// 下見は「Options Preview」の見出しを持つ枠の中。
const preview = (page: Page) =>
  page.locator("div.rounded-lg").filter({ hasText: "Options Preview" }).last();

test.describe("商品の選択肢の下見", () => {
  // Step10「オプション名を入力する → 下見にチェックボックスを表示する」
  // Step11「名前と金額 → チェックボックスと金額を表示する」
  test("一つだけならチェック欄として下見に出る", async ({ page }) => {
    const option = await openItemWithOneOption(page);

    await option.fill("大盛り");
    await expect(preview(page).locator('input[type="checkbox"]')).toHaveCount(
      1,
    );
    await expect(preview(page)).toContainText("No Change");

    await option.fill("大盛り(+100)");
    await expect(preview(page)).toContainText(plusYen(100));
  });

  // Step12「カンマ区切りで複数 → 下見にラジオボタンを表示する」
  // Step13「複数の名前と金額 → ラジオボタンと金額を表示する」
  test("カンマで区切るとラジオとして下見に出る", async ({ page }) => {
    const option = await openItemWithOneOption(page);

    await option.fill("温,冷");
    await expect(preview(page).locator('input[type="radio"]')).toHaveCount(2);
    await expect(preview(page).locator('input[type="checkbox"]')).toHaveCount(
      0,
    );

    await option.fill("温(+0),冷(+50)");
    await expect(preview(page)).toContainText(plusYen(50));
  });
});
