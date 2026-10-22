import { expect, test, type Page } from "@playwright/test";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「2. 新規ユーザー登録」ケース2 Step2-11。入力の検証だけを見るので、
// アカウントは作らず Firestore にも触らない。だからほかの試験と並べて回せる。
//
// **検証は入力欄を離れたときではなく「Next」を押したときに出る。**

const SIGN_UP_PATH = "/admin/user/signup";
const VALID_EMAIL = "someone@example.com";
const VALID_PASSWORD = "abcd1234";

const TOO_SHORT = "Password should be at least 8 characters";
const NEEDS_BOTH = "Please enter alphabets and numbers for the password.";
const MISMATCH = "Password mismatch";

const submitSignUp = async (page: Page, password: string, confirm: string) => {
  await page.goto(SIGN_UP_PATH);
  const passwords = page.locator('input[type="password"]');
  await page.locator('input[type="email"]').fill(VALID_EMAIL);
  await passwords.first().fill(password);
  await passwords.nth(1).fill(confirm);
  await page.getByRole("button", { name: "Next" }).click();
};

test.describe("新規ユーザー登録の入力検証", () => {
  // Step8「パスワードは8文字以上にしてください」
  test("合言葉は8文字以上", async ({ page }) => {
    await submitSignUp(page, "ab12", "ab12");
    await expect(page.getByText(TOO_SHORT)).toBeVisible();
  });

  // Step6「パスワードはアルファベットと数字を含めてください」
  test("合言葉は英字と数字の両方が要る", async ({ page }) => {
    await submitSignUp(page, "abcdefgh", "abcdefgh");
    await expect(page.getByText(NEEDS_BOTH)).toBeVisible();
  });

  // 数字だけも同じく弾く。片側だけ見ていないことの確かめ。
  test("数字だけの合言葉も弾く", async ({ page }) => {
    await submitSignUp(page, "12345678", "12345678");
    await expect(page.getByText(NEEDS_BOTH)).toBeVisible();
  });

  // Step9「パスワードが違います」
  test("再入力が違うと知らせる", async ({ page }) => {
    await submitSignUp(page, VALID_PASSWORD, "abcd9999");
    await expect(page.getByText(MISMATCH)).toBeVisible();
  });

  // 整っているときに知らせないこと。上の4件が常に出ているわけではない証拠。
  test("整った合言葉なら合言葉の指摘は出ない", async ({ page }) => {
    await submitSignUp(page, VALID_PASSWORD, VALID_PASSWORD);
    await expect(page.getByText(TOO_SHORT)).toHaveCount(0);
    await expect(page.getByText(NEEDS_BOTH)).toHaveCount(0);
    await expect(page.getByText(MISMATCH)).toHaveCount(0);
  });
});

test.describe("新規ユーザー登録からの案内", () => {
  // Step2 / Step3 利用規約とプライバシーポリシー
  test("利用規約とプライバシーポリシーへ行ける", async ({ page }) => {
    await page.goto(SIGN_UP_PATH);
    await expect(page.locator('a[href="/terms/admin"]').first()).toBeVisible();
    await expect(page.locator('a[href="/privacy"]').first()).toBeVisible();
  });
});
