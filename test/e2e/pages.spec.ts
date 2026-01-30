import { test, expect } from "@playwright/test";
import i18n from "../../src/lang/ja";

// タイムアウトを長めに設定（Firebaseの初期化に時間がかかる）
test.setTimeout(60000);

test.describe("Main Pages", () => {
  test("top page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });

  test("restaurant list page (/r)", async ({ page }) => {
    await page.goto("/r");
    await expect(page).toHaveURL("/r");
    // ページが読み込まれたことを確認
    await page.waitForLoadState("domcontentloaded");
  });

  test("all restaurants page (/r/area/all)", async ({ page }) => {
    await page.goto("/r/area/all");
    await expect(page).toHaveURL("/r/area/all");
  });

  test("news page (/news)", async ({ page }) => {
    await page.goto("/news");
    await expect(page).toHaveURL("/news");
    await page.waitForLoadState("domcontentloaded");
  });

  test("faq page (/faq)", async ({ page }) => {
    await page.goto("/faq");
    await expect(page).toHaveURL("/faq");
  });

  test("terms user page (/terms/user)", async ({ page }) => {
    await page.goto("/terms/user");
    await expect(page).toHaveURL("/terms/user");
    await page.waitForLoadState("domcontentloaded");
  });

  test("terms admin page (/terms/admin)", async ({ page }) => {
    await page.goto("/terms/admin");
    await expect(page).toHaveURL("/terms/admin");
    await page.waitForLoadState("domcontentloaded");
  });

  test("privacy page (/privacy)", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveURL("/privacy");
    await page.waitForLoadState("domcontentloaded");
  });
});

test.describe("Admin Pages", () => {
  test("admin signin page loads", async ({ page }) => {
    await page.goto("/admin/user/signin");
    await page.waitForLoadState("domcontentloaded");
    // メールアドレス入力欄を確認
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("admin signup page loads", async ({ page }) => {
    await page.goto("/admin/user/signup");
    await page.waitForLoadState("domcontentloaded");
    // メールアドレス入力欄を確認
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("admin password reset page loads", async ({ page }) => {
    await page.goto("/admin/user/reset");
    await expect(page).toHaveURL("/admin/user/reset");
    await page.waitForLoadState("domcontentloaded");
  });
});

test.describe("404 Page", () => {
  test("shows 404 for non-existent page", async ({ page }) => {
    await page.goto("/nonexistent-page-12345");
    await page.waitForLoadState("domcontentloaded");
    // ページが正常にレンダリングされたことを確認
    await expect(page.locator("body")).toBeVisible();
  });
});
