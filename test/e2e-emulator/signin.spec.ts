import { expect, test, type Page } from "@playwright/test";

import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
} from "../../src/config/emulatorPorts";
import {
  SEED_OWNER_EMAIL,
  SEED_OWNER_PASSWORD,
  SEED_RESTAURANT_ID,
  SEED_RESTAURANT_NAME,
} from "../../scripts/seedData";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」。
// 各試験に、どの大項目のどのケース・Step から起こしたかを書いてある。行番号は
// 書かない（表を編集するとずれる）。
//
// 注文も管理も、まず署名を通さないと先へ進めない。エミュレーターは SMS を送らず
// 確認コードを API で返すので、本物の電話なしで通せる。

const PHONE_NUMBER = "09012345678";
const VERIFICATION_CODES_URL = `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}/emulator/v1/projects/ownplate-dev/verificationCodes`;

const CODE_WAIT_MS = 15_000;
const CODE_POLL_MS = 250;

// エミュレーターが確認コードを受け付けるまでには間がある。固定で待つと遅い機械で
// 落ちるので、増えるまで見に行く。前回までの件数を渡して、増えた分の最後を取る。
const waitForNewVerificationCode = async (seen: number): Promise<string> => {
  const deadline = Date.now() + CODE_WAIT_MS;
  for (;;) {
    const response = await fetch(VERIFICATION_CODES_URL);
    const { verificationCodes } = (await response.json()) as {
      verificationCodes: { code: string }[];
    };
    if (verificationCodes.length > seen) {
      return verificationCodes[verificationCodes.length - 1].code;
    }
    if (Date.now() > deadline) {
      throw new Error("エミュレーターに確認コードが増えませんでした");
    }
    await new Promise((resolve) => setTimeout(resolve, CODE_POLL_MS));
  }
};

const verificationCodeCount = async (): Promise<number> => {
  const response = await fetch(VERIFICATION_CODES_URL);
  const { verificationCodes } = (await response.json()) as {
    verificationCodes: { code: string }[];
  };
  return verificationCodes.length;
};

const signInByPhone = async (page: Page) => {
  const before = await verificationCodeCount();
  await page.locator('input[type="tel"]').fill(PHONE_NUMBER);
  await page.getByRole("button", { name: "Send SMS" }).click();
  await page
    .getByPlaceholder("Please type the code you've received")
    .fill(await waitForNewVerificationCode(before));
  await page.locator('input[placeholder="John Smith"]').fill("試験 太郎");
  await page.getByRole("button", { name: "Send", exact: true }).click();
};

test.describe("お客様の署名", () => {
  // 1. ログイン / ケース1、4. マイページ / ケース3 Step3
  // 「ログイン状況に電話番号、注文履歴、お気に入り、ログアウトを表示する」
  test("電話番号で署名するとマイページがログイン後の内容になる", async ({
    page,
  }) => {
    await page.goto("/u/profile");
    await page.getByText("Sign In as a User").first().click();
    await signInByPhone(page);

    await expect(page.getByText("Sign Out")).toBeVisible();
    await expect(page.getByText("Order History")).toBeVisible();
  });

  // 30. カート機能 / ケース1 Step3 の先。署名していないと注文へ進めない。
  test("署名していないとお会計で本人確認を求められる", async ({ page }) => {
    await page.goto(`/r/${SEED_RESTAURANT_ID}`);
    await page.getByText("Add", { exact: true }).first().click();
    await page.getByText("Confirm Cart").click();
    await page.getByText("Checkout").click();

    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });
});

test.describe("店舗オーナーの署名", () => {
  const signInAsOwner = async (page: Page, password: string) => {
    await page.goto("/admin/user/signin");
    await page.locator('input[type="email"]').fill(SEED_OWNER_EMAIL);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: "Next" }).click();
  };

  // 1. ログイン / ケース3「管理者画面へログインできること」
  // 6. 管理画面TOP。店舗の uid と署名した uid が一致する店だけが並ぶ。
  test("メールで署名すると自分の店舗が一覧に出る", async ({ page }) => {
    await signInAsOwner(page, SEED_OWNER_PASSWORD);

    await expect(page).toHaveURL("/admin/restaurants");
    await expect(page.getByText(SEED_RESTAURANT_NAME).first()).toBeVisible();
  });

  test("合言葉が違うと管理画面へ入れない", async ({ page }) => {
    await signInAsOwner(page, "wrong-password-9999");

    await expect(page).not.toHaveURL("/admin/restaurants");
    await expect(page.getByText(SEED_RESTAURANT_NAME)).toHaveCount(0);
  });
});
