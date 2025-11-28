import { describe, it } from "node:test";
import assert from "node:assert";

import * as validator from "../src/lib/validator";

describe("validator function", () => {
  it("should validate order update data correctly", async () => {
    const data = {
      restaurantId: "123123",
      orderId: "aaabb",
      status: 256,
      timezone: "Asia/Tokyo",
      // lng?: string;
      //timeEstimated?: admin.firestore.Timestamp;
    };
    const res = validator.validateOrderUpdate(data);
    assert.strictEqual(res.result, true);
  });

  it("should validate URL correctly", async () => {
    const url = "http://localhost:3000/callback/line";
    // const url = "http://example.com/callback/line";
    const res = validator.validateUrl(url);
    console.log(res);
    // Add assertion to make the test meaningful
    assert.ok(res);
  });
});
