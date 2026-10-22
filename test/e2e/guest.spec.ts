import { expect, test } from "@playwright/test";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 未ログインの分。各試験に、どの大項目のどのケース・Step から起こしたかを書いてある。
// 行番号は書かない（表を編集するとずれる）。Step 番号を持たない行は手順の文言で示す。
//
// 既存の pages.spec.ts は URL が開くことしか見ていないので空白の画面でも通る。
// ここは中身と行き先を見る。文言は言語で変わるので、経路と href と入力欄の型で主張する。

test.describe("未ログインの入口", () => {
  // 4. マイページ / ケース1「マイページURL にアクセスする」
  // → 「ログイン状況なしのマイページを表示する」
  // 入口は2つ。店舗側はリンク、お客様側は押すと本人確認が開く作りなので、
  // 見分け方も別になる。
  test("マイページは店舗の入口をリンクで出す", async ({ page }) => {
    await page.goto("/u/profile");
    await expect(page.locator('a[href="/admin/user/signin"]')).toBeVisible();
  });

  // 4. マイページ / ケース1、5. サイドナビゲーション / ケース1 Step3
  test("マイページのお客様の入口を押すと本人確認が開く", async ({ page }) => {
    await page.goto("/u/profile");
    await expect(page.locator('input[type="tel"]')).toHaveCount(0);
    await page.getByText("Sign In as a User").first().click();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  // 4. マイページ / ケース1「注文履歴URL にアクセスする」
  // → 「本人確認（携帯電話番号）ダイアログを表示する」
  test("注文履歴は電話番号の本人確認を出す", async ({ page }) => {
    await page.goto("/u/history");
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  // 4. マイページ / ケース1「アドレスURL にアクセスする」
  // → 「ログイン状況なしのマイページを表示する」
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

  // 14. QRコード / ケース1「/qrcode にアクセスする」
  // 手順書は「飲食店向けログインページを表示する」だが、実装は「見つからない」を
  // 出す。どちらも拒否なので、見るべきは店舗の中身が出ないことの方。
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

  // 5. サイドナビゲーション / ケース1 Step2-6
  // 行き先を href で見る。文言は言語で変わるが href は変わらない。
  // 手順書は各マニュアルが個別に並ぶと書いているが、実装は /admin/docs 一本。
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

  // 5. サイドナビゲーション / ケース1 Step4「お店を探すをクリックする」
  test("お店を探すから店舗一覧へ行ける", async ({ page }) => {
    await openSideMenu(page);
    await page.locator('a[href="/r"]').first().click();
    await expect(page).toHaveURL("/r");
  });

  // 5. サイドナビゲーション / ケース1 Step5「各マニュアルをクリックする」
  // → 「各マニュアルを別タブで表示する」
  test("外部への案内は別タブで開く", async ({ page }) => {
    await openSideMenu(page);
    const external = page.locator('a[href^="https://"]');
    await expect(external.first()).toHaveAttribute("target", "_blank");
  });
});
