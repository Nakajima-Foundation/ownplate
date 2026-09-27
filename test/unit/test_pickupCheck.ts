import { describe, it } from "node:test";
import assert from "node:assert";

import {
  checkPickupOffered,
  type PickupCheckInput,
} from "../../src/utils/pickupCheck.ts";
import {
  availablePickupDays,
  minimumCookTimeOf,
  withinLastOrder,
} from "../../src/utils/pickupDays.ts";
import { pickupDateOf, startOfDayAfter } from "../../src/utils/shopCalendar.ts";
import { menuFixture } from "../fixtures/menu.ts";
import { shopTime } from "../helpers/shopTime.ts";

// サーバ（orderPlace）が、送られてきた受取日時が画面の選択肢に入っていたかを確かめる。
// 日時は店の時刻（JST）で組み立てる。2026-09-24 は木曜。

const H = 60;
const EVERY_DAY = ["1", "2", "3", "4", "5", "6", "7"];
const hoursEveryDay = (blocks: { start: number; end: number }[]) =>
  Object.fromEntries(EVERY_DAY.map((day) => [day, blocks]));

const shopOf = (
  over: Partial<PickupCheckInput["shop"]> = {},
): PickupCheckInput["shop"] => ({
  businessDay: Object.fromEntries(EVERY_DAY.map((day) => [day, true])),
  openTimes: hoursEveryDay([{ start: 11 * H, end: 14 * H }]),
  temporaryClosure: [],
  suspendUntil: null,
  pickUpDaysInAdvance: 3,
  pickUpMinimumCookTime: 25,
  deliveryMinimumCookTime: 40,
  ...over,
});

const thursdayAt = (hour: number, minute = 0) =>
  shopTime(2026, 9, 24, hour, minute);

const check = (over: Partial<PickupCheckInput>) =>
  checkPickupOffered({
    shop: shopOf(),
    menuItems: {},
    isDelivery: false,
    now: thursdayAt(11),
    pickupAt: thursdayAt(11, 30),
    ...over,
  });

const OFFERED = { offered: true };
const NO_DAY = { offered: false, reason: "day" };
const NO_TIME = { offered: false, reason: "time" };

describe("checkPickupOffered", () => {
  it("accepts a time the order page offered", () => {
    assert.deepStrictEqual(check({}), OFFERED);
  });

  it("rejects a time before now plus the cooking time", () => {
    assert.deepStrictEqual(check({ pickupAt: thursdayAt(11, 20) }), NO_TIME);
  });

  it("uses the delivery cooking time for a delivery order", () => {
    assert.deepStrictEqual(check({ isDelivery: true }), NO_TIME);
    assert.deepStrictEqual(
      check({ isDelivery: true, pickupAt: thursdayAt(11, 40) }),
      OFFERED,
    );
  });

  it("rejects a time off the ten-minute grid", () => {
    assert.deepStrictEqual(check({ pickupAt: thursdayAt(11, 35) }), NO_TIME);
    assert.deepStrictEqual(
      check({ pickupAt: shopTime(2026, 9, 24, 11, 30, 1) }),
      NO_TIME,
    );
  });

  it("rejects a day beyond the days taken in advance", () => {
    assert.deepStrictEqual(
      check({ pickupAt: shopTime(2026, 9, 28, 11, 30) }),
      NO_DAY,
    );
    assert.deepStrictEqual(
      check({ pickupAt: shopTime(2026, 9, 27, 11, 30) }),
      OFFERED,
    );
  });

  it("rejects a day in the past", () => {
    assert.deepStrictEqual(
      check({ pickupAt: shopTime(2026, 9, 23, 11, 30) }),
      NO_DAY,
    );
  });

  it("rejects a weekday the shop is closed on", () => {
    const shop = shopOf({
      businessDay: { ...shopOf().businessDay, "5": false },
    });
    assert.deepStrictEqual(
      check({ shop, pickupAt: shopTime(2026, 9, 25, 12) }),
      NO_DAY,
    );
  });

  it("rejects a date the shop closed temporarily", () => {
    const shop = shopOf({ temporaryClosure: [shopTime(2026, 9, 25)] });
    assert.deepStrictEqual(
      check({ shop, pickupAt: shopTime(2026, 9, 25, 12) }),
      NO_DAY,
    );
  });

  it("rejects a time while orders are suspended", () => {
    const suspended = thursdayAt(13);
    const shop = shopOf({ suspendUntil: { toDate: () => suspended } });
    assert.deepStrictEqual(check({ shop, pickupAt: thursdayAt(12) }), NO_TIME);
    assert.deepStrictEqual(check({ shop, pickupAt: thursdayAt(13) }), OFFERED);
  });

  // ラストオーダー 12:00 ＋調理 25 分 = 12:25 まで。枠は 10 分刻みなので 12:20 が最後。
  it("rejects a time after the last order plus the cooking time", () => {
    const shop = shopOf({ lastOrderTime: 12 * H });
    assert.deepStrictEqual(
      check({ shop, pickupAt: thursdayAt(12, 20) }),
      OFFERED,
    );
    assert.deepStrictEqual(
      check({ shop, pickupAt: thursdayAt(12, 30) }),
      NO_TIME,
    );
  });

  it("follows the lunch or dinner half of the order", () => {
    const shop = shopOf({
      openTimes: hoursEveryDay([
        { start: 11 * H, end: 14 * H },
        { start: 17 * H, end: 21 * H },
      ]),
    });
    assert.deepStrictEqual(
      check({ shop, lunchOrDinner: "dinner", pickupAt: thursdayAt(12) }),
      NO_TIME,
    );
    assert.deepStrictEqual(
      check({ shop, lunchOrDinner: "dinner", pickupAt: thursdayAt(18) }),
      OFFERED,
    );
  });

  it("follows the days and hours the ordered items exclude", () => {
    const menuItems = {
      bento: menuFixture({
        exceptDay: { "5": true },
        exceptHour: { start: 12 * H, end: 13 * H },
      }),
    };
    assert.deepStrictEqual(
      check({ menuItems, pickupAt: shopTime(2026, 9, 25, 11, 30) }),
      NO_DAY,
    );
    assert.deepStrictEqual(
      check({ menuItems, pickupAt: thursdayAt(12, 30) }),
      NO_TIME,
    );
    assert.deepStrictEqual(
      check({ menuItems, pickupAt: thursdayAt(13, 10) }),
      OFFERED,
    );
  });

  it("accepts an order without a copy of the menu", () => {
    assert.deepStrictEqual(check({ menuItems: undefined }), OFFERED);
  });

  // 営業時間の終わりに 24:00 を選ぶと、翌日 0:00 の枠が出る。
  it("accepts the midnight slot at the end of the day", () => {
    const shop = shopOf({
      openTimes: hoursEveryDay([{ start: 20 * H, end: 24 * H }]),
    });
    assert.deepStrictEqual(
      check({ shop, pickupAt: shopTime(2026, 9, 25, 0, 0) }),
      OFFERED,
    );
  });

  // 壊れた設定では例外になる。orderPlace は例外を記録して注文を続ける。
  it("throws on opening hours missing a weekday", () => {
    assert.throws(() => check({ shop: shopOf({ openTimes: {} }) }), TypeError);
  });
});

// 画面が出した選択肢は、同じ時刻に確定すればサーバでもすべて受け付ける。
describe("checkPickupOffered: 画面の選択肢と同じ", () => {
  it("accepts every slot the order page offers at the same moment", () => {
    const shops = [
      shopOf(),
      shopOf({ lastOrderTime: 12 * H + 30, pickUpDaysInAdvance: 1 }),
      shopOf({
        openTimes: hoursEveryDay([
          { start: 9 * H, end: 11 * H + 30 },
          { start: 17 * H, end: 24 * H },
        ]),
      }),
    ];
    const nows = [
      thursdayAt(0),
      thursdayAt(10, 7),
      thursdayAt(12, 59),
      thursdayAt(23, 50),
    ];
    let checked = 0;
    shops.forEach((shop) =>
      nows.forEach((now) =>
        [false, true].forEach((isDelivery) =>
          [undefined, "lunch", "dinner"].forEach((lunchOrDinner) => {
            const minimumTime = minimumCookTimeOf(shop, isDelivery);
            const days = withinLastOrder(
              availablePickupDays({
                shop,
                except: undefined,
                lunchOrDinner,
                skipToday: false,
                minimumTime,
                now,
                midNightAfter: (offset) => startOfDayAfter(now, offset),
              }),
              shop,
              minimumTime,
            );
            days.forEach((day) =>
              day.times.forEach((time) => {
                checked += 1;
                assert.deepStrictEqual(
                  check({
                    shop,
                    now,
                    isDelivery,
                    lunchOrDinner,
                    pickupAt: pickupDateOf(day.date, time),
                  }),
                  OFFERED,
                );
              }),
            );
          }),
        ),
      ),
    );
    assert.ok(checked > 0);
  });
});
