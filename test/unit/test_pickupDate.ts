import { describe, it } from "node:test";
import assert from "node:assert";
import { pickupDateOf } from "../../src/utils/pickupDate.ts";

// 受取日（その日の 0 時）と、0 時からの分数で選ばれた受取時刻から、注文に送る受取日時を作る。
const SEPTEMBER = 8;
const pickupDay = () => new Date(2026, SEPTEMBER, 27);
const MIDNIGHT_SLOT = 24 * 60; // 営業時間の終わりに「12:00 AM」を選ぶと出る「深夜 0:00」の枠

describe("pickupDateOf", () => {
  it("sets the chosen time on the pickup day", () => {
    assert.deepStrictEqual(
      pickupDateOf(pickupDay(), 11 * 60 + 30),
      new Date(2026, SEPTEMBER, 27, 11, 30),
    );
    assert.deepStrictEqual(pickupDateOf(pickupDay(), 0), pickupDay());
  });

  it("rolls the midnight slot over to the next day", () => {
    assert.deepStrictEqual(
      pickupDateOf(pickupDay(), MIDNIGHT_SLOT),
      new Date(2026, SEPTEMBER, 28, 0, 0),
    );
  });

  // 受取日の Date は画面の一覧が持っていて使い回される。書き換えると、確定をやり直したときに
  // 翌日を起点に計算してしまい、深夜 0:00 の枠では受取日が1日ずつずれていく。
  it("leaves the pickup day untouched", () => {
    const day = pickupDay();
    pickupDateOf(day, MIDNIGHT_SLOT);
    assert.deepStrictEqual(day, pickupDay());
  });

  it("gives the same answer when an order is submitted again", () => {
    const day = pickupDay();
    // 値で取り出す。Date のまま比べると、同じオブジェクトを返す実装でも等しくなってしまう。
    const first = pickupDateOf(day, MIDNIGHT_SLOT).getTime();
    const second = pickupDateOf(day, MIDNIGHT_SLOT).getTime();
    assert.strictEqual(second, first);
  });
});
