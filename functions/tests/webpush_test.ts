import { describe, it } from "node:test";
import assert from "node:assert";

import { adminOrderPath, createWebPushPayload, notifyTargetUids } from "../src/functions/notify/webpushFormat";
import { validateRegisterWebPush, validateUnregisterWebPush } from "../src/lib/validator";

const endpoint = "https://fcm.googleapis.com/fcm/send/abcDEF-123_456";
const p256dh = "BLc4xRzKlKORKWlbdgFaBrrPK3ydWAHo4M0gs0i1oEKgPpWC5cW8OCzVrOQRv-1npXRWk8udnW3oYhIO4475rds";
const auth = "5I2Bu2oKdyy9CwL8QVF0NQ";

describe("webPushFormat", () => {
  it("builds the admin order path", () => {
    assert.strictEqual(adminOrderPath("rest1", "order1"), "/admin/restaurants/rest1/orders/order1");
  });

  it("builds a payload the service worker can read", () => {
    const payload = JSON.parse(createWebPushPayload("新しい注文 #12", "テスト店", "rest1", "order1"));
    assert.deepStrictEqual(payload, {
      title: "新しい注文 #12",
      body: "テスト店",
      url: "/admin/restaurants/rest1/orders/order1",
      tag: "order1",
    });
  });

  it("keeps the payload url host-free so the service worker can resolve it", () => {
    const payload = JSON.parse(createWebPushPayload("title", "name", "rest1", "order1"));
    assert.ok(payload.url.startsWith("/"));
  });

  it("truncates long text", () => {
    const payload = JSON.parse(createWebPushPayload("a".repeat(300), "b".repeat(300), "rest1", "order1"));
    assert.strictEqual(payload.title.length, 120);
    assert.ok(payload.title.endsWith("…"));
    assert.strictEqual(payload.body.length, 120);
  });

  it("keeps text at the boundary untouched", () => {
    const payload = JSON.parse(createWebPushPayload("a".repeat(120), "b", "rest1", "order1"));
    assert.strictEqual(payload.title, "a".repeat(120));
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
    const children = [{ uid: "child1", restaurantLists: ["rest2"] }];
    assert.deepStrictEqual(notifyTargetUids("owner1", children, "rest1"), ["owner1"]);
  });
});

describe("web push validator", () => {
  it("accepts a subscription from the browser", () => {
    assert.strictEqual(validateRegisterWebPush({ endpoint, p256dh, auth }).result, true);
  });

  it("accepts base64 keys with padding", () => {
    assert.strictEqual(validateRegisterWebPush({ endpoint, p256dh, auth: auth + "==" }).result, true);
  });

  it("rejects a non-url endpoint", () => {
    assert.strictEqual(validateRegisterWebPush({ endpoint: "not a url", p256dh, auth }).result, false);
  });

  it("rejects a key with invalid characters", () => {
    assert.strictEqual(validateRegisterWebPush({ endpoint, p256dh: "abc$def", auth }).result, false);
  });

  it("rejects an empty key", () => {
    assert.strictEqual(validateRegisterWebPush({ endpoint, p256dh: "", auth }).result, false);
  });

  it("accepts and rejects unregister data", () => {
    assert.strictEqual(validateUnregisterWebPush({ endpoint }).result, true);
    assert.strictEqual(validateUnregisterWebPush({ endpoint: "" }).result, false);
  });
});
