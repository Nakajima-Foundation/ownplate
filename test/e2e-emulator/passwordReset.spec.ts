import { expect, test } from "@playwright/test";

import {
  createOwnerAccount,
  latestResetCode,
  markEmailVerified,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「3. パスワードを忘れた場合」。メールは飛ばないが、エミュレーターは再設定の
// 合言葉（oobCode）を API で返すので、受信箱なしで最後まで通せる。
//
// **種まきのオーナーは使わない。** 合言葉を変えると、同じオーナーで署名する
// ほかの試験が並びの順によって落ちる。この綴りだけの口座を作る。

const RESET_PATH = "/admin/user/reset";
const ACTION_PATH = "/admin/user/action?mode=resetPassword&oobCode=";
const OLD_PASSWORD = "e2ereset1234";
const NEW_PASSWORD = "e2ereset5678";
// 8文字未満。**英字と数字の両方を入れておく。** 片方だけだと「英数字を入れて
// ください」が先に上書きして、長さの知らせが出ない。
const TOO_SHORT_PASSWORD = "abc1234";
const SENT_MESSAGE = "Please check your inbox, an email is on the way.";

const uniqueEmail = () =>
  `e2e-reset-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

const submitResetRequest = async (
  page: import("@playwright/test").Page,
  email: string,
) => {
  await page.goto(RESET_PATH);
  await page.locator("input").first().fill(email);
  await page.getByRole("button", { name: "Next" }).click();
};

test.describe("パスワードを忘れた場合", () => {
  // ケース1 Step1「『パスワードを忘れた場合』をクリック → リセット画面を表示する」
  test("署名画面から再設定の画面へ入れる", async ({ page }) => {
    await page.goto("/admin/user/signin");
    await page.getByText(/Forgot Password/).click();

    await expect(page).toHaveURL(RESET_PATH);
    await expect(page.getByText("Reset Password").first()).toBeVisible();
  });

  // ケース1 Step2「メールアドレスではない形式 → 無効なメールアドレス」
  test("宛先の形が違うと知らせる", async ({ page }) => {
    await submitResetRequest(page, "not-an-email");

    await expect(page.getByText("Invalid Email Address")).toBeVisible();
    await expect(page.getByText(SENT_MESSAGE)).toHaveCount(0);
  });

  // ケース1 Step2「登録済みのメールアドレス → メールを送信しました」
  test("登録済みの宛先なら送ったと知らせる", async ({ page }) => {
    const email = uniqueEmail();
    await createOwnerAccount(email, OLD_PASSWORD);

    await submitResetRequest(page, email);

    await expect(page.getByText(SENT_MESSAGE)).toBeVisible();
  });

  // ケース1 Step3「有効期限が切れている場合：『パスワード再設定へ』を表示する」
  // 期限切れも、でたらめな合言葉も、確認に失敗するという意味では同じ道を通る。
  test("合言葉が通らなければ再送への導線を出す", async ({ page }) => {
    await page.goto(`${ACTION_PATH}not-a-real-code`);

    await expect(page.getByText("Email is expired")).toBeVisible();
    await page.getByText("Reset passwpord").click();
    await expect(page).toHaveURL(RESET_PATH);
  });

  // ケース1 Step2〜Step6 の通し。
  test("再設定した合言葉で署名できる", async ({ page }) => {
    const email = uniqueEmail();
    const uid = await createOwnerAccount(email, OLD_PASSWORD);

    await submitResetRequest(page, email);
    await expect(page.getByText(SENT_MESSAGE)).toBeVisible();

    const code = await latestResetCode(email);
    await page.goto(`${ACTION_PATH}${code}`);

    const password = page.locator('input[type="password"]');
    await expect(password.first()).toBeVisible();

    // Step4「8文字未満 → パスワードは8文字以上にしてください」
    await password.first().fill(TOO_SHORT_PASSWORD);
    await password.nth(1).fill(TOO_SHORT_PASSWORD);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(
      page.getByText("Password should be at least 8 characters"),
    ).toBeVisible();

    // Step4「再入力が違う → パスワードが違います」
    await password.first().fill(NEW_PASSWORD);
    await password.nth(1).fill(`${NEW_PASSWORD}9`);
    await expect(page.getByText("Password mismatch")).toBeVisible();

    await password.nth(1).fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Password was updated")).toBeVisible();

    // Step5「『ログインへ』をクリック → ログイン画面を表示する」
    await page.getByText("Go Sign In").click();
    await expect(page).toHaveURL("/admin/user/signin");

    // Step6「登録済みメールアドレスと新しいパスワードで署名 → 管理画面」
    // 画面から作った口座はメール確認が済んでいないので、ここだけ先に立てる。
    await markEmailVerified(uid);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(NEW_PASSWORD);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page).toHaveURL("/admin/restaurants");

    // 使い終わった合言葉は二度目は通らない。届いた綴りを読み返して開き直す筋。
    await page.goto(`${ACTION_PATH}${code}`);
    await expect(page.getByText("Email is expired")).toBeVisible();
  });
});
