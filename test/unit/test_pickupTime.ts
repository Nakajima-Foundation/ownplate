import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { createPinia, setActivePinia } from "pinia";
import { computed, ref, type ComputedRef } from "vue";

import { usePickupTime } from "../../src/utils/pickup.ts";
import { useGeneralStore } from "../../src/store/index.ts";
import { midNight } from "../../src/utils/dateUtils.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";
import { menuFixture } from "../fixtures/menu.ts";
import { runInSetup } from "../helpers/vueSetup.ts";
import type { RestaurantInfoData } from "../../src/models/RestaurantInfo.ts";
import type { MenuData } from "../../src/models/menu.ts";

// 客が注文を受け取れる日と時刻。**ここが店舗ページと注文画面の受取時刻の選択肢**になる。
// 出しすぎれば店が用意できない時刻の注文が入り、出さなすぎれば受けられる注文を逃す。
//
// **時計を固定する。** 実装は `midNight()` と `new Date()` を自分で何度も読むので、
// 固定しないと日付をまたいだ瞬間に store の「今日」と食い違う。固定すれば曜日も決まる。
// 時刻はローカルで組み立てるので、日本でも UTC の CI でも同じ分数になる。
const MINUTES_PER_HOUR = 60;
const FROZEN_YEAR = 2026;
const FROZEN_MONTH_INDEX = 8; // 9月
const FROZEN_DAY = 24; // 木曜
const THURSDAY = "4";
const freezeAt = (hour: number) => {
  mock.timers.reset();
  mock.timers.enable({
    apis: ["Date"],
    now: new Date(FROZEN_YEAR, FROZEN_MONTH_INDEX, FROZEN_DAY, hour),
  });
};
const ELEVEN = 11 * MINUTES_PER_HOUR;
const TWO_PM = 14 * MINUTES_PER_HOUR;

// 臨時休業は Firestore の Timestamp で届く。読む側は seconds の有無で
// 「Timestamp か、素の Date か」を見分けているので、seconds も入れておく。
const closedOn = (date: Date) => ({
  seconds: Math.floor(date.getTime() / 1000),
  toDate: () => date,
});

const everyDay = {
  "1": true,
  "2": true,
  "3": true,
  "4": true,
  "5": true,
  "6": true,
  "7": true,
};
const sameHoursEveryDay = (start: number, end: number) =>
  Object.fromEntries(
    ["1", "2", "3", "4", "5", "6", "7"].map((day) => [day, [{ start, end }]]),
  );

type ExceptData = Parameters<typeof usePickupTime>[1];

const FIVE_PM = 17 * MINUTES_PER_HOUR;
const NINE_PM = 21 * MINUTES_PER_HOUR;

// 昼の部と夜の部を持つ店舗。lunchOrDinner でどちらか一方だけを出す。
const shopLunchAndDinner = () =>
  restaurantInfoFixture({
    businessDay: everyDay,
    openTimes: Object.fromEntries(
      ["1", "2", "3", "4", "5", "6", "7"].map((day) => [
        day,
        [
          { start: ELEVEN, end: TWO_PM },
          { start: FIVE_PM, end: NINE_PM },
        ],
      ]),
    ),
    pickUpMinimumCookTime: 25,
    pickUpDaysInAdvance: 3,
  });

const shopOpen11to2 = (over: Partial<RestaurantInfoData> = {}) =>
  restaurantInfoFixture({
    businessDay: everyDay,
    openTimes: sameHoursEveryDay(ELEVEN, TWO_PM),
    pickUpMinimumCookTime: 25,
    pickUpDaysInAdvance: 3,
    ...over,
  });

// 時計は store が持っている。試験では今日の好きな時刻に固定する。
const pickupAt = async <T>(
  nowHour: number,
  read: (pickup: ReturnType<typeof usePickupTime>) => T,
  shopInfo: RestaurantInfoData = shopOpen11to2(),
  exceptData: ExceptData = {},
  menus: { [key: string]: MenuData } = {},
  lunchOrDinner?: string,
  skipToday?: ComputedRef<boolean>,
): Promise<T> => {
  freezeAt(nowHour);
  useGeneralStore().date = new Date();
  // computed なので、値は setup の中で読む。外で読むと i18n が無くて落ちる。
  return runInSetup(() =>
    read(
      usePickupTime(shopInfo, exceptData, ref(menus), lunchOrDinner, skipToday),
    ),
  );
};

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  mock.timers.reset();
});

describe("受け取れる日数", () => {
  it("offers today plus the days the shop accepts in advance", async () => {
    const days = await pickupAt(9, (p) => p.availableDays.value.length);
    assert.strictEqual(days, 4);
  });

  it("follows the shop's setting", async () => {
    assert.strictEqual(
      await pickupAt(
        9,
        (p) => p.availableDays.value.length,
        shopOpen11to2({ pickUpDaysInAdvance: 0 }),
      ),
      1,
    );
    assert.strictEqual(
      await pickupAt(
        9,
        (p) => p.availableDays.value.length,
        shopOpen11to2({ pickUpDaysInAdvance: 7 }),
      ),
      8,
    );
  });

  // 未設定は3日前から。設定が届く前に0日として扱うと、当日しか選べない画面になる。
  it("falls back to three days when the shop has not set it", async () => {
    assert.strictEqual(
      await pickupAt(
        9,
        (p) => p.availableDays.value.length,
        shopOpen11to2({ pickUpDaysInAdvance: undefined }),
      ),
      4,
    );
  });

  // 今日の営業が終わっていれば、今日は選べない。
  it("drops today once the shop has closed", async () => {
    const days = await pickupAt(15, (p) => p.availableDays.value.length);
    assert.strictEqual(days, 3);
  });

  // 「今日は受けない」を呼び出し側が立てられる。注文を確定したあとの画面などで使う。
  it("drops today when the caller says to skip it", async () => {
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.map((d) => d.offset),
      shopOpen11to2(),
      {},
      {},
      undefined,
      computed(() => true),
    );
    assert.deepStrictEqual(days, [1, 2, 3]);
  });

  it("keeps today when the caller says not to skip it", async () => {
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.map((d) => d.offset),
      shopOpen11to2(),
      {},
      {},
      undefined,
      computed(() => false),
    );
    assert.deepStrictEqual(days, [0, 1, 2, 3]);
  });

  it("offers nothing at all while the shop information is still loading", async () => {
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.length,
      shopOpen11to2({ businessDay: undefined }),
    );
    assert.strictEqual(days, 0);
  });
});

describe("受け取れる時刻", () => {
  const timesToday = (nowHour: number, shopInfo?: RestaurantInfoData) =>
    pickupAt(
      nowHour,
      (p) => p.availableDays.value[0].times.map((t) => t.time),
      shopInfo,
    );

  // 調理にかかる時間より前は選べない。10分刻みなので、そこから切り上げた枠が最初。
  it("starts after the time the shop needs to cook", async () => {
    const times = await timesToday(11);
    assert.strictEqual(times[0], ELEVEN + 30);
  });

  it("follows the shop's cooking time", async () => {
    assert.strictEqual(
      (await timesToday(11, shopOpen11to2({ pickUpMinimumCookTime: 5 })))[0],
      ELEVEN + 10,
    );
    assert.strictEqual(
      (await timesToday(11, shopOpen11to2({ pickUpMinimumCookTime: 60 })))[0],
      ELEVEN + 60,
    );
  });

  // 未設定は25分。0分にすると、いま出せない注文を受けてしまう。
  it("falls back to twenty-five minutes when the shop has not set it", async () => {
    assert.strictEqual(
      (
        await timesToday(
          11,
          shopOpen11to2({ pickUpMinimumCookTime: undefined }),
        )
      )[0],
      ELEVEN + 30,
    );
  });

  it("offers every slot from opening when the shop has not opened yet", async () => {
    const times = await timesToday(9);
    assert.strictEqual(times[0], ELEVEN);
    assert.strictEqual(times[times.length - 1], TWO_PM);
  });

  it("stops at closing time", async () => {
    const times = await timesToday(11);
    assert.strictEqual(times[times.length - 1], TWO_PM);
  });

  it("steps in ten-minute intervals", async () => {
    const times = await timesToday(9);
    assert.deepStrictEqual(times.slice(0, 4), [
      ELEVEN,
      ELEVEN + 10,
      ELEVEN + 20,
      ELEVEN + 30,
    ]);
  });

  // 明日以降は今の時刻で削らない。削ると、翌日の朝の枠が消える。
  it("leaves the following days whole", async () => {
    const tomorrow = await pickupAt(13, (p) =>
      p.availableDays.value[1].times.map((t) => t.time),
    );
    assert.strictEqual(tomorrow[0], ELEVEN);
    assert.strictEqual(tomorrow[tomorrow.length - 1], TWO_PM);
  });
});

// 店が今日いつまで受けるか。画面に「本日◯時まで」と出る。
describe("todaysLast", () => {
  it("names the last pickup and the last order before it", async () => {
    const last = await pickupAt(11, (p) => p.todaysLast?.value);
    assert.strictEqual(last?.time, TWO_PM);
    assert.strictEqual(last?.display, "14:00");
    assert.strictEqual(last?.timeStr, "1400");
    assert.strictEqual(last?.lastOrder, TWO_PM - 25);
    assert.strictEqual(last?.lastOrderDisplay, "13:35");
  });

  // 店が締切を早めているときは、そちらが勝つ。
  it("takes the shop's own last-order time when it is earlier", async () => {
    const last = await pickupAt(
      11,
      (p) => p.todaysLast?.value,
      shopOpen11to2({ lastOrderTime: 13 * MINUTES_PER_HOUR }),
    );
    assert.strictEqual(last?.lastOrder, 13 * MINUTES_PER_HOUR);
  });

  it("ignores a shop last-order time that is later than the kitchen allows", async () => {
    const last = await pickupAt(
      11,
      (p) => p.todaysLast?.value,
      shopOpen11to2({ lastOrderTime: 23 * MINUTES_PER_HOUR }),
    );
    assert.strictEqual(last?.lastOrder, TWO_PM - 25);
  });

  it("names nothing once today is over", async () => {
    assert.strictEqual(await pickupAt(15, (p) => p.todaysLast?.value), null);
  });
});

// 休業日。曜日で閉める、日を指定して閉める、の2通り。
describe("休みの日", () => {
  const todayKey = () =>
    String(new Date().getDay() === 0 ? 7 : new Date().getDay());

  it("drops a weekday the shop is closed on", async () => {
    const closedToday = { ...everyDay, [todayKey()]: false };
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.map((d) => d.offset),
      shopOpen11to2({ businessDay: closedToday }),
    );
    assert.ok(!days.includes(0), "閉めている曜日が出ている");
    assert.deepStrictEqual(days, [1, 2, 3]);
  });

  it("drops a date the shop closed temporarily", async () => {
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.map((d) => d.offset),
      shopOpen11to2({ temporaryClosure: [closedOn(midNight(1))] }),
    );
    assert.deepStrictEqual(days, [0, 2, 3]);
  });

  it("lists the dates the shop closed temporarily", async () => {
    const closures = await pickupAt(
      9,
      (p) => p.temporaryClosure.value,
      shopOpen11to2({ temporaryClosure: [closedOn(midNight(1))] }),
    );
    assert.strictEqual(closures.length, 1);
  });
});

// 受け取れない時間帯。店舗ごとの都合で穴を開けられる。
describe("受け取れない時間帯", () => {
  it("removes the slots inside an excepted window", async () => {
    const times = await pickupAt(
      9,
      (p) => p.availableDays.value[0].times.map((t) => t.time),
      shopOpen11to2(),
      { value: { exceptHours: [{ start: ELEVEN + 30, end: ELEVEN + 50 }] } },
    );
    assert.ok(!times.includes(ELEVEN + 30));
    assert.ok(!times.includes(ELEVEN + 40));
    assert.ok(!times.includes(ELEVEN + 50));
    assert.ok(times.includes(ELEVEN + 20));
    assert.ok(times.includes(ELEVEN + 60));
  });

  it("drops a whole weekday the shop excepted", async () => {
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.map((d) => d.offset),
      shopOpen11to2(),
      { value: { exceptDay: { [THURSDAY]: true } } },
    );
    assert.ok(!days.includes(0));
  });
});

// 商品ごとの受け取れない日と時間帯。カートの中身で受取時刻が変わる。
describe("menuPickupData", () => {
  it("says a plain item has no restriction of its own", async () => {
    const data = await pickupAt(
      9,
      (p) => p.menuPickupData.value,
      shopOpen11to2(),
      {},
      { bento: menuFixture({}) },
    );
    assert.strictEqual(data.bento.hasExceptData, false);
    assert.strictEqual(data.bento.hasExceptDay, false);
    assert.strictEqual(data.bento.hasExceptHour, false);
  });

  it("notices an item with its own closed window", async () => {
    const data = await pickupAt(
      9,
      (p) => p.menuPickupData.value,
      shopOpen11to2(),
      {},
      {
        bento: menuFixture({ exceptHour: { start: ELEVEN, end: ELEVEN + 30 } }),
      },
    );
    assert.strictEqual(data.bento.hasExceptHour, true);
    assert.strictEqual(data.bento.hasExceptData, true);
  });

  // 片側だけの時間帯は「設定なし」として扱う。片側で弾くと、開始だけ選んだ途中の
  // 設定で商品が受け取れなくなる。
  it("ignores a half-set window", async () => {
    const data = await pickupAt(
      9,
      (p) => p.menuPickupData.value,
      shopOpen11to2(),
      {},
      { bento: menuFixture({ exceptHour: { start: ELEVEN, end: undefined } }) },
    );
    assert.strictEqual(data.bento.hasExceptHour, false);
  });

  it("lists the days an item can be picked up, minus its own closed days", async () => {
    const todayNumber = String(
      new Date().getDay() === 0 ? 7 : new Date().getDay(),
    );
    const data = await pickupAt(
      9,
      (p) => p.menuPickupData.value,
      shopOpen11to2(),
      {},
      { bento: menuFixture({ exceptDay: { [todayNumber]: true } }) },
    );
    assert.strictEqual(data.bento.hasExceptDay, true);
    assert.ok(!data.bento.menuAvailableDays.includes(todayNumber));
    assert.strictEqual(data.bento.menuAvailableDays.length, 6);
  });

  it("says nothing for a cart with no items", async () => {
    const data = await pickupAt(9, (p) => p.menuPickupData.value);
    assert.deepStrictEqual(data, {});
  });
});

// 昼の部だけ・夜の部だけを出す注文がある。取り違えると、昼の注文に夜の時刻が並ぶ。
describe("昼の部と夜の部", () => {
  const timesFor = (lunchOrDinner?: string) =>
    pickupAt(
      9,
      (p) => p.availableDays.value[0].times.map((t) => t.time),
      shopLunchAndDinner(),
      {},
      {},
      lunchOrDinner,
    );

  it("offers both halves of the day when neither was asked for", async () => {
    const times = await timesFor(undefined);
    assert.ok(times.includes(ELEVEN));
    assert.ok(times.includes(TWO_PM));
    assert.ok(times.includes(FIVE_PM));
    assert.ok(times.includes(NINE_PM));
  });

  it("offers only the lunch half for a lunch order", async () => {
    const times = await timesFor("lunch");
    assert.strictEqual(times[0], ELEVEN);
    assert.strictEqual(times[times.length - 1], TWO_PM);
    assert.ok(!times.includes(FIVE_PM));
  });

  it("offers only the dinner half for a dinner order", async () => {
    const times = await timesFor("dinner");
    assert.strictEqual(times[0], FIVE_PM);
    assert.strictEqual(times[times.length - 1], NINE_PM);
    assert.ok(!times.includes(ELEVEN));
  });

  // 夜の部を置いていない店舗に夜の注文が来たら、時刻は出さない。
  it("offers nothing for a dinner order at a shop with no dinner half", async () => {
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.length,
      shopOpen11to2(),
      {},
      {},
      "dinner",
    );
    assert.strictEqual(days, 0);
  });
});

// 臨時休業は2つの形で届く。Firestore から読んだ直後は Timestamp、画面が日付を足した
// あとや Wrapper が変換したあとは**素の Date**。管理画面の受付停止ページは後者を渡す。
describe("臨時休業の2つの形", () => {
  const offsetsWithClosure = (
    closure: RestaurantInfoData["temporaryClosure"],
  ) =>
    pickupAt(
      9,
      (p) => p.availableDays.value.map((d) => d.offset),
      shopOpen11to2({ temporaryClosure: closure }),
    );

  it("drops the day when the closure arrived as a Firestore timestamp", async () => {
    freezeAt(9);
    assert.deepStrictEqual(
      await offsetsWithClosure([closedOn(midNight(1))]),
      [0, 2, 3],
    );
  });

  // ここを Timestamp 前提にすると、管理画面の受付停止ページで休業日が効かなくなる。
  it("drops the day when the closure arrived as a plain Date", async () => {
    freezeAt(9);
    assert.deepStrictEqual(await offsetsWithClosure([midNight(1)]), [0, 2, 3]);
  });

  it("reads both shapes in one list", async () => {
    freezeAt(9);
    assert.deepStrictEqual(
      await offsetsWithClosure([closedOn(midNight(1)), midNight(2)]),
      [0, 3],
    );
  });
});
