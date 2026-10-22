import { expect, test, type Page } from "@playwright/test";

import {
  SEED_CHECKBOX_OPTION_PRICE,
  SEED_FOOD_TAX_PERCENT,
  SEED_MENU_PRICE,
  SEED_OPTION_MENU_PRICE,
  SEED_RADIO_SECOND_PRICE,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」。
// 各試験に、どの大項目のどのケース・Step から起こしたかを書いてある。行番号は
// 書かない（表を編集するとずれる）。Step 番号を持たない行は手順の文言で示す。
//
// ここで見るのは金額。選んだ選択肢の合計とカートの金額が合うこと、数量の増減が
// 両方に効くこと。決済そのものは Stripe が要るので、受け取り払い（inStore）で止める。

const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;
const PERCENT = 100;

// 画面は税込で出す。端数の落とし方まで含めて実装と合わせる。
const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);

const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

const openItem = async (page: Page, index: number) => {
  await page.goto(SHOP_PATH);
  await page.getByText("Add", { exact: true }).nth(index).click();
};

const PLAIN_ITEM = 0;
const OPTION_ITEM = 1;

test.describe("かごの金額", () => {
  // 30. カート機能 / ケース1 Step1（選択肢の無い品物で）
  test("品物を入れると小計とカートに税込の金額が出る", async ({ page }) => {
    await openItem(page, PLAIN_ITEM);
    const expected = yen(withTax(SEED_MENU_PRICE));
    await expect(page.getByText(`Subtotal: ${expected}`)).toBeVisible();
    await expect(page.getByText("Confirm Cart")).toBeVisible();
  });

  // 30. カート機能 / ケース1 Step1、26. 商品の表示 / ケース5 Step1
  // 「選択した商品の合計金額と『カート』の金額が合致している」
  test("選択肢を足すと小計が積み上がる", async ({ page }) => {
    await openItem(page, OPTION_ITEM);
    await expect(
      page.getByText(`Subtotal: ${yen(withTax(SEED_OPTION_MENU_PRICE))}`),
    ).toBeVisible();

    await page.locator('input[type="checkbox"]').first().check();
    const withCheckbox = withTax(
      SEED_OPTION_MENU_PRICE + SEED_CHECKBOX_OPTION_PRICE,
    );
    await expect(
      page.getByText(`Subtotal: ${yen(withCheckbox)}`),
    ).toBeVisible();

    await page.locator('input[type="radio"]').nth(1).check();
    const withBoth = withTax(
      SEED_OPTION_MENU_PRICE +
        SEED_CHECKBOX_OPTION_PRICE +
        SEED_RADIO_SECOND_PRICE,
    );
    await expect(page.getByText(`Subtotal: ${yen(withBoth)}`)).toBeVisible();
  });

  // 30. カート機能 / ケース1 Step4
  // 「カート内のカードの金額と『お会計』の金額が合致している」
  test("数量を増やすと小計が倍になる", async ({ page }) => {
    await openItem(page, PLAIN_ITEM);
    const one = withTax(SEED_MENU_PRICE);
    await expect(page.getByText(`Subtotal: ${yen(one)}`)).toBeVisible();

    await page.getByText("add", { exact: true }).first().click();
    await expect(page.getByText(`Subtotal: ${yen(one * 2)}`)).toBeVisible();
  });

  // 30. カート機能 / ケース1 Step5
  // 「メニュー画面を表示し、カート『お会計』を表示しない」
  test("数量を0に戻すとカートが消える", async ({ page }) => {
    await openItem(page, PLAIN_ITEM);
    await expect(page.getByText("Confirm Cart")).toBeVisible();

    await page.getByText("remove", { exact: true }).first().click();
    await expect(page.getByText("Confirm Cart")).toHaveCount(0);
  });

  // 30. カート機能 / ケース1 Step11、26. 商品の表示 / ケース5 Step7
  // 「商品を何も選択していない。『お会計』を表示しない」
  test("読み込み直すとかごが空になる", async ({ page }) => {
    await openItem(page, PLAIN_ITEM);
    await expect(page.getByText("Confirm Cart")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Confirm Cart")).toHaveCount(0);
  });
});
