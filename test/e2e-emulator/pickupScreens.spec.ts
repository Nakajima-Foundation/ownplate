import { expect, test, type Page } from "@playwright/test";

import { SEED_MENU_NAME, SEED_RESTAURANT_ID } from "../../scripts/seedData";
import {
  addOneItemAndCheckout,
  signInAsOwner,
  signInCustomer,
  waitForOrderConfirmation,
} from "./helpers";
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

// 見出し（「Takeaway:Minimum available time」）の親が、受取時刻とラストオーダーを持つ枠。
const shopTimesBox = (page: Page) =>
  page.getByText("Minimum available time").first().locator("..");

test.describe("店舗ページの店舗情報", () => {
  test("開店前は、今日の開店時刻からと、今日のラストオーダーを出す", async ({
    page,
  }) => {
    await openShop(page, TEN_AM);
    const box = shopTimesBox(page);
    await expect(box).toContainText(`${monthDayOf(tokyoTime(0, 0))}`);
    await expect(box).toContainText("11:00 AM");
    // 最後の受取枠 21:00 から調理の 25 分を引いた 20:35。
    await expect(box).toContainText("Last order for today: 08:35 PM");
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

// 今日（日本時間）から見て、次の weekday（日曜が 0）までの日数。今日がそれなら 0。
const daysUntilWeekday = (weekday: number) => {
  const { year, month, day } = todayInTokyo();
  const todayWeekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return (weekday - todayWeekday + 7) % 7;
};
const SUNDAY = 0;
const MONDAY = 1;
const TWO_PM = 14 * MINUTES_PER_HOUR;

test.describe("店舗情報の営業時間の「Open」", () => {
  const openOn = async (page: Page, weekday: number) => {
    await page.clock.setFixedTime(tokyoTime(daysUntilWeekday(weekday), TWO_PM));
    await page.goto(`/r/${SEED_RESTAURANT_ID}`);
    await page.getByText("View More", { exact: true }).click();
  };

  // 営業時間のキーは日曜が "7"、曜日は日曜が 0。以前は日曜だけ出なかった。
  test("日曜の営業時間内に、今日の行に Open を出す", async ({ page }) => {
    await openOn(page, SUNDAY);
    const today = page.locator("div.flex.rounded-sm", { hasText: "Sun" });
    await expect(today.getByText("Open", { exact: true })).toBeVisible();
    await expect(page.getByText("Open", { exact: true })).toHaveCount(1);
  });

  test("月曜の営業時間内に、今日の行に Open を出す", async ({ page }) => {
    await openOn(page, MONDAY);
    const today = page.locator("div.flex.rounded-sm", { hasText: "Mon" });
    await expect(today.getByText("Open", { exact: true })).toBeVisible();
    await expect(page.getByText("Open", { exact: true })).toHaveCount(1);
  });
});

test.describe("注文停止画面", () => {
  // 時刻のボタンだけ。日単位のボタン（Suspend until the end of N days）は数えない。
  const suspendButtons = (page: Page) =>
    page.getByRole("button", { name: /Suspend until \d/ });

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
    await expect(suspendButtons(page).last()).toContainText("01:00 PM");
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
    await expect(item).toContainText("Unavailable Time: 12:30 PM ~ 01:20 PM");
  });
});

// 受取日時は店の時刻（JST）で数える。端末が日本以外のタイムゾーンでも、日本の端末と同じ
// 選択肢を出し、選んだ時刻を日本時間のその時刻として送る。
test.describe("日本以外のタイムゾーンの端末（ロサンゼルス）", () => {
  test.use({ timezoneId: "America/Los_Angeles" });

  const ELEVEN_THIRTY_AM = 11 * MINUTES_PER_HOUR + 30;
  const ORDER_FLOW_TIMEOUT_MS = 120_000;
  const MILLISECONDS_PER_SECOND = 1000;
  type OrderPlaceRequest = { data: { timeToPickup: { seconds: number } } };

  test("店舗情報は日本時間で受取時刻とラストオーダーを出す", async ({
    page,
  }) => {
    await openShop(page, TEN_AM);
    const box = shopTimesBox(page);
    await expect(box).toContainText(`${monthDayOf(tokyoTime(0, 0))}`);
    await expect(box).toContainText("11:00 AM");
    await expect(box).toContainText("Last order for today: 08:35 PM");
  });

  test("選んだ受取時刻を日本時間のその時刻として送る", async ({ page }) => {
    test.setTimeout(ORDER_FLOW_TIMEOUT_MS);
    await page.clock.setFixedTime(tokyoTime(0, TEN_AM));
    await signInCustomer(page);
    await addOneItemAndCheckout(page);
    await waitForOrderConfirmation(page);

    // 受取日は一覧の最後（今日から受付日数ぶん先）、時刻は 11:30。
    const timeSelect = page.locator("select", {
      has: page.locator(`option[value="${ELEVEN_THIRTY_AM}"]`),
    });
    const daySelect = timeSelect.locator("xpath=preceding-sibling::select[1]");
    const dayCount = await daySelect.locator("option").count();
    await daySelect.selectOption({ index: dayCount - 1 });
    await timeSelect.selectOption(String(ELEVEN_THIRTY_AM));

    // 送られた受取日時を控えて、確定はさせない。
    const sentSeconds: number[] = [];
    await page.route("**/orderPlaceJp2", async (route) => {
      const request: OrderPlaceRequest = route.request().postDataJSON();
      sentSeconds.push(request.data.timeToPickup.seconds);
      await route.abort();
    });
    await page
      .getByRole("button", { name: /Place Order/i })
      .first()
      .click();
    await expect.poll(() => sentSeconds.length).toBe(1);

    expect(sentSeconds[0] * MILLISECONDS_PER_SECOND).toBe(
      tokyoTime(dayCount - 1, ELEVEN_THIRTY_AM).getTime(),
    );
  });
});
