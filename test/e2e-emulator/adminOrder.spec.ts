import { expect, test } from "@playwright/test";

import { SEED_MENU_NAME } from "../../scripts/seedData";
import {
  ADMIN_HISTORY_PATH,
  CUSTOMER_NAME,
  ADMIN_ORDERS_PATH,
  openOrderDetail,
  placeOrder,
  signInAsOwner,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「8. 管理画面 > 飲食店一覧 > 飲食店カード > 注文を確認」。お客様が出した注文を
// 店舗が受け付けて完了させるところまで。
//
// 注文はこの一式の中で積み上がるので、件数ではなく**その注文番号**で見る。
// 既定の注文一覧は受取日で絞るため、探すのは全件の画面から。

const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

test.describe("店舗が注文を処理する", () => {
  // 8. ケース1 Step11 注文カードをクリックする → 注文履歴詳細画面を開く
  test("注文カードから詳細を開ける", async ({ page }) => {
    const number = await placeOrder(page);

    await signInAsOwner(page);
    await openOrderDetail(page, number);

    await expect(page.getByText(CUSTOMER_NAME).first()).toBeVisible();
    await expect(page.getByText(SEED_MENU_NAME).first()).toBeVisible();
  });

  // 注文状況は Order Placed → Accepted → Ready to Pickup → Pickup Complete と進む。
  // **段階を押すと注文一覧へ戻される**ので、進めるたびに詳細を開き直す。
  test("受付から受け渡し完了まで進められる", async ({ page }) => {
    const number = await placeOrder(page);
    await signInAsOwner(page);

    for (const label of ["Accepted", "Ready to Pickup", "Pickup Complete"]) {
      await openOrderDetail(page, number);
      await page.getByRole("button", { name: label, exact: true }).click();
      // 一覧へ戻り、カードがその状態になっていること。
      // 一覧へ戻るときに ?day= が付く。経路だけを見る。
      await expect(page).toHaveURL(new RegExp(`${ADMIN_ORDERS_PATH}(\\?|$)`));
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  // 8. ケース1 Step12「戻る」で注文履歴に戻る
  test("詳細から注文履歴へ戻れる", async ({ page }) => {
    const number = await placeOrder(page);

    await signInAsOwner(page);
    await openOrderDetail(page, number);

    await page.goBack();
    await expect(page).toHaveURL(ADMIN_HISTORY_PATH);
    await expect(page.getByText(`#${number}`).first()).toBeVisible();
  });
});

test.describe("店舗の注文履歴", () => {
  // 8. ケース1 Step1「0件の未完了」→ 注文すると増える
  test("注文すると未完了の件数に数えられる", async ({ page }) => {
    const number = await placeOrder(page);

    await signInAsOwner(page);
    await expect(page.getByText(/Incomplete/).first()).toBeVisible();
    await expect(page.getByText("0 Incomplete")).toHaveCount(0);

    await page.goto(ADMIN_HISTORY_PATH);
    await expect(page.getByText(`#${number}`).first()).toBeVisible();
  });
});
