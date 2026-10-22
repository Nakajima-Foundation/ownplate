import { expect, test } from "@playwright/test";

import { openOrderDetail, placeOrder, signInAsOwner } from "./helpers";
import { orderTimes, setPreviousOrderTime } from "./shopState";

// omochikaeri-docs #224 の C「注文一覧と注文詳細」。手順書（Vue3-full-test）は
// 注文回数と続けざまの注文の警告を項目に持っていない。
//
// 注文回数は店舗ごとに積み上がる文書（restaurants/:id/userLog/:uid）から来る。
// **一件目だけの状態はこの一式の中では作れない**（ほかの試験が先に注文する）ので、
// ほかの形は前の注文の時刻（userLog の lastUpdatedAt）を直に動かして作る。
//
// 警告は、この注文を**確定した時刻**（orderPlacedAt）か**作った時刻**（timeCreated）が、
// 前の注文の時刻から前後 4 時間以内なら出る。

const FLOW_TIMEOUT_MS = 300_000;
const MS_PER_HOUR = 60 * 60 * 1000;
const WARNING = "Warning: a continuous order";
const ORDER_COUNT = /Order: [1-9]\d* times/;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

test.describe("続けざまの注文の知らせ", () => {
  test("注文詳細に注文回数と警告が出る", async ({ page }) => {
    await placeOrder(page);
    const second = await placeOrder(page);

    await signInAsOwner(page);
    await openOrderDetail(page, second);

    // 注文回数は詳細を開いたあとに読みに行くので、初めは 0 が出ている。
    // **その瞬間を見ると「機能が死んでいる」と読み違える。** 値が来るまで待つ。
    await expect(page.getByText(ORDER_COUNT).first()).toBeVisible();
    await expect(page.getByText(WARNING).first()).toBeVisible();
  });

  test("前の注文から 4 時間以上空いていれば警告は出ない", async ({ page }) => {
    const number = await placeOrder(page);
    await setPreviousOrderTime(new Date("2020-01-01T00:00:00Z"));

    await signInAsOwner(page);
    await openOrderDetail(page, number);

    // 注文回数と警告は同じ userLog から出る。回数が来るまで待たないと、読む前の空の画面を見る。
    await expect(page.getByText(ORDER_COUNT).first()).toBeVisible();
    await expect(page.getByText(WARNING)).toHaveCount(0);
  });

  // 作った時刻では 4 時間を少し超えるが、確定した時刻（作ったあと）では 4 時間を切る。
  test("確定した時刻が前の注文から 4 時間以内なら警告が出る", async ({
    page,
  }) => {
    const number = await placeOrder(page);
    await signInAsOwner(page);
    await openOrderDetail(page, number);
    const orderId = new URL(page.url()).pathname.split("/").pop() ?? "";
    const { timeCreated, orderPlacedAt } = await orderTimes(orderId);
    expect(new Date(orderPlacedAt).getTime()).toBeGreaterThan(
      new Date(timeCreated).getTime() + 1,
    );
    await setPreviousOrderTime(
      new Date(new Date(timeCreated).getTime() + 4 * MS_PER_HOUR + 1),
    );

    await page.reload();
    await expect(page.getByText(ORDER_COUNT).first()).toBeVisible();
    await expect(page.getByText(WARNING).first()).toBeVisible();
  });
});
