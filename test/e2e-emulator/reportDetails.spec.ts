import { expect, test, type Page } from "@playwright/test";

import { SEED_MENU_NAME, SEED_RESTAURANT_ID } from "../../scripts/seedData";
import {
  ADMIN_ORDERS_PATH,
  openOrderDetail,
  placeOrder,
  signInAsOwner,
} from "./helpers";

// omochikaeri-docs #224 の C「レポートの明細」——
// 「画面と CSV に行が出るか。**選択肢の無い商品の行も出ているか**
// （以前は壊れたデータで行ごと消えていた）」。手順書（Vue3-full-test）の
// 「18. 月次報告」は CSV の中身までしか書いていないので、ここで画面の明細を見る。
//
// **月次報告は timeConfirmed で引く。** その時刻が入るのは「受け渡し準備完了」に
// したとき（common/constant の ready_to_pickup）。注文しただけの品物は鍵を持たず、
// Firestore の並べ替えから落ちるので、そこまで進める。

const REPORT_PATH = `/admin/restaurants/${SEED_RESTAURANT_ID}/report`;
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

// 段階を押すと一覧へ戻される。戻りきるのを待ってから開き直す。
const advanceTo = async (page: Page, number: string, labels: string[]) => {
  for (const label of labels) {
    await openOrderDetail(page, number);
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${ADMIN_ORDERS_PATH}(\\?|$)`));
    await expect(page.getByText(label).first()).toBeVisible();
  }
};

test.describe("月次報告の明細", () => {
  test("選択肢の無い商品の行が出る", async ({ page }) => {
    // 種まきの一品目は選択肢を持たない。注文はそれを一つ入れる。
    const number = await placeOrder(page);

    await signInAsOwner(page);
    await advanceTo(page, number, ["Accepted", "Ready to Pickup"]);

    await page.goto(REPORT_PATH);
    const row = page.locator("tr").filter({ hasText: SEED_MENU_NAME });
    await expect(row.first()).toBeVisible();
  });
});
