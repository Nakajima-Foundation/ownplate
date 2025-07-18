import { expect } from "chai";

import * as validator from "../src/lib/validator";

describe("validator function", () => {
  it("validator function", async function () {
    const data = {
      restaurantId: "123123",
      orderId: "aaabb",
      status: 256,
      timezone: "Asia/Tokyo",
      // lng?: string;
      //timeEstimated?: admin.firestore.Timestamp;
    };
    const res = validator.validateOrderUpdate(data);
    expect(res.result).to.equal(true);
  });

  it("validator function", async function () {
    const url = "http://localhost:3000/callback/line";
    // const url = "http://example.com/callback/line";
    const res = validator.validateUrl(url);
    console.log(res);
  });
});
