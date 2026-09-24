import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";

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
// 日付の境目は実行環境の時間帯で決まる（`midNight()` がローカルの0時を返す）。
// そのため時刻は**今日の0時からの分数**で組み立てる。そうすれば日本でも UTC の CI でも
// 同じ答えになる。
const MINUTES_PER_HOUR = 60;
const at = (hour: number, minute = 0) => {
  const date = midNight();
  date.setMinutes(hour * MINUTES_PER_HOUR + minute);
  return date;
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
  skipToday?: { value: boolean },
): Promise<T> => {
  useGeneralStore().date = at(nowHour);
  // computed なので、値は setup の中で読む。外で読むと i18n が無くて落ちる。
  return runInSetup(() =>
    read(
      usePickupTime(
        shopInfo,
        exceptData,
        ref(menus),
        lunchOrDinner,
        skipToday as never,
      ),
    ),
  );
};

beforeEach(() => {
  setActivePinia(createPinia());
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
    const todayNumber = new Date().getDay() === 0 ? 7 : new Date().getDay();
    const days = await pickupAt(
      9,
      (p) => p.availableDays.value.map((d) => d.offset),
      shopOpen11to2(),
      { value: { exceptDay: { [String(todayNumber)]: true } } },
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
