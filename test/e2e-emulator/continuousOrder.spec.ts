import { expect, test } from "@playwright/test";

import { openOrderDetail, placeOrder, signInAsOwner } from "./helpers";

// omochikaeri-docs #224 の C「注文一覧と注文詳細」。手順書（Vue3-full-test）は
// 注文回数と続けざまの注文の警告を項目に持っていない。
//
// 注文回数は店舗ごとに積み上がる文書（restaurants/:id/userLog/:uid）から来る。
// **一件目だけの状態はこの一式の中では作れない**（ほかの試験が先に注文する）ので、
// 「出ない側」は見ない。続けて注文したときに出る側だけを見る。

const FLOW_TIMEOUT_MS = 300_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

test.describe("続けざまの注文の知らせ", () => {
  test("注文詳細に注文回数と警告が出る", async ({ page }) => {
    await placeOrder(page);
    const second = await placeOrder(page);

    await signInAsOwner(page);
    await openOrderDetail(page, second);

    // 注文回数は詳細を開いたあとに読みに行くので、初めは 0 が出ている。
    // **その瞬間を見ると「機能が死んでいる」と読み違える。** 値が来るまで待つ。
    await expect(page.getByText(/Order: [1-9]\d* times/).first()).toBeVisible();
    await expect(
      page.getByText("Warning: a continuous order").first(),
    ).toBeVisible();
  });
});
