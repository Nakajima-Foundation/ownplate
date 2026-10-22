import { expect, test, type Page } from "@playwright/test";

import {
  SEED_CHECKBOX_OPTION_PRICE,
  SEED_FOOD_TAX_PERCENT,
  SEED_OPTION_MENU_NAME,
  SEED_OPTION_MENU_PRICE,
  SEED_RADIO_SECOND_PRICE,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";
import {
  expectOrderPlaced,
  signInCustomer,
  waitForOrderConfirmation,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「26. ユーザー系メニュー（注文画面）商品の表示」ケース5。
// かごの中の計算は cart.spec.ts で見ている。ここで見るのは**その先**——選んだ
// 選択肢が注文確認・確定後まで運ばれるか。注文を作るときに選択肢は形を変えて
// 保存されるので、かごで合っていても最後まで運ばれるとは限らない。

const FLOW_TIMEOUT_MS = 120_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;
const PERCENT = 100;
const OPTION_ITEM = 1;

const withTax = (price: number) =>
  Math.floor((price * (PERCENT + SEED_FOOD_TAX_PERCENT)) / PERCENT);

const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

const WITH_BOTH_OPTIONS =
  SEED_OPTION_MENU_PRICE + SEED_CHECKBOX_OPTION_PRICE + SEED_RADIO_SECOND_PRICE;

// 選択肢は品物をかごに入れてからでないと出てこない。
const addOptionItemWithBothOptions = async (page: Page) => {
  await page.goto(SHOP_PATH);
  await page.getByText("Add", { exact: true }).nth(OPTION_ITEM).click();
  await page.locator('input[type="checkbox"]').first().check();
  await page.locator('input[type="radio"]').nth(1).check();
  await expect(
    page.getByText(`Subtotal: ${yen(withTax(WITH_BOTH_OPTIONS))}`),
  ).toBeVisible();
};

const goToCheckout = async (page: Page) => {
  await page.getByText("Confirm Cart").click();
  await expect(page.getByText("Checkout")).toBeVisible();
  await page.getByText("Checkout").click();
};

test.describe("選択肢を選んだ注文", () => {
  // ケース5 Step1「選択したオプションを決済画面に表示する。
  // 決済画面で カート内と同じ金額を表示する」
  test("注文確認に選択肢と合計が出る", async ({ page }) => {
    await signInCustomer(page);
    await addOptionItemWithBothOptions(page);
    await goToCheckout(page);
    await waitForOrderConfirmation(page);

    await expect(page.getByText(SEED_OPTION_MENU_NAME).first()).toBeVisible();
    await expect(page.getByText(/大盛り/).first()).toBeVisible();
    await expect(page.getByText(/冷/).first()).toBeVisible();
    await expect(
      page.getByText(yen(withTax(WITH_BOTH_OPTIONS))).first(),
    ).toBeVisible();
  });

  // ケース5 Step2「決済画面の『戻る』→ Step1 で選択したオプションを選択している。
  // カート内と同じ金額を表示する」
  test("注文確認から戻ると選択肢が残っている", async ({ page }) => {
    await signInCustomer(page);
    await addOptionItemWithBothOptions(page);
    await goToCheckout(page);
    await waitForOrderConfirmation(page);

    await page.getByText("Back").first().click();
    await expect(page).toHaveURL(SHOP_PATH);

    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
    await expect(
      page.getByText(`Subtotal: ${yen(withTax(WITH_BOTH_OPTIONS))}`),
    ).toBeVisible();
  });

  // ケース5 Step1 の先。選択肢は保存のときに形を変える（Firestore は入れ子の
  // 配列を持てない）。かごと注文確認が合っていても、確定で落ちることがある。
  test("確定したあとも選択肢が残っている", async ({ page }) => {
    await signInCustomer(page);
    await addOptionItemWithBothOptions(page);
    await goToCheckout(page);
    await waitForOrderConfirmation(page);

    await page
      .getByRole("button", { name: /Place Order/i })
      .first()
      .click();
    await expectOrderPlaced(page);

    await expect(page.getByText(SEED_OPTION_MENU_NAME).first()).toBeVisible();
    await expect(page.getByText(/大盛り/).first()).toBeVisible();
    await expect(page.getByText(/冷/).first()).toBeVisible();
    await expect(
      page.getByText(yen(withTax(WITH_BOTH_OPTIONS))).first(),
    ).toBeVisible();
  });
});
