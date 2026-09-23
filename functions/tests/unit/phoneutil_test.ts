import { describe, it } from "node:test";
import assert from "node:assert";

import { parsePhoneNumber, internationalFormat, formatNational, formatURL } from "../../src/common/phoneutil";

const JP_MOBILE = "+818012345678";
const JP_LANDLINE = "+81312345678";
const US_NUMBER = "+12125551234";

describe("parsePhoneNumber", () => {
  it("requires the country code", () => {
    assert.throws(() => parsePhoneNumber("08012345678"));
  });

  it("rejects something that is not a phone number", () => {
    assert.throws(() => parsePhoneNumber("abc"));
  });
});

describe("formatNational", () => {
  it("writes a Japanese number the way people in Japan write it", () => {
    assert.strictEqual(formatNational(parsePhoneNumber(JP_MOBILE)), "080-1234-5678");
    assert.strictEqual(formatNational(parsePhoneNumber(JP_LANDLINE)), "03-1234-5678");
  });

  it("writes a US number the way people in the US write it", () => {
    assert.strictEqual(formatNational(parsePhoneNumber(US_NUMBER)), "(212) 555-1234");
  });
});

describe("internationalFormat", () => {
  it("keeps the country code", () => {
    assert.strictEqual(internationalFormat(parsePhoneNumber(JP_MOBILE)), "+81 80-1234-5678");
    assert.strictEqual(internationalFormat(parsePhoneNumber(US_NUMBER)), "+1 212-555-1234");
  });
});

// 発信用。日本の番号だけ先頭に 0 が要る。落とすと繋がらない番号になる。
describe("formatURL", () => {
  it("puts back the leading zero a Japanese number is dialled with", () => {
    assert.strictEqual(formatURL(parsePhoneNumber(JP_MOBILE)), "tel:08012345678");
    assert.strictEqual(formatURL(parsePhoneNumber(JP_LANDLINE)), "tel:0312345678");
  });

  it("adds no leading zero outside Japan", () => {
    assert.strictEqual(formatURL(parsePhoneNumber(US_NUMBER)), "tel:2125551234");
  });
});
