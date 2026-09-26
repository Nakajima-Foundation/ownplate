import { expect, test, type Page } from "@playwright/test";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「5. サイドナビゲーション（ハンバーガーメニュー）」ケース1。
// 署名していない人に出る口と、その行き先。
//
// **手順書は「マイページ」と書いているが、署名前の口は「Sign in」**（行き先は
// 同じ /u/profile）。手順書ではなく実物に合わせてある。

// ハンバーガーは material icon なので、字として "menu" が出ている。
const openSideMenu = async (page: Page) => {
  await page.getByText("menu", { exact: true }).first().click();
};

test.describe("署名していないときのサイドメニュー", () => {
  // Step1「ロゴ / マイページ / お店を探す / 飲食店の管理者様へ を表示する」
  test("署名の口とお店を探すが出る", async ({ page }) => {
    await page.goto("/r");
    await openSideMenu(page);

    await expect(page.getByText("Sign in").first()).toBeVisible();
    await expect(page.getByText("Find Restaurants").first()).toBeVisible();
  });

  // Step3「マイページをクリックする → マイページを表示する」
  test("マイページへ行ける", async ({ page }) => {
    await page.goto("/r");
    await openSideMenu(page);
    await page.getByText("Sign in").first().click();

    await expect(page).toHaveURL("/u/profile");
    await expect(page.getByText("Sign In as a User").first()).toBeVisible();
  });

  // Step4「お店を探すをクリックする → お店を探すを表示する」
  test("お店を探すへ行ける", async ({ page }) => {
    await page.goto("/u/profile");
    await openSideMenu(page);
    await page.getByText("Find Restaurants").first().click();

    await expect(page).toHaveURL("/r");
  });
});
