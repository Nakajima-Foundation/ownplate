import { expect, test, type Page } from "@playwright/test";

import {
  SEED_EDIT_OWNER_EMAIL,
  SEED_EDIT_OWNER_PASSWORD,
  SEED_EDIT_RESTAURANT_ID,
  SEED_EDIT_RESTAURANT_NAME,
} from "../../scripts/seedData";
import { formatDay, startOfDayAfter } from "../../src/utils/shopCalendar";
import { submitOwnerSignIn } from "./helpers";
import { editTemporaryClosure, setEditTemporaryClosure } from "./shopState";

// 臨時休業日は Firestore に Timestamp で入る。店舗設定の編集フォームだけが Date で持ち、
// ほかの画面は Timestamp のまま読む。行き来する所（編集・保存・お客様の画面・
// 受付停止ページ）を通して、日付がずれたり落ちたりしないかを見る。
//
// **保存する綴りなので、編集専用の店舗とオーナーを使う。**

const ADMIN_TOP = "/admin/restaurants";
const EDIT_PATH = `/admin/restaurants/${SEED_EDIT_RESTAURANT_ID}`;
const SUSPEND_PATH = `${EDIT_PATH}/suspend`;
const SHOP_PATH = `/r/${SEED_EDIT_RESTAURANT_ID}`;
const DAYS_AHEAD = 5;
const NOON_MS = 12 * 60 * 60 * 1000;
const FLOW_TIMEOUT_MS = 240_000;
test.describe.configure({ timeout: FLOW_TIMEOUT_MS });

// 店の昼にしておく。編集フォームは端末の時刻で日付を書くので、0 時だと
// UTC の端末では前の日に見える（この試験で見たいことではない）。
const closedDay = new Date(
  startOfDayAfter(new Date(), DAYS_AHEAD).getTime() + NOON_MS,
);
const closedDayText = formatDay(closedDay, "YYYY/MM/DD");

test.afterEach(async () => {
  await setEditTemporaryClosure([]);
});

const signInAsEditOwner = async (page: Page) => {
  await submitOwnerSignIn(
    page,
    SEED_EDIT_OWNER_PASSWORD,
    SEED_EDIT_OWNER_EMAIL,
  );
  await expect(page).toHaveURL(ADMIN_TOP);
};

const save = async (page: Page) => {
  await page.getByRole("button", { name: "Save" }).first().click();
  await expect(page).toHaveURL(new RegExp(`${ADMIN_TOP}/?(#.*)?$`));
};

test.describe("臨時休業日", () => {
  test("保存しても同じ日の Timestamp のまま残り、お客様の画面に出る", async ({
    page,
  }) => {
    await setEditTemporaryClosure([closedDay]);
    await signInAsEditOwner(page);
    await page.goto(EDIT_PATH);
    await expect(page.getByText(closedDayText)).toBeVisible();
    await save(page);

    const saved = await editTemporaryClosure();
    expect(saved).toHaveLength(1);
    expect(new Date(saved[0].timestampValue ?? "").getTime()).toBe(
      closedDay.getTime(),
    );

    // 臨時休業日は店舗情報の「View More」を開いた中に出る。
    await page.goto(SHOP_PATH);
    await page.getByText("View More").first().click();
    await expect(page.getByText(closedDayText)).toBeVisible();
  });

  test("受付停止ページが臨時休業日を読んでも落ちない", async ({ page }) => {
    await setEditTemporaryClosure([closedDay]);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await signInAsEditOwner(page);
    await page.goto(SUSPEND_PATH);
    await expect(
      page.getByText(SEED_EDIT_RESTAURANT_NAME).first(),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("編集フォームで消して保存すると無くなる", async ({ page }) => {
    await setEditTemporaryClosure([closedDay]);
    await signInAsEditOwner(page);
    await page.goto(EDIT_PATH);
    await expect(page.getByText(closedDayText)).toBeVisible();
    // 日付の欄の隣にある削除。ページには別の削除アイコンもある。
    await page
      .getByText(closedDayText)
      .locator("xpath=..")
      .getByText("delete", { exact: true })
      .click();
    await expect(page.getByText(closedDayText)).toHaveCount(0);
    await save(page);

    expect(await editTemporaryClosure()).toEqual([]);
  });
});
