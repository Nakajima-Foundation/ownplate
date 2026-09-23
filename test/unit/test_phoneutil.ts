import { describe, it } from "node:test";
import assert from "node:assert";
import {
  formatNational,
  formatURL,
  internationalFormat,
  parsePhoneNumber,
} from "../../src/utils/phoneutil.ts";

// 整形の規則そのものは functions/tests/unit/phoneutil_test.ts が覆っている（同じファイルの
// コピーを CommonJS 側から読んでいる）。ここで見るのは、あちらが見られないこと —
// root は "type": "module" なので、CommonJS の google-libphonenumber から名前付きで
// import すると node が読めずに落ちる。既定 import からほどいた値が本当に束縛されているか。

const JP_MOBILE = "+819012345678";

describe("ESM として読めること", () => {
  it("exposes every helper as a function, so the module really loaded", () => {
    [parsePhoneNumber, internationalFormat, formatNational, formatURL].forEach(
      (fn) => assert.strictEqual(typeof fn, "function"),
    );
  });

  // PhoneNumberFormat を取り違えると、どの整形も同じ結果に潰れる。国内表記と国際表記が
  // 違うことを見れば、定数が別々に束縛されていると言える。
  it("binds the format constants to different formats, not to one collapsed value", () => {
    const parsed = parsePhoneNumber(JP_MOBILE);
    const national = formatNational(parsed);
    const international = internationalFormat(parsed);
    assert.notStrictEqual(national, international);
    assert.strictEqual(national, "090-1234-5678");
    assert.strictEqual(international, "+81 90-1234-5678");
  });

  it("parses through PhoneNumberUtil, so that binding is live too", () => {
    assert.strictEqual(
      formatURL(parsePhoneNumber(JP_MOBILE)),
      "tel:09012345678",
    );
    assert.throws(() => parsePhoneNumber("abc"));
  });
});
