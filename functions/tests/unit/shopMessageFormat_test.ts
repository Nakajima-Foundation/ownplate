import { describe, it } from "node:test";
import assert from "node:assert";

import {
  SHOP_MESSAGE_COLLECTION,
  shopMessageId,
  shopMessageRecord,
} from "../../src/functions/notify/shopMessageFormat";

describe("shopMessageId", () => {
  it("is made from the order and the kind", () => {
    assert.strictEqual(
      shopMessageId("order1", "msg_order_placed"),
      "order1-msg_order_placed",
    );
  });

  // 同じ通知が二度走っても行が増えないこと。増えると timeline に同じものが並ぶ。
  it("is the same for the same notification", () => {
    assert.strictEqual(
      shopMessageId("order1", "msg_order_placed"),
      shopMessageId("order1", "msg_order_placed"),
    );
  });

  it("separates the two kinds for one order", () => {
    assert.notStrictEqual(
      shopMessageId("order1", "msg_order_placed"),
      shopMessageId("order1", "msg_order_canceled_by_user"),
    );
  });

  it("separates two orders", () => {
    assert.notStrictEqual(
      shopMessageId("order1", "msg_order_placed"),
      shopMessageId("order2", "msg_order_placed"),
    );
  });
});

describe("shopMessageRecord", () => {
  const made = shopMessageRecord({
    text: "新しい注文 #12 試験食堂",
    messageId: "msg_order_placed",
    orderId: "order1",
    orderNumber: 12,
    restaurantId: "rest1",
  });

  it("keeps the text exactly as it was sent", () => {
    assert.strictEqual(made.text, "新しい注文 #12 試験食堂");
  });

  it("points at the order in the admin screen", () => {
    assert.strictEqual(made.path, "/admin/restaurants/rest1/orders/order1");
  });

  it("carries the kind, the order and the number", () => {
    assert.strictEqual(made.messageId, "msg_order_placed");
    assert.strictEqual(made.orderId, "order1");
    assert.strictEqual(made.orderNumber, 12);
  });

  // 親のパスと重複するが、collectionGroup のクエリは親で絞れない。
  it("carries the restaurant id", () => {
    assert.strictEqual(made.restaurantId, "rest1");
  });

  // 届いたかはここに持たない。Web Push のログの仕事。
  it("says nothing about delivery", () => {
    const keys = Object.keys(made).sort();
    assert.deepStrictEqual(keys, [
      "messageId",
      "orderId",
      "orderNumber",
      "path",
      "restaurantId",
      "text",
    ]);
  });
});

describe("SHOP_MESSAGE_COLLECTION", () => {
  // 画面と規則が同じ名前を見ていること。ここがずれると読めない。
  it("is the collection the rules and the screen use", () => {
    assert.strictEqual(SHOP_MESSAGE_COLLECTION, "messages");
  });
});
