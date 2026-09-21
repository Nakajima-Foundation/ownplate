import { describe, it } from "node:test";
import assert from "node:assert";

import {
  INVALID_TARGET_CODES,
  MULTICAST_LIMIT,
  adminOrderPath,
  asPlatform,
  chunk,
  createOrderPushData,
  createWebPushData,
  detectPlatform,
  notifyTargetUids,
} from "../src/functions/notify/webpushFormat";
import { validateRegisterWebPush, validateUnregisterWebPush } from "../src/lib/validator";

// Firebase Installation ID は base64url 相当の固定長文字列
const fid = "dGVzdEZpZFZhbHVlMDAx";

describe("webPushFormat", () => {
  it("builds the admin order path", () => {
    assert.strictEqual(adminOrderPath("rest1", "order1"), "/admin/restaurants/rest1/orders/order1");
  });

  it("builds a data-only payload the service worker can read", () => {
    assert.deepStrictEqual(createOrderPushData("新しい注文 #12", "テスト店", "rest1", "order1"), {
      title: "新しい注文 #12",
      body: "テスト店",
      url: "/admin/restaurants/rest1/orders/order1",
      tag: "order1",
    });
  });

  it("keeps the url host-free so the service worker can resolve it", () => {
    assert.ok(createOrderPushData("t", "n", "rest1", "order1").url.startsWith("/"));
  });

  it("uses the order id as the tag so repeats replace rather than stack", () => {
    assert.strictEqual(createOrderPushData("t", "n", "rest1", "order9").tag, "order9");
  });

  it("truncates long title and body", () => {
    const data = createWebPushData("a".repeat(300), "b".repeat(500), "/x", "tag");
    assert.strictEqual(data.title.length, 100);
    assert.ok(data.title.endsWith("…"));
    assert.strictEqual(data.body.length, 300);
  });

  it("keeps text at the boundary untouched", () => {
    const data = createWebPushData("a".repeat(100), "b".repeat(300), "/x", "tag");
    assert.strictEqual(data.title, "a".repeat(100));
    assert.strictEqual(data.body, "b".repeat(300));
  });

  it("emits only string values, as FCM data requires", () => {
    Object.values(createOrderPushData("t", "n", "r", "o")).forEach((value) => {
      assert.strictEqual(typeof value, "string");
    });
  });
});

describe("detectPlatform", () => {
  it("classifies the platforms the device list shows", () => {
    assert.strictEqual(detectPlatform("iPhone; CPU iPhone OS 17_4"), "ios");
    assert.strictEqual(detectPlatform("Linux; Android 14"), "android");
    assert.strictEqual(detectPlatform("Macintosh"), "other");
  });
});

describe("asPlatform", () => {
  it("maps anything unexpected to other", () => {
    assert.strictEqual(asPlatform("ios"), "ios");
    [undefined, null, 7, "windows"].forEach((value) => {
      assert.strictEqual(asPlatform(value), "other");
    });
  });
});

describe("notifyTargetUids", () => {
  it("returns the owner when there is no sub account", () => {
    assert.deepStrictEqual(notifyTargetUids("owner1", [], "rest1"), ["owner1"]);
  });

  it("includes sub accounts assigned to the restaurant", () => {
    const children = [
      { uid: "child1", restaurantLists: ["rest1", "rest2"] },
      { uid: "child2", restaurantLists: ["rest2"] },
      { uid: "child3", restaurantLists: [] },
    ];
    assert.deepStrictEqual(notifyTargetUids("owner1", children, "rest1"), ["owner1", "child1"]);
  });

  it("returns only the owner when no sub account is assigned", () => {
    assert.deepStrictEqual(notifyTargetUids("owner1", [{ uid: "child1", restaurantLists: ["rest2"] }], "rest1"), ["owner1"]);
  });
});

describe("chunk", () => {
  it("splits at the multicast limit", () => {
    const fids = Array.from({ length: MULTICAST_LIMIT + 1 }, (_unused, i) => `fid${i}`);
    const batches = chunk(fids, MULTICAST_LIMIT);
    assert.strictEqual(batches.length, 2);
    assert.strictEqual(batches[0].length, MULTICAST_LIMIT);
    assert.strictEqual(batches[1].length, 1);
  });

  it("returns no batch for an empty list", () => {
    assert.deepStrictEqual(chunk([], MULTICAST_LIMIT), []);
  });

  it("loses nothing", () => {
    const items = ["a", "b", "c", "d", "e"];
    assert.deepStrictEqual(chunk(items, 2).flat(), items);
  });
});

describe("INVALID_TARGET_CODES", () => {
  it("covers the codes that mean the target itself is dead", () => {
    assert.ok(INVALID_TARGET_CODES.includes("messaging/installation-id-not-registered"));
    assert.ok(INVALID_TARGET_CODES.includes("messaging/registration-token-not-registered"));
  });

  // invalid-argument はペイロード不正でも返る。prune の根拠にすると
  // 生きている端末の登録まで消してしまう。
  it("excludes invalid-argument so healthy fids are never pruned", () => {
    assert.ok(!INVALID_TARGET_CODES.includes("messaging/invalid-argument"));
  });
});

describe("web push validator", () => {
  it("accepts a registration from the browser", () => {
    assert.strictEqual(validateRegisterWebPush({ fid, platform: "ios" }).result, true);
  });

  it("rejects a fid with invalid characters", () => {
    assert.strictEqual(validateRegisterWebPush({ fid: "abc$def", platform: "ios" }).result, false);
  });

  it("rejects an empty fid", () => {
    assert.strictEqual(validateRegisterWebPush({ fid: "", platform: "ios" }).result, false);
    assert.strictEqual(validateUnregisterWebPush({ fid: "" }).result, false);
  });

  it("rejects a non-alphabetic platform", () => {
    assert.strictEqual(validateRegisterWebPush({ fid, platform: "ios9" }).result, false);
  });

  it("accepts unregister data carrying only the fid", () => {
    assert.strictEqual(validateUnregisterWebPush({ fid }).result, true);
  });
});
