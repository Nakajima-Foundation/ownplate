import { should } from "chai";
// import { expect } from 'chai';

import * as order from "./../src/functions/order";
import * as intent from "./../src/stripe/intent";
// import * as utils from './../src/lib/utils'

// import * as constant from './../src/common/constant';
import * as test_db_helper from "./test_db_helper";
import * as test_helper from "./test_helper";

// import moment from 'moment-timezone';

import { Context } from "../src/models/TestType";

should();

describe("Order function", () => {
  it("Order function, orderCounter test", async function () {
    const adminDB = await test_db_helper.adminDB();

    const uid = "123";

    const restaurantId = "testbar1";
    await test_helper.createRestaurantData(adminDB, restaurantId);

    let index = 0;
    const makeOrder = async (data) => {
      const orderId = "hoge" + String(index);

      await test_helper.createOrder(adminDB, restaurantId, orderId, data, order.wasOrderCreated);
      const newOrderData = (await adminDB.doc(`restaurants/${restaurantId}/orders/${orderId}`).get()).data() || {};
      newOrderData["orderId"] = orderId;
      index++;
      return newOrderData;
    };

    const newOrderData12 = await makeOrder({
      hoge1: 10,
      hoge2: [10, 5],
    });

    const { orderId } = newOrderData12;
    const context = {
      auth: { uid, token: { phone_number: "xxxx" } },
    } as Context;
    const placed = await order.place(
      adminDB,
      {
        restaurantId,
        orderId,
        timeToPickup: { seconds: 1613986197, nanoseconds: 0 },
        tip: 100,
      },
      context
    );
    console.log(JSON.stringify(placed, undefined, 4));

    const ownerUid = "121212";
    const ownerContext = {
      auth: { uid: ownerUid, token: { phone_number: "xxxx" } },
    } as Context;
    const change = await intent.orderChange(
      adminDB,
      {
        restaurantId,
        orderId,
        timezone: "Asia/Tokyo",
        newOrder: [
          { menuId: "hoge1", index: 0 },
          { menuId: "hoge2", index: 1 },
        ],
      },
      ownerContext
    );
    console.log(change);
  });
});
