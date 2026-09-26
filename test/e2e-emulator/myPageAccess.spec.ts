import { expect, test } from "@playwright/test";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「4. マイページ」ケース1
// 「未ログイン状態でマイページの各ページにアクセスできないか確認する」。
//
// 署名の要る画面を素通りできないこと。**追い返し方は画面ごとに違う** —
// 注文履歴は本人確認のダイアログ、お気に入りとアドレスはマイページへ送り返す。

const PROFILE_PATH = "/u/profile";

test.describe("署名していないときのマイページ", () => {
  test("マイページは署名前の姿で出る", async ({ page }) => {
    await page.goto(PROFILE_PATH);

    await expect(page.getByText("Sign-in Status").first()).toBeVisible();
    await expect(page.getByText("Sign In as a User").first()).toBeVisible();
    await expect(page.getByText("Sign Out")).toHaveCount(0);
  });

  test("注文履歴は本人確認を求める", async ({ page }) => {
    await page.goto("/u/history");

    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test("お気に入りはマイページへ送り返される", async ({ page }) => {
    await page.goto("/r/favorites");

    await expect(page).toHaveURL(PROFILE_PATH);
    await expect(page.getByText("Sign In as a User").first()).toBeVisible();
  });

  test("アドレスはマイページへ送り返される", async ({ page }) => {
    await page.goto("/u/address");

    await expect(page).toHaveURL(PROFILE_PATH);
    await expect(page.getByText("Sign In as a User").first()).toBeVisible();
  });
});
