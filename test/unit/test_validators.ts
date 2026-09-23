import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getSoundIndex,
  resizedProfileImage,
  validLocation,
  validPlaceId,
  validUrl,
} from "../../src/utils/utils.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// 店舗が自分で入力する値の検証。通してしまうと、客の画面にそのまま出る。
describe("validUrl", () => {
  it("accepts an ordinary http or https address", () => {
    assert.strictEqual(validUrl("https://example.com"), true);
    assert.strictEqual(validUrl("http://example.com/menu?a=1"), true);
  });

  // 仕組みを必須にしている。省略を許すと、リンク先が相対として解釈される。
  it("refuses an address with no scheme", () => {
    assert.strictEqual(validUrl("example.com"), false);
    assert.strictEqual(validUrl("//example.com"), false);
  });

  // ここを緩めると、店舗の入力欄から script を仕込める。
  it("refuses a scheme that is not http or https", () => {
    assert.strictEqual(validUrl("javascript:alert(1)"), false);
    assert.strictEqual(validUrl("data:text/html,<script>"), false);
    assert.strictEqual(validUrl("ftp://example.com"), false);
  });

  it("refuses nothing at all", () => {
    assert.strictEqual(validUrl(""), false);
  });
});

// 配達の範囲や地図に使う座標。
describe("validLocation", () => {
  it("accepts a location in Japan", () => {
    assert.strictEqual(validLocation({ lat: 35.6812, lng: 139.7671 }), true);
  });

  it("refuses a location that is out of range", () => {
    assert.strictEqual(validLocation({ lat: 999, lng: 999 }), false);
  });

  it("refuses a location with nothing in it", () => {
    assert.strictEqual(validLocation({}), false);
    assert.strictEqual(validLocation({ lat: 35.6812 }), false);
    assert.strictEqual(validLocation({ lng: 139.7671 }), false);
  });

  // 0 は `location.lat || ""` で空文字になるので弾かれる。赤道上・本初子午線上の座標は
  // 通らない。日本向けの店舗では届かないので直していないが、そうなっていることは留める。
  it("refuses zero, because the implementation reads it as missing", () => {
    assert.strictEqual(validLocation({ lat: 0, lng: 139.7671 }), false);
    assert.strictEqual(validLocation({ lat: 35.6812, lng: 0 }), false);
    assert.strictEqual(validLocation({ lat: 0, lng: 0 }), false);
  });
});

// Google の場所 ID。URL に埋め込むので、余計な文字が混ざると壊れる。
describe("validPlaceId", () => {
  it("accepts the shape Google issues", () => {
    assert.strictEqual(validPlaceId("ChIJ-abc_123"), true);
    assert.strictEqual(validPlaceId("ChIJN1t_tDeuEmsRUsoyG83frY4"), true);
  });

  // 未設定を通す。必須にすると、場所 ID を持たない店舗が保存できなくなる。
  it("accepts an empty value", () => {
    assert.strictEqual(validPlaceId(""), true);
  });

  it("refuses anything with a character outside the set", () => {
    assert.strictEqual(validPlaceId("a b"), false);
    assert.strictEqual(validPlaceId("a/b"), false);
    assert.strictEqual(validPlaceId("a.b"), false);
    assert.strictEqual(validPlaceId("<script>"), false);
  });
});

// 新しい注文が入ったときに鳴らす音の選択。
describe("getSoundIndex", () => {
  // 未設定や知らない名前でも落ちず、先頭の音に落ちる。鳴らないほうが困る。
  it("falls back to the first sound when the name is unknown or missing", () => {
    assert.strictEqual(getSoundIndex(""), 0);
    assert.strictEqual(getSoundIndex("no-such-sound"), 0);
  });

  it("always gives back a usable index", () => {
    ["", "no-such-sound", "another"].forEach((name) => {
      assert.ok(getSoundIndex(name) >= 0);
    });
  });
});

// 店舗の写真。縮小版があればそれを、無ければ元の写真を使う。
describe("resizedProfileImage", () => {
  it("falls back to the original photo when there is no resized one", () => {
    const shop = restaurantInfoFixture({ restProfilePhoto: "original.jpg" });
    assert.strictEqual(resizedProfileImage(shop, "600"), "original.jpg");
  });

  it("prefers the resized photo of the size asked for", () => {
    const shop = restaurantInfoFixture({
      restProfilePhoto: "original.jpg",
      images: {
        profile: {
          resizedImages: { "600": "small.jpg", "1200": "large.jpg" },
        },
      },
    });
    assert.strictEqual(resizedProfileImage(shop, "600"), "small.jpg");
    assert.strictEqual(resizedProfileImage(shop, "1200"), "large.jpg");
  });

  // 頼んだ大きさが無ければ元に落ちる。落ちないと、画像が出ない。
  it("falls back to the original when that size is missing", () => {
    const shop = restaurantInfoFixture({
      restProfilePhoto: "original.jpg",
      images: {
        profile: {
          resizedImages: { "600": "small.jpg" },
        },
      },
    });
    assert.strictEqual(resizedProfileImage(shop, "9999"), "original.jpg");
  });
});
