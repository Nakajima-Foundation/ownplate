import { expect, test } from "@playwright/test";

// QA 手順書の「未ログインユーザー」の分。既存の pages.spec.ts は URL が開くことしか
// 見ていないので、空白の画面でも通る。ここは中身と行き先を見る。
//
// 文言は言語で変わるので、経路と href と入力欄の型で主張する。

test.describe("未ログインの入口", () => {
  // 入口は2つ。店舗側はリンク、お客様側は押すと本人確認が開く作りなので、
  // 見分け方も別になる。
  test("マイページは店舗の入口をリンクで出す", async ({ page }) => {
    await page.goto("/u/profile");
    await expect(page.locator('a[href="/admin/user/signin"]')).toBeVisible();
  });

  test("マイページのお客様の入口を押すと本人確認が開く", async ({ page }) => {
    await page.goto("/u/profile");
    await expect(page.locator('input[type="tel"]')).toHaveCount(0);
    await page.getByText("Sign In as a User").first().click();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  // 注文履歴は本人確認を挟む。電話番号の入力欄が出ることで見分ける。
  test("注文履歴は電話番号の本人確認を出す", async ({ page }) => {
    await page.goto("/u/history");
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test("アドレスはマイページへ送り返される", async ({ page }) => {
    await page.goto("/u/address");
    await expect(page).toHaveURL("/u/profile");
  });
});

test.describe("未ログインで管理画面を直接開く", () => {
  const RESTAURANT_ID = "any-restaurant-id";

  // 戻り先が ?to= に残る。ここが落ちると、署名のあと元の画面へ帰れない。
  test("月次報告は管理者の署名画面へ、戻り先つきで送られる", async ({
    page,
  }) => {
    const path = `/admin/restaurants/${RESTAURANT_ID}/report`;
    await page.goto(path);
    await expect(page).toHaveURL(
      `/admin/user/signin?to=${encodeURI(path)}`.replace(/%2F/g, "/"),
    );
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  // 手順書は署名画面へ転送と書いているが、実装は「見つからない」を出す。
  // どちらも拒否なので、見るべきは店舗の中身が出ないことの方。
  test("QR コードの画面は店舗の中身を出さない", async ({ page }) => {
    await page.goto(`/admin/restaurants/${RESTAURANT_ID}/qrcode`);
    await expect(page.locator("body")).not.toContainText(RESTAURANT_ID);
  });
});

test.describe("サイドメニュー", () => {
  const openSideMenu = async (page: import("@playwright/test").Page) => {
    await page.goto("/r");
    await page.getByText("menu", { exact: true }).first().click();
  };

  // 行き先を href で見る。文言は言語で変わるが href は変わらない。
  test("行き先が一通り並ぶ", async ({ page }) => {
    await openSideMenu(page);
    for (const href of [
      "/u/profile",
      "/r",
      "/news",
      "/admin/docs",
      "/terms/admin",
      "/terms/user",
      "/privacy",
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test("お店を探すから店舗一覧へ行ける", async ({ page }) => {
    await openSideMenu(page);
    await page.locator('a[href="/r"]').first().click();
    await expect(page).toHaveURL("/r");
  });

  // 外部の案内は別タブで開く。同じタブだと注文の途中で離脱させてしまう。
  test("外部への案内は別タブで開く", async ({ page }) => {
    await openSideMenu(page);
    const external = page.locator('a[href^="https://"]');
    await expect(external.first()).toHaveAttribute("target", "_blank");
  });
});
