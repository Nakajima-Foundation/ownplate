import { expect, test } from "@playwright/test";

import {
  SEED_RESTAURANT_ID,
  SEED_SUB_UNASSIGNED_EMAIL,
  SEED_SUB_UNASSIGNED_PASSWORD,
} from "../../scripts/seedData";
import { placeOrder, signInAsOwner, submitOwnerSignIn } from "./helpers";

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

test("読めないときに「まだありません」と出さない", async ({ page }) => {
  await placeOrder(page);

  // 同じ親の下にいるが、この店舗は担当していない。画面には入れる
  // （checkShopAccount は親の uid で見るため）が、Firestore には拒まれる。
  await submitOwnerSignIn(
    page,
    SEED_SUB_UNASSIGNED_PASSWORD,
    SEED_SUB_UNASSIGNED_EMAIL,
  );
  await page.goto(TIMELINE);

  await expect(page.getByText("Notification history")).toBeVisible();
  await expect(
    page.getByText("Could not load notifications. Please check your"),
  ).toBeVisible();
  // ここが肝。空に見えてはいけない。
  await expect(page.getByText("No notifications yet.")).toHaveCount(0);
});
