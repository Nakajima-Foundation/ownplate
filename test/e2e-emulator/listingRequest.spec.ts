import { expect, test, type Page } from "@playwright/test";

import {
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
} from "../../scripts/seedData";
import { clearListingRequest } from "./shopState";

// もとは QA 手順書「おもちかえり.com QA手順書 兼 QA結果報告書 - Vue3-full-test」の
// 「6. 管理画面TOP」ケース6 Step15・Step16（掲載申請）と「19. 掲載申請」。
//
// 申し込みは requestList に文書を作るだけ。**残すと次の走行が「申請中」から
// 始まる**ので、終わりに消す。

const ADMIN_TOP = "/admin/restaurants";
const FLOW_TIMEOUT_MS = 180_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS, mode: "serial" });

test.afterEach(async () => {
  await clearListingRequest();
});

const signInAsEditOwner = async (page: Page) => {
  await page.goto("/admin/user/signin");
  await page.locator('input[type="email"]').fill(SEED_EDIT_OWNER_EMAIL);
  await page.locator('input[type="password"]').fill(SEED_EDIT_OWNER_PASSWORD);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(ADMIN_TOP);
};

// 同じ文言が説明文にも出る。押せるのは札のほう（a の中の span）。
const listingLink = (page: Page, label: string) =>
  page.locator("a").filter({ hasText: label }).first();

test.describe("お客様向け一覧への掲載申請", () => {
  // Step15「未掲載で『掲載を申請する』→ 申請中になり、ボタンが『申請を取り消す』」
  // Step16「申請中で『申請を取り消す』→ 未掲載に戻り、ボタンが『掲載を申請する』」
  test("申し込むと申請中になり、取り消すと未掲載に戻る", async ({ page }) => {
    await clearListingRequest();
    await signInAsEditOwner(page);

    await expect(page.getByText("Not Listed").first()).toBeVisible();
    await listingLink(page, "Request to be Listed").click();

    await expect(page.getByText("Waiting for Approval").first()).toBeVisible();
    await expect(listingLink(page, "Cancel Request")).toBeVisible();

    await listingLink(page, "Cancel Request").click();

    await expect(page.getByText("Not Listed").first()).toBeVisible();
    await expect(listingLink(page, "Request to be Listed")).toBeVisible();
  });
});
