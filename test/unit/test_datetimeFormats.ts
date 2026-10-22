import { describe, it } from "node:test";
import assert from "node:assert";

import i18n from "../../src/lib/vue-i18n.ts";
import { shopTime } from "../helpers/shopTime.ts";

// 画面の日時（$d / d の short・time・long）は、端末のタイムゾーンによらず店の時刻（JST）で出す。
// 日本時間 2026-09-28 1:30 は、UTC では 9/27 16:30、ロサンゼルスでは 9/27 9:30。

const JST_EARLY_MORNING = shopTime(2026, 9, 28, 1, 30);
const d = (key: string) => i18n.global.d(JST_EARLY_MORNING, key, "en");

describe("datetime formats", () => {
  it("writes the JST date in the short format", () => {
    assert.match(d("short"), /Sep 28, 2026/);
  });

  it("writes the JST time in the time format", () => {
    assert.match(d("time"), /^1:30\sAM$/);
  });

  it("writes the JST date and time in the long format", () => {
    assert.match(d("long"), /Sep 28, 2026/);
    assert.match(d("long"), /1:30\sAM/);
  });

  it("uses JST in every locale's formats", () => {
    // 日時の書式を持つ言語だけ（持たない言語は fallback の en を使う）。
    const locales = i18n.global.availableLocales.filter(
      (locale) => Object.keys(i18n.global.getDateTimeFormat(locale)).length > 0,
    );
    assert.ok(locales.length > 0);
    locales.forEach((locale) =>
      ["short", "time", "long"].forEach((key) =>
        assert.strictEqual(
          i18n.global.getDateTimeFormat(locale)[key]?.timeZone,
          "Asia/Tokyo",
          `${locale} ${key}`,
        ),
      ),
    );
  });
});
