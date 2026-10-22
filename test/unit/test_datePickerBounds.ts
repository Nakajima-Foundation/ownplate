import { describe, it } from "node:test";
import assert from "node:assert";
import {
  isDateDisabled,
  isDateOutOfRange,
  isPrevMonthOutOfRange,
  isNextMonthOutOfRange,
} from "../../src/utils/datePickerBounds.ts";

// 臨時休業日の選択範囲。2020 年の Buefy 版は min-date（前日）と
// max-date（6か月後）で挟んでいた。手書きへ移したとき上限が落ちていたので、
// 上限が効くことをここで押さえる。
// 判定は moment の「日」比較で、実行環境のローカル時刻で行われる。
// オフセット付きの文字列で作ると UTC の走者では1日ずれるので、ローカルの深夜で組む。
const day = (iso: string) => {
  const [year, month, date] = iso.split("-").map(Number);
  return new Date(year, month - 1, date);
};
const now = day("2026-09-25");
const maxDate = day("2027-03-25"); // 6か月後

describe("選べる日の範囲", () => {
  it("下限は minDate を渡さなければ当日", () => {
    assert.strictEqual(isDateDisabled(day("2026-09-24"), now), true);
    assert.strictEqual(isDateDisabled(day("2026-09-25"), now), false);
  });

  it("minDate を渡すとそちらが下限になる", () => {
    const minDate = day("2026-09-24");
    assert.strictEqual(isDateDisabled(day("2026-09-23"), now, minDate), true);
    assert.strictEqual(isDateDisabled(day("2026-09-24"), now, minDate), false);
  });

  // これが落ちていた。上限が無いと何年先でも臨時休業日にできてしまう。
  it("maxDate の当日は選べ、その翌日は選べない", () => {
    assert.strictEqual(
      isDateDisabled(day("2027-03-25"), now, undefined, maxDate),
      false,
    );
    assert.strictEqual(
      isDateDisabled(day("2027-03-26"), now, undefined, maxDate),
      true,
    );
  });

  it("maxDate を渡さなければ上限は無い", () => {
    assert.strictEqual(isDateDisabled(day("2099-01-01"), now), false);
  });

  // 時刻が入っていても日で比べる。
  it("同じ日なら時刻が違っても境界の内側", () => {
    const lateOnMaxDate = new Date(2027, 2, 25, 23, 59);
    assert.strictEqual(
      isDateDisabled(lateOnMaxDate, now, undefined, maxDate),
      false,
    );
  });
});

describe("月送りの可否", () => {
  it("下限の月より前へは戻れない", () => {
    assert.strictEqual(isPrevMonthOutOfRange(day("2026-09-01"), now), true);
    assert.strictEqual(isPrevMonthOutOfRange(day("2026-10-01"), now), false);
  });

  it("上限の月より先へは進めない", () => {
    assert.strictEqual(
      isNextMonthOutOfRange(day("2027-02-01"), maxDate),
      false,
    );
    assert.strictEqual(isNextMonthOutOfRange(day("2027-03-01"), maxDate), true);
  });

  it("maxDate を渡さなければいくらでも進める", () => {
    assert.strictEqual(isNextMonthOutOfRange(day("2099-01-01")), false);
  });
});

// 割引の有効期間の選択範囲。こちらは下限を暗黙に補わない。
// 渡した範囲の外を**選べてしまう**のが、移植のときに落ちていたところ。
// 終了日を開始日より前にできると、その割引は保存はされるが永久に効かない
// （promotion.ts の判定が termFrom < now < termTo を要求するため）。
describe("期間の選択範囲", () => {
  const from = day("2026-03-01");
  const to = day("2026-06-01");

  it("範囲を渡さなければどの日も選べる", () => {
    assert.strictEqual(isDateOutOfRange(day("1999-01-01")), false);
    assert.strictEqual(isDateOutOfRange(day("2099-01-01")), false);
  });

  // ここが本題。開始日より前の終了日は選べてはいけない。
  it("下限の前日は範囲外、当日は範囲内", () => {
    assert.strictEqual(isDateOutOfRange(day("2026-02-28"), from), true);
    assert.strictEqual(isDateOutOfRange(day("2026-03-01"), from), false);
  });

  it("上限の当日は範囲内、その翌日は範囲外", () => {
    assert.strictEqual(
      isDateOutOfRange(day("2026-06-01"), undefined, to),
      false,
    );
    assert.strictEqual(
      isDateOutOfRange(day("2026-06-02"), undefined, to),
      true,
    );
  });

  it("両側を渡すと挟まれる", () => {
    assert.strictEqual(isDateOutOfRange(day("2026-02-28"), from, to), true);
    assert.strictEqual(isDateOutOfRange(day("2026-04-15"), from, to), false);
    assert.strictEqual(isDateOutOfRange(day("2026-06-02"), from, to), true);
  });

  // DatePicker 側と違い、過去だからという理由では塞がない。
  // 割引は過去に始まっている期間も扱う。
  it("下限を渡さなければ過去も範囲内", () => {
    assert.strictEqual(
      isDateOutOfRange(day("2020-01-01"), undefined, to),
      false,
    );
  });

  it("上下を逆に渡すとどの日も範囲外になる", () => {
    assert.strictEqual(isDateOutOfRange(day("2026-04-15"), to, from), true);
  });

  it("同じ日を上下に渡すとその日だけが範囲内", () => {
    assert.strictEqual(isDateOutOfRange(day("2026-03-01"), from, from), false);
    assert.strictEqual(isDateOutOfRange(day("2026-03-02"), from, from), true);
  });

  it("時刻が入っていても日で比べる", () => {
    assert.strictEqual(
      isDateOutOfRange(new Date(2026, 5, 1, 23, 59), from, to),
      false,
    );
  });
});
