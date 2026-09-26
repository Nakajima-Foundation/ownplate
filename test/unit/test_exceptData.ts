import { describe, it } from "node:test";
import assert from "node:assert";

import { exceptDataOf } from "../../src/utils/exceptData.ts";
import { menuFixture } from "../fixtures/menu.ts";
import type { MenuData } from "../../src/models/menu.ts";

// 注文画面の受取時刻の選択肢から外す曜日・時間帯。注文の写し（menuItems）から集める。
// ここが漏れると、店が用意できない商品を用意できない日時に受け取る注文が通る。
//
// TimeToPickup.vue からの呼び出し自体はここでは試験していない（部品を組み立てる仕組みが無い）。

const itemsOf = (...menus: Partial<MenuData>[]) =>
  Object.fromEntries(
    menus.map((menu, index) => [`m${index}`, menuFixture(menu)]),
  );

describe("exceptDataOf", () => {
  it("excludes nothing when no item has a restriction", () => {
    assert.deepStrictEqual(exceptDataOf(itemsOf({}, {})), {
      exceptDay: {},
      exceptHours: [],
    });
  });

  it("takes the days an item cannot be picked up", () => {
    assert.deepStrictEqual(
      exceptDataOf(itemsOf({ exceptDay: { "1": true, "3": true } })).exceptDay,
      { "1": true, "3": true },
    );
  });

  // 管理画面で一度付けて外した曜日は false で残っている。それは除外しない。
  it("does not exclude a day that is stored as false", () => {
    assert.deepStrictEqual(
      exceptDataOf(itemsOf({ exceptDay: { "1": false, "2": true } })).exceptDay,
      { "2": true },
    );
  });

  // 1 品でも受け取れない曜日は、注文全体で受け取れない。
  it("excludes a day if any one item excludes it", () => {
    assert.deepStrictEqual(
      exceptDataOf(
        itemsOf(
          { exceptDay: { "1": true } },
          { exceptDay: { "1": false, "5": true } },
          {},
        ),
      ).exceptDay,
      { "1": true, "5": true },
    );
  });

  it("takes an item's excluded hours when both ends are set", () => {
    assert.deepStrictEqual(
      exceptDataOf(itemsOf({ exceptHour: { start: 600, end: 720 } }))
        .exceptHours,
      [{ start: 600, end: 720 }],
    );
  });

  // 0 時（0 分）は正しい時刻。「未設定」と取り違えて落とさない。
  it("keeps hours that start or end at midnight", () => {
    assert.deepStrictEqual(
      exceptDataOf(itemsOf({ exceptHour: { start: 0, end: 0 } })).exceptHours,
      [{ start: 0, end: 0 }],
    );
  });

  it("ignores hours with only one end set", () => {
    assert.deepStrictEqual(
      exceptDataOf(
        itemsOf({ exceptHour: { start: 600 } }, { exceptHour: { end: 720 } }),
      ).exceptHours,
      [],
    );
  });

  it("ignores hours stored as null", () => {
    const noHour: MenuData = JSON.parse('{"exceptHour": null}');
    const nullStart: MenuData = JSON.parse(
      '{"exceptHour": {"start": null, "end": 720}}',
    );
    const nullEnd: MenuData = JSON.parse(
      '{"exceptHour": {"start": 600, "end": null}}',
    );
    assert.deepStrictEqual(
      exceptDataOf({ a: noHour, b: nullStart, c: nullEnd }),
      { exceptDay: {}, exceptHours: [] },
    );
  });

  // 重なる時間帯もまとめずに並べる。選択肢から外す側は「どれかに入れば外す」で読む。
  it("lists every item's hours in order without merging them", () => {
    assert.deepStrictEqual(
      exceptDataOf(
        itemsOf(
          { exceptHour: { start: 600, end: 720 } },
          { exceptHour: { start: 660, end: 780 } },
          { exceptHour: { start: 600, end: 720 } },
        ),
      ).exceptHours,
      [
        { start: 600, end: 720 },
        { start: 660, end: 780 },
        { start: 600, end: 720 },
      ],
    );
  });

  // 注文を作ってから orderCreated が写しを書くまでの間は、写しが無い。
  it("excludes nothing when the order has no copy of the menu yet", () => {
    const empty = { exceptDay: {}, exceptHours: [] };
    assert.deepStrictEqual(exceptDataOf(undefined), empty);
    assert.deepStrictEqual(exceptDataOf(JSON.parse("null")), empty);
    assert.deepStrictEqual(exceptDataOf({}), empty);
  });

  it("returns a new result each time rather than sharing one", () => {
    const menuItems = itemsOf({ exceptDay: { "1": true } });
    const first = exceptDataOf(menuItems);
    first.exceptDay["2"] = true;
    assert.deepStrictEqual(exceptDataOf(menuItems).exceptDay, { "1": true });
  });

  // どの品の組み合わせでも、どれかの品が true にした曜日はすべて入り、それ以外は入らない。
  it("excludes exactly the days some item marks true", () => {
    const dayFlags: { [key: string]: boolean }[] = [
      {},
      { "0": true },
      { "0": false, "6": true },
      { "3": true, "4": false },
    ];
    dayFlags.forEach((a) =>
      dayFlags.forEach((b) => {
        const expected = Object.keys({ ...a, ...b })
          .filter((day) => a[day] || b[day])
          .sort();
        const actual = Object.keys(
          exceptDataOf(itemsOf({ exceptDay: a }, { exceptDay: b })).exceptDay,
        ).sort();
        assert.deepStrictEqual(actual, expected, JSON.stringify({ a, b }));
      }),
    );
  });
});
