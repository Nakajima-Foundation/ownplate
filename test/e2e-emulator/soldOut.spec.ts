import { expect, test } from "@playwright/test";

import {
  SEED_MENU_NAME,
  SEED_OPTION_MENU_NAME,
  SEED_RESTAURANT_ID,
} from "../../scripts/seedData";
import { setSoldOut } from "./shopState";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「9. 管理画面 > … > メニュー」ケース1 Step14
// 「『売り切れ』をクリックする → お客様の注文画面で売り切れ商品は非活性で表示する」。
//
// 売り切れは店舗の設定なので、ほかの試験と同じ品物を触る。**必ず戻す。**

const SHOP_PATH = `/r/${SEED_RESTAURANT_ID}`;

test.describe.configure({ mode: "serial" });

test.afterEach(async () => {
  await setSoldOut(false);
});

test.describe("売り切れの表示", () => {
  test("売り切れにするとかごに入れられなくなる", async ({ page }) => {
    await setSoldOut(false);
    await page.goto(SHOP_PATH);
    await expect(page.getByText("Sold Out")).toHaveCount(0);

    await setSoldOut(true);
    await page.reload();

    await expect(page.getByText(SEED_MENU_NAME).first()).toBeVisible();
    await expect(page.getByText("Sold Out").first()).toBeVisible();
    // 売り切れでない品物はそのまま入れられる。
    await expect(page.getByText(SEED_OPTION_MENU_NAME).first()).toBeVisible();
    await expect(page.getByText("Add", { exact: true })).toHaveCount(1);
  });

  test("売り切れを戻すとまた入れられる", async ({ page }) => {
    await setSoldOut(true);
    await page.goto(SHOP_PATH);
    await expect(page.getByText("Sold Out").first()).toBeVisible();

    await setSoldOut(false);
    await page.reload();

    await expect(page.getByText("Sold Out")).toHaveCount(0);
    await expect(page.getByText("Add", { exact: true })).toHaveCount(2);
  });
});
