import { expect, test, type Page } from "@playwright/test";

import { order_status } from "../../src/config/constant";
import {
  ADMIN_HISTORY_PATH,
  ADMIN_ORDERS_PATH,
  openOrderDetail,
  placeOrder,
  signInAsOwner,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「8. 管理画面 > 飲食店一覧 > 飲食店カード > 注文を確認」ケース1 Step17〜Step21。
// 全件の注文履歴で、注文状況の絞り込みと並び替えが効くか。
//
// 注文はこの一式の中で積み上がる。**件数でも「何番目か」でも見ない** —
// この試験が出した注文番号が、絞り込みのどちら側に出るかだけで見る。

const FLOW_TIMEOUT_MS = 300_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

// 注文状況の select は order_status の数値をそのまま値にしている。数字を書き写すと
// 実物が変わった日に静かに外れるので、実物から取る。「全て」は error と同じ 0。
const STATUS_ALL = String(order_status.error);
const STATUS_ORDER_PLACED = String(order_status.order_placed);
const STATUS_TRANSACTION_COMPLETE = String(order_status.transaction_complete);
// 並び替えの select。0 が新しい順、1 が古い順。
const SORT_NEWEST = "0";
const SORT_OLDEST = "1";

const statusSelect = (page: Page) => page.locator("select").first();
const sortSelect = (page: Page) => page.locator("select").nth(1);

// 段階を押すと注文一覧へ戻される。**戻りきるのを待ってから開き直す** —
// 待たずに開くと、まだ前の状態の画面を掴んで次の段の口が死んだままになる。
const completeOrder = async (page: Page, number: string) => {
  for (const label of ["Accepted", "Ready to Pickup", "Pickup Complete"]) {
    await openOrderDetail(page, number);
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${ADMIN_ORDERS_PATH}(\\?|$)`));
    await expect(page.getByText(label).first()).toBeVisible();
  }
};

const shownNumbers = (page: Page) => page.getByText(/^#\d+$/);

test.describe("全件の注文履歴", () => {
  test("注文状況で絞り込める", async ({ page }) => {
    const number = await placeOrder(page);
    await signInAsOwner(page);

    await page.goto(ADMIN_HISTORY_PATH);
    // Step18「注文済み」→ 注文済みの注文のみ表示する。
    await statusSelect(page).selectOption(STATUS_ORDER_PLACED);
    await expect(page.getByText(`#${number}`).first()).toBeVisible();

    // Step21「受け渡し完了」→ この注文は注文済みには出なくなる。
    await completeOrder(page, number);
    await page.goto(ADMIN_HISTORY_PATH);
    await statusSelect(page).selectOption(STATUS_ORDER_PLACED);
    await expect(page.getByText(`#${number}`)).toHaveCount(0);

    await statusSelect(page).selectOption(STATUS_TRANSACTION_COMPLETE);
    await expect(page.getByText(`#${number}`).first()).toBeVisible();

    // 「全て」に戻せばまた出る。
    await statusSelect(page).selectOption(STATUS_ALL);
    await expect(page.getByText(`#${number}`).first()).toBeVisible();
  });

  // Step17「注文が古い順」→ 並びが入れ替わる。
  // どの注文が何番目かは、ほかの試験が出した分で変わる。**並び全体が逆さになる**
  // ことだけを見る。
  test("並び替えで新しい順と古い順が入れ替わる", async ({ page }) => {
    await placeOrder(page);
    await signInAsOwner(page);
    await page.goto(ADMIN_HISTORY_PATH);

    await sortSelect(page).selectOption(SORT_NEWEST);
    await expect(shownNumbers(page).first()).toBeVisible();
    const newestFirst = await shownNumbers(page).allTextContents();
    expect(newestFirst.length).toBeGreaterThan(1);

    await sortSelect(page).selectOption(SORT_OLDEST);
    const oldestFirst = await shownNumbers(page).allTextContents();
    expect(oldestFirst).toEqual([...newestFirst].reverse());
  });
});
