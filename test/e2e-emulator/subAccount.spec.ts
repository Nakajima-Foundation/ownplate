import { expect, test, type Page } from "@playwright/test";

import { SEED_OWNER_EMAIL } from "../../scripts/seedData";
import {
  createOwnerAccount,
  markEmailVerified,
  signInAsOwner,
} from "./helpers";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「21. 管理画面 > サブアカウント管理」ケース1・ケース2。
//
// 招待はメールを送らない。Firestore と Auth だけで完結するので、受信箱なしで
// 受理まで通せる（functions/src/functions/subAccount.ts）。
//
// **招待した相手は親の下に残る。** 試験ごとに別の宛先を作って、隣の試験と
// 混ざらないようにする。

const SUBACCOUNTS_PATH = "/admin/subaccounts";
const ADMIN_TOP = "/admin/restaurants";
const CHILD_PASSWORD = "e2echild1234";
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

const uniqueEmail = () =>
  `e2e-child-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

// 送信済みの一覧は「宛先 / 状態 / 日時」を別々の差し込みで並べるので、
// 素の文字列では継ぎ目の空白に当たらない。継ぎ目を緩めて見る。
const invitedAs = (email: string, status: string) =>
  new RegExp(`${email.replace(/[.+]/g, "\\$&")}\\s*/\\s*${status}`);

const submitInvite = async (page: Page, name: string, email: string) => {
  await page.goto(SUBACCOUNTS_PATH);
  await page
    .getByPlaceholder(
      "Please enter the name you want to give to the sub-account",
    )
    .fill(name);
  await page
    .getByPlaceholder(
      "Please enter the email address of the sub-account you are inviting",
    )
    .fill(email);
  await page.getByRole("button", { name: "Send" }).click();
};

// 招待された側は**別の入れ物**で署名する。同じ入れ物で署名し直そうとすると、
// すでに親で署名済みなので署名画面が管理画面へ流れ、合言葉の欄が出てこない。
const BASE_URL = "http://localhost:3000";

const signInAs = async (page: Page, email: string, password: string) => {
  await page.goto("/admin/user/signin");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(ADMIN_TOP);
};

test.describe("サブアカウントの招待", () => {
  // ケース1 Step1「未登録のメールアドレス → 何もおきない」
  test("登録の無い宛先には送れない", async ({ page }) => {
    await signInAsOwner(page);
    const unknown = uniqueEmail();
    await submitInvite(page, "居ない人", unknown);

    await expect(page.getByText(unknown)).toHaveCount(0);
  });

  // ケース1 Step2「ログイン中の自身のメールアドレス → 何もおきない」
  test("自分自身は招待できない", async ({ page }) => {
    await signInAsOwner(page);
    await submitInvite(page, "自分", SEED_OWNER_EMAIL);

    // 送信済みの一覧に自分が並ばないこと。画面の別の場所には自分のメールが
    // 出るので、**送信済みの一覧の中だけ**を見る。
    const invited = page
      .locator("div")
      .filter({ hasText: "Invited List" })
      .last();
    await expect(invited.getByText(SEED_OWNER_EMAIL)).toHaveCount(0);
  });

  // ケース2 Step1・Step2「招待 → 相手が『受け入れる』→ 一覧に登録済みを表示する」
  test("招待を受理するとサブアカウントになる", async ({ page, browser }) => {
    const childEmail = uniqueEmail();
    const childUid = await createOwnerAccount(childEmail, CHILD_PASSWORD);
    await markEmailVerified(childUid);

    await signInAsOwner(page);
    await submitInvite(page, "試験の子", childEmail);
    await expect(
      page.getByText(invitedAs(childEmail, "Sent and waiting")),
    ).toBeVisible();

    // 招待された側で受け入れる。確認の問いに「はい」で答える。
    const childContext = await browser.newContext({ baseURL: BASE_URL });
    const childPage = await childContext.newPage();
    await signInAs(childPage, childEmail, CHILD_PASSWORD);
    await expect(
      childPage.getByText(/I received an invitation from the owner/).first(),
    ).toBeVisible();
    await childPage.getByRole("button", { name: "Accept" }).click();
    // 確認の「はい」は button ではなく、押せる div。役割では掴めない。
    await childPage.getByText("Yes", { exact: true }).click();
    // 受理は呼び出しが返ってから画面を読み直す。**待たずに入れ物を閉じると
    // 呼び出しごと消える。** 招待の知らせが消えるのを、その合図にする。
    await expect(
      childPage.getByText(/I received an invitation from the owner/),
    ).toHaveCount(0);
    await childContext.close();

    // 親の画面では、送信済みの一覧が受理済みに変わっている。
    await page.goto(SUBACCOUNTS_PATH);
    await expect(
      page.getByText(invitedAs(childEmail, "Accepted")),
    ).toBeVisible();
  });
});
