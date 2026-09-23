import { describe, it } from "node:test";
import assert from "node:assert";

import {
  num2simpleTime,
  num2simpleFormatedTime,
  num2time,
} from "../../src/utils/utils.ts";
import { runInLocale } from "../helpers/vueSetup.ts";

// 営業時間は「0時からの分数」で持っている。店舗ページの営業時間、受取時刻の候補、
// 管理画面の入力欄が、どれもこの3つのどれかで文字にしている。
const NINE_AM = 9 * 60;
const NOON = 12 * 60;
const MIDNIGHT_NEXT_DAY = 24 * 60;

describe("num2simpleTime", () => {
  it("writes the time with no separator, padded to four digits", () => {
    assert.strictEqual(num2simpleTime(NINE_AM), "0900");
    assert.strictEqual(num2simpleTime(0), "0000");
    assert.strictEqual(num2simpleTime(NOON), "1200");
  });

  it("pads both the hour and the minute", () => {
    assert.strictEqual(num2simpleTime(5), "0005");
    assert.strictEqual(num2simpleTime(65), "0105");
    assert.strictEqual(num2simpleTime(600), "1000");
  });

  it("keeps counting past midnight rather than wrapping", () => {
    assert.strictEqual(num2simpleTime(MIDNIGHT_NEXT_DAY), "2400");
    assert.strictEqual(num2simpleTime(23 * 60 + 59), "2359");
  });
});

describe("num2simpleFormatedTime", () => {
  it("writes the same time with a colon", () => {
    assert.strictEqual(num2simpleFormatedTime(NINE_AM), "09:00");
    assert.strictEqual(num2simpleFormatedTime(0), "00:00");
    assert.strictEqual(num2simpleFormatedTime(23 * 60 + 59), "23:59");
  });
});

// 日本語は「午後0時30分」、英語は "12:30 PM"。同じ時刻の呼び方が言語で違うので、
// 12時台の扱いだけ分かれている。片方に合わせると、もう片方が1時間ずれて見える。
describe("num2time — 日本語", () => {
  const ja = (num: number) => runInLocale("ja", () => num2time(num));

  it("names midnight and noon rather than writing 00:00 and 12:00", async () => {
    assert.strictEqual(await ja(0), "深夜 00:00");
    assert.strictEqual(await ja(NOON), "正午 12:00");
  });

  it("calls the end of the day midnight too", async () => {
    assert.strictEqual(await ja(MIDNIGHT_NEXT_DAY), "深夜 00:00");
  });

  it("writes the morning as 午前", async () => {
    assert.strictEqual(await ja(NINE_AM), "午前 09:00");
    assert.strictEqual(await ja(30), "午前 00:30");
  });

  it("writes the afternoon as 午後, counting from zero", async () => {
    assert.strictEqual(await ja(NOON + 1), "午後 00:01");
    assert.strictEqual(await ja(13 * 60), "午後 01:00");
    assert.strictEqual(await ja(23 * 60 + 59), "午後 11:59");
  });

  // 11:59 は午前、12:01 は午後。境目を跨ぐと半日ずれる。
  it("turns over at noon", async () => {
    assert.strictEqual(await ja(NOON - 1), "午前 11:59");
    assert.strictEqual(await ja(NOON + 1), "午後 00:01");
  });
});

describe("num2time — 英語", () => {
  const en = (num: number) => runInLocale("en", () => num2time(num));

  it("names midnight and noon", async () => {
    assert.strictEqual(await en(0), "12:00 midnight");
    assert.strictEqual(await en(NOON), "12:00 noon");
    assert.strictEqual(await en(MIDNIGHT_NEXT_DAY), "12:00 midnight");
  });

  it("writes the morning as AM", async () => {
    assert.strictEqual(await en(NINE_AM), "09:00 AM");
  });

  // 12時台は 12:xx PM のまま。日本語のように 0時台へ送ると "00:30 PM" になる。
  it("keeps the noon hour as 12 PM", async () => {
    assert.strictEqual(await en(NOON + 1), "12:01 PM");
    assert.strictEqual(await en(NOON + 30), "12:30 PM");
  });

  it("writes one o'clock onwards as 01:00 PM", async () => {
    assert.strictEqual(await en(13 * 60), "01:00 PM");
    assert.strictEqual(await en(23 * 60 + 59), "11:59 PM");
  });
});
