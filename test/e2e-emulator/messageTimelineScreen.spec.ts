import { expect, test } from "@playwright/test";

import { SEED_RESTAURANT_ID } from "../../scripts/seedData";
import { placeOrder, signInAsOwner } from "./helpers";

// 店舗向けメッセージ timeline の画面。**画面を通して読む**ので、ここは
// firestore.rules の入れ子の読み取り許可を実際に通る唯一の経路。
// REST を Bearer owner で叩く試験は規則を迂回してしまうため、これが要る。
//
// 導線はまだ出していないので、URL を直接開く。

const TIMELINE = `/admin/restaurants/${SEED_RESTAURANT_ID}/messages`;

test("注文のあとで、画面に行が出て注文へ飛べる", async ({ page }) => {
  await placeOrder(page);

  await signInAsOwner(page);
  await page.goto(TIMELINE);

  // 画面が出ていることを先に待つ。これを待たずに行を数えると、
  // 読み込み中の空を「0件」と読んでしまう。
  await expect(page.getByText("Notification history")).toBeVisible();

  const rows = page.locator(
    `a[href^="/admin/restaurants/${SEED_RESTAURANT_ID}/orders/"]`,
  );
  await expect(rows.first()).toBeVisible();
  await expect(page.getByText("No notifications yet.")).toHaveCount(0);
});
