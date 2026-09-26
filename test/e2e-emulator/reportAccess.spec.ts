import { expect, test } from "@playwright/test";

import { SEED_RESTAURANT_ID } from "../../scripts/seedData";
import { signInAsOwner, signInCustomer } from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「18. 管理画面 > 飲食店一覧 > 飲食店カード > 月次報告」ケース1（アクセス権限）。
//
// **通す側も見る。** 誰が開いても署名画面に飛ぶ作りでも、追い返す試験だけなら
// 通ってしまう。

const REPORT_PATH = `/admin/restaurants/${SEED_RESTAURANT_ID}/report`;
const SIGNIN_PATH = "/admin/user/signin";
const FLOW_TIMEOUT_MS = 180_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

test.describe("月次報告のアクセス権限", () => {
  // ケース1「未ログインユーザー → 飲食店向けログインページを表示する」
  test("署名していなければ店舗向けの署名画面へ送られる", async ({ page }) => {
    await page.goto(REPORT_PATH);

    await expect(page).toHaveURL(new RegExp(`^.*${SIGNIN_PATH}`));
    await expect(page.getByText("Sign In (for Restaurant)")).toBeVisible();
  });

  // ケース1「テイクアウトご注文のお客様 → 飲食店向けログインページを表示する」
  // 注文者は電話で署名しているが、店舗の管理画面には入れない。
  test("注文者として署名していても入れない", async ({ page }) => {
    await signInCustomer(page);
    await page.goto(REPORT_PATH);

    await expect(page).toHaveURL(new RegExp(`^.*${SIGNIN_PATH}`));
    await expect(page.getByText("Sign In (for Restaurant)")).toBeVisible();
  });

  test("店舗オーナーは開ける", async ({ page }) => {
    await signInAsOwner(page);
    await page.goto(REPORT_PATH);

    await expect(page).toHaveURL(REPORT_PATH);
    await expect(
      page.getByText("Download Excel File (Monthly Earnings)"),
    ).toBeVisible();
  });
});
