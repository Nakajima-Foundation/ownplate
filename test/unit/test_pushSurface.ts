import { describe, it } from "node:test";
import assert from "node:assert";

import { isPushSurface } from "../../src/utils/pushSurface.ts";

describe("isPushSurface", () => {
  // 店舗側。wrapper の中も外も区別しない。外にある画面を忘れたのが元の不具合。
  it("covers the shop side, wrapper or not", () => {
    [
      "/admin",
      "/admin/restaurants/abc",
      "/admin/restaurants/abc/orders",
      "/admin/news",
      "/admin/faq",
      "/admin/docs/features",
      "/admin/user/signin",
      "/admin/subaccounts",
    ].forEach((path) => assert.strictEqual(isPushSurface(path), true, path));
  });

  // 端末の画面。PWA の start_url がここなので、厨房の端末は毎回ここに着く。
  it("covers the registered device screen", () => {
    assert.strictEqual(isPushSurface("/pushdevice/sometoken"), true);
  });

  // 客側は外す。受け取る登録が無く、束に FCM を持ち込む理由も無い。
  it("leaves the customer side out", () => {
    [
      "/",
      "/r/shop",
      "/r/shop/order/1",
      "/u/history",
      "/u/profile",
      "/liff/1",
      "/m/ask",
    ].forEach((path) => assert.strictEqual(isPushSurface(path), false, path));
  });

  // 前方一致そのままだと拾ってしまう形
  it("does not match a path that merely starts with the same letters", () => {
    ["/administrator", "/adminish", "/pushdevices"].forEach((path) =>
      assert.strictEqual(isPushSurface(path), false, path),
    );
  });
});
