import { expect, test, type Page } from "@playwright/test";

import {
  SEED_DELIVERY_FEE,
  SEED_DELIVERY_MENU_NAME,
  SEED_DELIVERY_RESTAURANT_ID,
  SEED_DELIVERY_THRESHOLD,
  SEED_DELIVERY_UNDER_MENU_NAME,
} from "../../scripts/seedData";
import { signInCustomer } from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - 配送条件のテスト」
// ケース1（配達受付可能合計金額 1000 / 配達料金 500 / 配達料金無料 2000）の判定表。
//
// | 注文金額 | 期待 |
// | 2000 | 配達無料 |
// | 1000 | 配達料金 500 |
// |  999 | 注文できない |
//
// 店舗は配達専用の種まき（税 0）。**税が乗ると境目がずれる**ので、金額をそのまま
// 判定表と突き合わせられるようにしてある。

const SHOP_PATH = `/r/${SEED_DELIVERY_RESTAURANT_ID}`;
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

const yen = (amount: number) => `¥${amount.toLocaleString("en-US")}`;

// helpers の待ちは種まきの持ち帰り店舗を見るので、ここでは使えない。
const ORDER_WAIT_MS = 90_000;
const waitForConfirmation = async (page: Page) => {
  await expect(page).toHaveURL(
    new RegExp(`/r/${SEED_DELIVERY_RESTAURANT_ID}/order/`),
    { timeout: ORDER_WAIT_MS },
  );
  await expect(
    page.getByRole("button", { name: /Place Order/i }).first(),
  ).toBeVisible();
};

// 受け取り方法を配達に切り替えてから品物を入れる。
const chooseDelivery = async (page: Page) => {
  await page.goto(SHOP_PATH);
  await page.getByText("Delivery", { exact: true }).first().click();
};

const addItem = async (page: Page, itemName: string, times: number) => {
  const card = page
    .locator("div.rounded-lg.bg-white.shadow-sm")
    .filter({ hasText: itemName })
    .last();
  await card.getByText("Add", { exact: true }).click();
  for (let added = 1; added < times; added += 1) {
    await card.getByText("add", { exact: true }).click();
  }
};

test.describe("配送条件", () => {
  // 判定表 3「999円注文 → 注文できない」
  test("受付の下限に届かないと注文へ進めない", async ({ page }) => {
    await chooseDelivery(page);
    await addItem(page, SEED_DELIVERY_UNDER_MENU_NAME, 1);

    // かごの口は消えるのではなく**死ぬ**。文言だけ見ると、押せるままでも通る。
    const cartButton = page
      .locator("button")
      .filter({ hasText: /Can be delivered for/ });
    await expect(cartButton).toBeVisible();
    await expect(cartButton).toBeDisabled();
    await expect(
      page.getByText(
        `Can be delivered for ${yen(SEED_DELIVERY_THRESHOLD)} JPY or more`,
      ),
    ).toBeVisible();
  });

  // 判定表 2「1000円注文 → 配達料金500円」
  test("下限を満たすと配達料金がかかる", async ({ page }) => {
    await signInCustomer(page);
    await chooseDelivery(page);
    await addItem(page, SEED_DELIVERY_MENU_NAME, 1);

    await page.getByText("Confirm Cart").click();
    await page.getByText("Checkout").click();
    await waitForConfirmation(page);

    await expect(page.getByText("Delivery Fee").first()).toBeVisible();
    await expect(page.getByText(yen(SEED_DELIVERY_FEE)).first()).toBeVisible();
  });

  // 判定表 1「2000円注文 → 配達無料」
  test("無料の境目を越えると配達料金がかからない", async ({ page }) => {
    await signInCustomer(page);
    await chooseDelivery(page);
    await addItem(page, SEED_DELIVERY_MENU_NAME, 2);

    await page.getByText("Confirm Cart").click();
    await page.getByText("Checkout").click();
    await waitForConfirmation(page);

    await expect(page.getByText(yen(SEED_DELIVERY_FEE))).toHaveCount(0);
  });
});
