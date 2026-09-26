import { expect, test } from "@playwright/test";

import { SEED_RESTAURANT_ID } from "../../scripts/seedData";
import { signInAsOwner } from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「7. 管理画面 > 飲食店一覧 > 飲食店カード > 店情報の変更」ケース2 Step1〜Step21
// （各欄の文字数の上限）。
//
// **上限の数は手順書ではなく実物に合わせてある。** 手順書は紹介文を 300 と書くが、
// 実装は 1200。ずれているので実装を正とする（2026-09-27 に確認）。
//
// 保存はしない。ここで触るのはほかの試験と同じ店舗なので、書き換えたまま
// 置いていくと隣の試験の前提が変わる。入力だけして離れる。

const EDIT_PATH = `/admin/restaurants/${SEED_RESTAURANT_ID}`;
const FLOW_TIMEOUT_MS = 180_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

// 欄は差し込み文言で掴む。上限は src/app/admin/Restaurants/Index.vue の maxlength。
const LIMITS: { placeholder: string; limit: number }[] = [
  { placeholder: "Enter restaurant name", limit: 50 },
  { placeholder: "Enter restaurant's owner name", limit: 50 },
  { placeholder: "Enter Zip", limit: 10 },
  { placeholder: "Enter City (e.g., Chiyoda-ku)", limit: 15 },
  { placeholder: "Enter street address (e.g., Marunouchi 1-9-1)", limit: 30 },
  { placeholder: "Enter shop introduction", limit: 1200 },
  { placeholder: "Enter order notifications", limit: 1200 },
  { placeholder: "Enter order thanks message", limit: 1200 },
  { placeholder: "Enter Website URL", limit: 100 },
  { placeholder: "Enter LINE Official Account URL", limit: 100 },
  { placeholder: "Enter Instagram URL", limit: 100 },
  { placeholder: "Enter UberEats URL", limit: 100 },
  { placeholder: "e.g. T1234567890123", limit: 14 },
];

const OVERFLOW = 5;

test.describe("店情報の欄の文字数", () => {
  test("どの欄も上限を超えて入らない", async ({ page }) => {
    await signInAsOwner(page);
    await page.goto(EDIT_PATH);
    await expect(page.getByPlaceholder("Enter restaurant name")).toBeVisible();

    for (const { placeholder, limit } of LIMITS) {
      const field = page.getByPlaceholder(placeholder);
      await field.fill("a".repeat(limit + OVERFLOW));
      // 切り捨てられた長さで見る。maxlength の属性を読むと、
      // **属性が消えても属性どうしの比較で通ってしまう。**
      await expect(field).toHaveValue("a".repeat(limit));
    }
  });
});
