import { expect, test, type Page } from "@playwright/test";

import { SEED_MENU_NAME, SEED_RESTAURANT_ID } from "../../scripts/seedData";
import { signInAsOwner } from "./helpers";
import { setMenuExcept } from "./shopState";

// 受け取れる日時を使う画面のうち、注文画面の外にあるもの（店舗ページの店舗情報と商品、
// 注文停止画面）。受け取れる日時はブラウザの時計で決まるので、日本時間の「今日の決まった
// 時刻」に固定する。種まきの店舗は毎日 11:00〜21:00、調理に 25 分。

test.use({ timezoneId: "Asia/Tokyo" });

const TOKYO_OFFSET_HOURS = 9;
const MINUTES_PER_HOUR = 60;
const SUSPEND_BUTTON_COUNT = 12;

type DayInTokyo = { year: number; month: number; day: number };

const todayInTokyo = (): DayInTokyo => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const partOf = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: partOf("year"), month: partOf("month"), day: partOf("day") };
};

// 今日から dayOffset 日後の、日本時間 minutes 分（0 時から）。
const tokyoTime = (dayOffset: number, minutes: number) => {
  const { year, month, day } = todayInTokyo();
  return new Date(
    Date.UTC(year, month - 1, day + dayOffset, -TOKYO_OFFSET_HOURS, minutes),
  );
};

// 店舗情報の日付は MM/DD。
const monthDayOf = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const partOf = (type: string) =>
    parts.find((part) => part.type === type)?.value;
  return `${partOf("month")}/${partOf("day")}`;
};

const TEN_AM = 10 * MINUTES_PER_HOUR;
const NINE_THIRTY_PM = 21 * MINUTES_PER_HOUR + 30;

const openShop = async (page: Page, minutes: number) => {
  await page.clock.setFixedTime(tokyoTime(0, minutes));
  await page.goto(`/r/${SEED_RESTAURANT_ID}`);
};

const shopTimesBox = (page: Page) =>
  page.locator("div", { hasText: "Minimum available time" }).last();

test.describe("店舗ページの店舗情報", () => {
  test("開店前は、今日の開店時刻からと、今日のラストオーダーを出す", async ({
    page,
  }) => {
    await openShop(page, TEN_AM);
    const box = shopTimesBox(page);
    await expect(box).toContainText(`${monthDayOf(tokyoTime(0, 0))}`);
    await expect(box).toContainText("11:00 AM");
    // 最後の受取枠 21:00 から調理の 25 分を引いた 20:35。
    await expect(box).toContainText("Last order for today: 8:35 PM");
  });

  test("閉店後は、今日は受け取れないと出して、明日の開店時刻を出す", async ({
    page,
  }) => {
    await openShop(page, NINE_THIRTY_PM);
    const box = shopTimesBox(page);
    await expect(box).toContainText("Not available today");
    await expect(box).toContainText(`${monthDayOf(tokyoTime(1, 0))}`);
    await expect(box).toContainText("11:00 AM");
  });
});

test.describe("注文停止画面", () => {
  const suspendButtons = (page: Page) =>
    page.getByRole("button", { name: /Suspend until/ });

  const openSuspendPage = async (page: Page, minutes: number) => {
    await page.clock.setFixedTime(tokyoTime(0, minutes));
    await signInAsOwner(page);
    await page.goto(`/admin/restaurants/${SEED_RESTAURANT_ID}/suspend`);
  };

  // 受け取れる最初の日の、最初の枠を除いた 12 枠を出す。
  test("開店前は、今日の 11:10 から 12 枠を出す", async ({ page }) => {
    await openSuspendPage(page, TEN_AM);
    await expect(suspendButtons(page)).toHaveCount(SUSPEND_BUTTON_COUNT);
    await expect(suspendButtons(page).first()).toContainText("11:10 AM");
    await expect(suspendButtons(page).last()).toContainText("1:00 PM");
  });

  test("閉店後は、明日の 11:10 から出す", async ({ page }) => {
    await openSuspendPage(page, NINE_THIRTY_PM);
    await expect(suspendButtons(page)).toHaveCount(SUSPEND_BUTTON_COUNT);
    await expect(suspendButtons(page).first()).toContainText("11:10 AM");
  });
});

test.describe("店舗ページの商品の受取除外", () => {
  test.afterEach(async () => {
    await setMenuExcept(null);
  });

  test("除外した曜日を抜いた曜日と、受け取れない時間帯を出す", async ({
    page,
  }) => {
    await setMenuExcept({
      exceptDay: { "1": true, "3": false },
      exceptHour: {
        start: 12 * MINUTES_PER_HOUR + 30,
        end: 13 * MINUTES_PER_HOUR + 20,
      },
    });
    await page.goto(`/r/${SEED_RESTAURANT_ID}`);
    const item = page
      .locator("div", { hasText: SEED_MENU_NAME })
      .filter({ hasText: "Limited sale on the day of the week" })
      .last();
    await expect(item).toContainText(
      "Tue・Wed・Thu・Fri・Sat・Sun Limited sale on the day of the week",
    );
    await expect(item).not.toContainText("Mon");
    await expect(item).toContainText("Unavailable Time: 12:30 PM ~ 1:20 PM");
  });
});
