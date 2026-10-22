import { expect, test, type Page } from "@playwright/test";

import {
  SEED_EDIT_MENU_NAME,
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
  SEED_EDIT_RESTAURANT_ID,
} from "../../scripts/seedData";
import { expectOrderPlaced, signInCustomer } from "./helpers";
import { resetEditRestaurant } from "./shopState";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「7. 管理画面 > … > 店情報の変更」ケース2 Step31・Step31-1（メッセージを受付）と
// Step34（営業時間の終わりが始まりより前）。
//
// **保存する綴りなので、編集専用の店舗とオーナーを使う。** ほかの試験が使う店舗は触らない。

const ADMIN_TOP = "/admin/restaurants";
const EDIT_PATH = `/admin/restaurants/${SEED_EDIT_RESTAURANT_ID}`;
const SHOP_PATH = `/r/${SEED_EDIT_RESTAURANT_ID}`;
const MESSAGE_HEADING = "Message to the restaurant";
const BASE_URL = "http://localhost:3000";
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS, mode: "serial" });

test.afterEach(async () => {
  await resetEditRestaurant();
});

const signInAsEditOwner = async (page: Page) => {
  await page.goto("/admin/user/signin");
  await page.locator('input[type="email"]').fill(SEED_EDIT_OWNER_EMAIL);
  await page.locator('input[type="password"]').fill(SEED_EDIT_OWNER_PASSWORD);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(ADMIN_TOP);
};

const save = async (page: Page) => {
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page).toHaveURL(new RegExp(`${ADMIN_TOP}/?(#.*)?$`));
};

// お客様として注文確認まで進む。メッセージ欄はそこに出る。
const reachConfirmation = async (page: Page) => {
  await page.goto(SHOP_PATH);
  await page.getByText("Add", { exact: true }).first().click();
  await page.getByText("Confirm Cart").click();
  await page.getByText("Checkout").click();
  await expect(page).toHaveURL(
    new RegExp(`/r/${SEED_EDIT_RESTAURANT_ID}/order/`),
    { timeout: 90_000 },
  );
  await expect(
    page.getByRole("button", { name: /Place Order/i }).first(),
  ).toBeVisible();
};

test.describe("店情報の設定がお客様の画面に効く", () => {
  // Step31・Step31-1「『メッセージを受付』を ON にして保存 →
  // お客様の注文確認にお店へのメッセージ欄を表示する」
  test("メッセージ受付を入れるとお客様にメッセージ欄が出る", async ({
    page,
    browser,
  }) => {
    await signInAsEditOwner(page);
    await page.goto(EDIT_PATH);
    // 同じ文言が見出しにも出る。押せるのは id の付いたチェック欄のほう。
    await page.locator("#acceptUserMessageDescription").click();
    await save(page);

    // 注文者は**別の入れ物**で。同じ入れ物だとオーナーの署名が残っていて、
    // 署名済みと見なされたまま注文へ進めない。
    const customerContext = await browser.newContext({ baseURL: BASE_URL });
    const customerPage = await customerContext.newPage();
    await signInCustomer(customerPage);
    await reachConfirmation(customerPage);

    await expect(customerPage.getByText(MESSAGE_HEADING)).toBeVisible();
    await customerContext.close();
  });

  // Step31「OFF のときは出さない」。**「無い」は画面が描けてから数える。**
  test("メッセージ受付が切れていればメッセージ欄は出ない", async ({ page }) => {
    await signInCustomer(page);
    await reachConfirmation(page);

    await expect(page.getByText(SEED_EDIT_MENU_NAME).first()).toBeVisible();
    await expect(page.getByText(MESSAGE_HEADING)).toHaveCount(0);
  });
});

test.describe("営業時間の入力", () => {
  // Step34「終わりが始まりより前だと『保存』が非活性になる」
  test("終わりが始まりより前だと保存できない", async ({ page }) => {
    await signInAsEditOwner(page);
    await page.goto(EDIT_PATH);
    // 「保存」は上下に二つある。どちらも同じ状態なので先頭で見る。
    const saveButton = page.getByRole("button", { name: "Save" }).first();
    await expect(saveButton).toBeEnabled();

    // 曜日ごとに開始と終了の二つ。月曜の昼の枠が最初の組。
    const hours = page.locator("div.flex.items-center").filter({
      has: page.locator("select"),
    });
    const monday = hours.first();
    // 開始を 21:00、終了を 11:00 にすると始まりが終わりを追い越す。
    await monday.locator("select").first().selectOption({ value: "1260" });
    await monday.locator("select").nth(1).selectOption({ value: "660" });

    await expect(saveButton).toBeDisabled();
  });
});
