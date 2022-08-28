import { should } from "chai";

import * as validator from "../src/lib/validator";

should();

describe("validator function", () => {
  it("validator function", async function () {
    const data = {
      restaurantId: "123123",
      orderId: "aaabb",
      status: 256,
      timezone: "Asia/Tokyo",
      // lng?: string;
      //timeEstimated?: admin.firestore.Timestamp;
    }
    const res = validator.validateOrderUpadte(data);
    res.result.should.equal(true);
  });
});
