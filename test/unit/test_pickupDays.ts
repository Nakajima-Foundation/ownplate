import { describe, it } from "node:test";
import assert from "node:assert";

import {
  availablePickupDays,
  businessDaysOf,
  daysInAdvanceOf,
  openSlotsOf,
  temporaryClosureDatesOf,
  withinLastOrder,
  type PickupDaysInput,
  type PickupShop,
} from "../../src/utils/pickupDays.ts";

// 受け取れる日と時刻の決まり。画面の選択肢はここから作る。
// 時計は引数で渡すので、試験は好きな「今」と「今日の 0 時」を渡すだけで決まる。
// 日付はローカル時刻で組み立てる（実装は日付を端末の暦で読む）。
//
// usePickupTime がどの時計を渡すかは、ここでは試験していない。今は「今」を store の時計、
// 「今日の 0 時」を端末の時計から渡しており、store の時計が遅れたまま 0 時をまたぐと
// 曜日と日付が食い違う。その渡し方を変えても、このファイルも test_pickupTime.ts も赤くならない。

const H = 60;
const ELEVEN = 11 * H;
const TWO_PM = 14 * H;
const EVERY_DAY = ["1", "2", "3", "4", "5", "6", "7"];

// 2026-09-24 は木曜。
const THURSDAY = new Date(2026, 8, 24);
const at = (dayDelta: number, minutes: number, seconds = 0) =>
  new Date(2026, 8, 24 + dayDelta, 0, minutes, seconds);
const midNightFrom =
  (today: Date) =>
  (offset: number): Date =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);

const hoursEveryDay = (blocks: { start: number; end: number }[]) =>
  Object.fromEntries(EVERY_DAY.map((day) => [day, blocks]));

const shopOf = (over: Partial<PickupShop> = {}): PickupShop => ({
  businessDay: Object.fromEntries(EVERY_DAY.map((day) => [day, true])),
  openTimes: hoursEveryDay([{ start: ELEVEN, end: TWO_PM }]),
  temporaryClosure: [],
  suspendUntil: null,
  pickUpDaysInAdvance: 3,
  ...over,
});

const inputOf = (over: Partial<PickupDaysInput> = {}): PickupDaysInput => ({
  shop: shopOf(),
  except: undefined,
  skipToday: false,
  minimumTime: 25,
  now: at(0, 9 * H),
  midNightAfter: midNightFrom(THURSDAY),
  ...over,
});

const offsetsOf = (input: PickupDaysInput) =>
  availablePickupDays(input).map((day) => day.offset);
const firstTimeOf = (input: PickupDaysInput) =>
  availablePickupDays(input)[0]?.times[0];

const ts = (date: Date) => ({
  seconds: Math.floor(date.getTime() / 1000),
  toDate: () => date,
});

describe("availablePickupDays: 日", () => {
  it("offers today plus the days the shop accepts in advance", () => {
    assert.deepStrictEqual(offsetsOf(inputOf()), [0, 1, 2, 3]);
  });

  it("dates each day with the midnight it is given", () => {
    const days = availablePickupDays(inputOf());
    days.forEach((day) =>
      assert.strictEqual(
        day.date.getTime(),
        midNightFrom(THURSDAY)(day.offset).getTime(),
      ),
    );
  });

  it("offers nothing while the shop information is still loading", () => {
    const loading = shopOf({ businessDay: JSON.parse("null") });
    assert.deepStrictEqual(availablePickupDays(inputOf({ shop: loading })), []);
  });

  it("skips today when asked to", () => {
    assert.deepStrictEqual(offsetsOf(inputOf({ skipToday: true })), [1, 2, 3]);
  });

  // 木曜が今日。金曜（"5"）を休みにすると offset 1 が抜ける。
  it("drops a weekday the shop is closed on", () => {
    const shop = shopOf({
      businessDay: { ...shopOf().businessDay, "5": false },
    });
    assert.deepStrictEqual(offsetsOf(inputOf({ shop })), [0, 2, 3]);
  });

  it("drops a weekday an item in the order excepts", () => {
    assert.deepStrictEqual(
      offsetsOf(inputOf({ except: { exceptDay: { "5": true, "6": false } } })),
      [0, 2, 3],
    );
  });

  // 日曜は "7"。今日（木）から 3 日後が日曜。
  it("reads Sunday from key 7", () => {
    const shop = shopOf({
      businessDay: { ...shopOf().businessDay, "7": false },
    });
    assert.deepStrictEqual(offsetsOf(inputOf({ shop })), [0, 1, 2]);
  });

  it("drops a temporarily closed date in either of its two shapes", () => {
    const shop = shopOf({
      temporaryClosure: [ts(at(1, 0)), at(3, 0)],
    });
    assert.deepStrictEqual(offsetsOf(inputOf({ shop })), [0, 2]);
  });

  it("falls back to three days in advance when the shop has not set it", () => {
    const shop = shopOf({ pickUpDaysInAdvance: JSON.parse("null") });
    assert.deepStrictEqual(offsetsOf(inputOf({ shop })), [0, 1, 2, 3]);
  });

  it("offers today only when the shop takes no advance orders", () => {
    const shop = shopOf({ pickUpDaysInAdvance: 0 });
    assert.deepStrictEqual(offsetsOf(inputOf({ shop })), [0]);
  });

  it("drops a day with no time left", () => {
    assert.deepStrictEqual(
      offsetsOf(inputOf({ now: at(0, 14 * H) })),
      [1, 2, 3],
    );
  });

  // 壊れた臨時休業日で落ちるのは、営業日が 1 日でも残ったときだけ。
  it("reads the closures only once some business day is left", () => {
    const broken = shopOf({
      temporaryClosure: JSON.parse("[null]"),
      businessDay: {},
    });
    assert.deepStrictEqual(availablePickupDays(inputOf({ shop: broken })), []);
    assert.throws(
      () =>
        availablePickupDays(
          inputOf({ shop: shopOf({ temporaryClosure: JSON.parse("[null]") }) }),
        ),
      TypeError,
    );
  });

  // 営業時間に曜日が欠けていると落ちる。落ちるのは、その計算まで進んだときだけ。
  it("reads the opening hours only once some day is left", () => {
    const noHours = shopOf({ openTimes: {} });
    assert.deepStrictEqual(
      availablePickupDays(inputOf({ shop: { ...noHours, businessDay: {} } })),
      [],
    );
    assert.throws(
      () => availablePickupDays(inputOf({ shop: noHours })),
      TypeError,
    );
  });
});

describe("availablePickupDays: 時刻", () => {
  it("starts after the time the shop needs to cook", () => {
    // 11:00 に 25 分 → 11:25 以降。枠は 10 分刻みなので 11:30。
    assert.strictEqual(
      firstTimeOf(inputOf({ now: at(0, ELEVEN) })),
      ELEVEN + 30,
    );
  });

  it("offers every slot from opening when the shop has not opened yet", () => {
    assert.strictEqual(firstTimeOf(inputOf()), ELEVEN);
  });

  it("stops at closing time and steps every ten minutes", () => {
    const today = availablePickupDays(inputOf())[0].times;
    assert.strictEqual(today.at(-1), TWO_PM);
    today
      .slice(1)
      .forEach((time, index) => assert.strictEqual(time - today[index], 10));
  });

  // 秒の端数は切り上げ。10:00:30 に 25 分 → 10:25:30 なので、10:25 の枠は間に合わない。
  it("rounds the earliest time up to the next whole minute", () => {
    const shop = shopOf({
      openTimes: hoursEveryDay([{ start: 605, end: 700 }]),
    });
    assert.strictEqual(
      firstTimeOf(inputOf({ shop, now: at(0, 10 * H, 30) })),
      635,
    );
    assert.strictEqual(firstTimeOf(inputOf({ shop, now: at(0, 10 * H) })), 625);
  });

  it("waits until the shop resumes when orders are suspended", () => {
    const shop = shopOf({ suspendUntil: ts(at(0, 12 * H + 45)) });
    assert.strictEqual(firstTimeOf(inputOf({ shop })), 12 * H + 50);
  });

  it("ignores a suspension that has already ended", () => {
    const shop = shopOf({ suspendUntil: ts(at(0, 8 * H)) });
    assert.strictEqual(
      firstTimeOf(inputOf({ shop, now: at(0, ELEVEN) })),
      ELEVEN + 30,
    );
  });

  it("leaves the following days whole", () => {
    const days = availablePickupDays(inputOf({ now: at(0, 12 * H) }));
    assert.strictEqual(days[1].times[0], ELEVEN);
  });

  it("drops the slots inside an excepted window, ends included", () => {
    const today = availablePickupDays(
      inputOf({ except: { exceptHours: [{ start: 12 * H, end: 13 * H }] } }),
    )[0].times;
    assert.strictEqual(today.includes(12 * H - 10), true);
    assert.strictEqual(today.includes(12 * H), false);
    assert.strictEqual(today.includes(13 * H), false);
    assert.strictEqual(today.includes(13 * H + 10), true);
  });
});

describe("openSlotsOf: 昼の部と夜の部", () => {
  const twoHalves = shopOf({
    openTimes: hoursEveryDay([
      { start: ELEVEN, end: 12 * H },
      { start: 17 * H, end: 18 * H },
    ]),
  });

  it("offers both halves when neither was asked for", () => {
    const [sunday] = openSlotsOf(twoHalves, undefined);
    assert.strictEqual(sunday.includes(ELEVEN), true);
    assert.strictEqual(sunday.includes(17 * H), true);
  });

  it("offers only the lunch half for a lunch order", () => {
    const [sunday] = openSlotsOf(twoHalves, undefined, "lunch");
    assert.deepStrictEqual([sunday[0], sunday.at(-1)], [ELEVEN, 12 * H]);
  });

  it("offers only the dinner half for a dinner order", () => {
    const [sunday] = openSlotsOf(twoHalves, undefined, "dinner");
    assert.deepStrictEqual([sunday[0], sunday.at(-1)], [17 * H, 18 * H]);
  });

  it("offers nothing for a dinner order at a shop with no dinner half", () => {
    assert.deepStrictEqual(openSlotsOf(shopOf(), undefined, "dinner")[0], []);
  });

  it("orders the week from Sunday", () => {
    const shop = shopOf({
      openTimes: {
        ...hoursEveryDay([]),
        "7": [{ start: ELEVEN, end: ELEVEN }],
      },
    });
    assert.deepStrictEqual(
      openSlotsOf(shop, undefined).map((slots) => slots.length),
      [1, 0, 0, 0, 0, 0, 0],
    );
  });
});

describe("withinLastOrder", () => {
  const days = [
    { offset: 0, date: THURSDAY, times: [12 * H, 12 * H + 10, 12 * H + 20] },
  ];

  it("drops the times after the last order plus the cooking time, keeping the boundary", () => {
    const [today] = withinLastOrder(days, { lastOrderTime: 12 * H - 15 }, 25);
    assert.deepStrictEqual(today.times, [12 * H, 12 * H + 10]);
  });

  // 0 は 0 時ではなく「設定なし」として読まれる。
  it("treats a last order of zero as not set", () => {
    const [today] = withinLastOrder(days, { lastOrderTime: 0 }, 25);
    assert.deepStrictEqual(today.times, days[0].times);
  });

  it("keeps a day even when all its times are gone", () => {
    assert.deepStrictEqual(
      withinLastOrder(days, { lastOrderTime: 1 }, 0)[0].times,
      [],
    );
  });
});

describe("部品", () => {
  it("businessDaysOf lists the week from Sunday", () => {
    assert.deepStrictEqual(
      businessDaysOf({ businessDay: { "7": true, "1": false } }, undefined).map(
        Boolean,
      ),
      [true, false, false, false, false, false, false],
    );
  });

  it("daysInAdvanceOf counts today", () => {
    assert.strictEqual(daysInAdvanceOf({ pickUpDaysInAdvance: 3 }), 4);
    assert.strictEqual(daysInAdvanceOf({ pickUpDaysInAdvance: 0 }), 1);
  });

  it("temporaryClosureDatesOf reads both shapes as local dates", () => {
    assert.deepStrictEqual(
      temporaryClosureDatesOf({
        temporaryClosure: [ts(at(1, 0)), at(2, 23 * H)],
      }),
      ["2026-09-25", "2026-09-26"],
    );
    assert.deepStrictEqual(
      temporaryClosureDatesOf({ temporaryClosure: JSON.parse("null") }),
      [],
    );
  });
});

// 生成した設定で、どの日にも成り立つこと。
describe("availablePickupDays: どの設定でも", () => {
  const configs: PickupDaysInput[] = [];
  [0, 1, 3].forEach((advance) =>
    [0, 25, 90].forEach((minimumTime) =>
      [0, 9 * H, 11 * H + 7, 13 * H + 55, 23 * H + 59].forEach((nowMinutes) =>
        [false, true].forEach((skipToday) =>
          configs.push(
            inputOf({
              shop: shopOf({ pickUpDaysInAdvance: advance }),
              minimumTime,
              skipToday,
              now: at(0, nowMinutes, 30),
            }),
          ),
        ),
      ),
    ),
  );

  it("never offers a time before now plus the cooking time", () => {
    configs.forEach((input) =>
      availablePickupDays(input).forEach((day) =>
        day.times.forEach((time) => {
          const slot = day.date.getTime() + time * 60000;
          assert.ok(
            slot >= input.now.getTime() + input.minimumTime * 60000,
            JSON.stringify({ now: input.now, time, offset: day.offset }),
          );
        }),
      ),
    );
  });

  it("never offers a day beyond the advance window, and never an empty day", () => {
    configs.forEach((input) =>
      availablePickupDays(input).forEach((day) => {
        assert.ok(day.offset < daysInAdvanceOf(input.shop));
        assert.ok(day.times.length > 0);
      }),
    );
  });

  it("lists the days in order without repeats", () => {
    configs.forEach((input) => {
      const offsets = offsetsOf(input);
      assert.deepStrictEqual(
        offsets,
        [...new Set(offsets)].sort((a, b) => a - b),
      );
    });
  });
});
