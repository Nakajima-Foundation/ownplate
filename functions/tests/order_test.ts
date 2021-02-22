import { should } from 'chai';
import { expect } from 'chai';

import * as order from './../src/functions/order'
import * as utils from './../src/lib/utils'

import * as constant from './../src/common/constant';
import * as test_db_helper from './test_db_helper';
import * as test_helper from './test_helper';

import moment from 'moment-timezone';

import { Context } from '../src/models/TestType'

const adminDB = test_db_helper.adminDB();
should()

describe('Order function', () => {
  it ('Order function, orderCounter test', async function() {
    const restaurantId = "testbar1";
    await test_helper.createRestaurantData(adminDB, restaurantId);

    // menuObj test
    const refRestaurant = adminDB.doc(`restaurants/${restaurantId}`);
    const menuObj = await utils.getMenuObj(refRestaurant, ["hoge1", "hoge2"]);

    Object.keys(menuObj).length.should.equal(2);
    menuObj["hoge1"].price.should.equal(100);
    menuObj["hoge1"].tax.should.equal("food");
    menuObj["hoge2"].price.should.equal(50);
    menuObj["hoge2"].tax.should.equal("alcohol");

    // create order
    const orderId = "hoge";

    await test_helper.createOrder(adminDB, restaurantId, orderId, {
      hoge1: 10,
    }, order.wasOrderCreated);

    const updatedOrder = await adminDB.doc(`restaurants/${restaurantId}/orders/${orderId}`).get();
    const updatedOrderdata = updatedOrder.data() || {};

    // console.log(updatedOrderdata);
    updatedOrderdata.number.should.equal(10);
    updatedOrderdata.order.hoge1[0].should.equal(10);
    updatedOrderdata.status.should.equal(200);
    updatedOrderdata.sub_total.should.equal(1000);
    updatedOrderdata.tax.should.equal(50);
    updatedOrderdata.total.should.equal(1050);

    // check order counter on restaurant
    const restaurantDoc = await adminDB.doc(`restaurants/${restaurantId}`).get();
    const data = restaurantDoc.data();
    if (data) {
      data.orderCount.should.equal(11);
    }
  });

  it ('Order function, error test', async function() {
    // create restaurant
    const restaurantId = "testbar3";
    await test_helper.createRestaurantData(adminDB, restaurantId);

    let index = 0;

    const makeOrder = async (data) => {
      const orderId = "hoge" + String(index);

      await test_helper.createOrder(adminDB, restaurantId, orderId, data, order.wasOrderCreated);
      const newOrderData = (await adminDB.doc(`restaurants/${restaurantId}/orders/${orderId}`).get()).data() || {};
      newOrderData["orderId"] = orderId;
      index ++;
      return newOrderData;
    };

    // not exist menu test

    const newOrderData = await makeOrder({
      hoge1: 10,
      hoge3: 5,
    });
    newOrderData.status.should.equal(constant.order_status.error);


    // zero order test - skip 0 order
    const newOrderData2 = await makeOrder({
      hoge1: 0,
      hoge2: 1,
    });
    // TODO: not support now
    Object.keys(newOrderData2.order).length.should.equal(2);
    // Object.keys(newOrderData2.order).length.should.equal(1);

    // zero order test - total 0 is error
    const newOrderData3 = await makeOrder({
      hoge1: 0,
      hoge2: 0,
    });
    expect(newOrderData3.sub_total).equal(undefined);
    expect(newOrderData3.tax).equal(undefined);
    expect(newOrderData3.total).equal(undefined);

    newOrderData3.status.should.equal(constant.order_status.error);

    // dicimal error
    const newOrderData4 = await makeOrder({
      hoge1: 1.5,
      hoge2: 0,
    });
    expect(newOrderData4.sub_total).equal(undefined);
    expect(newOrderData4.tax).equal(undefined);
    expect(newOrderData4.total).equal(undefined);

    newOrderData4.status.should.equal(constant.order_status.error);

    // zero order test
    const newOrderData5 = await makeOrder({
      hoge1: "1",
      hoge2: 0,
    });
    expect(newOrderData5.sub_total).equal(undefined);
    expect(newOrderData5.tax).equal(undefined);
    expect(newOrderData5.total).equal(undefined);

    newOrderData5.status.should.equal(constant.order_status.error);

    const newOrderData6 = await makeOrder({
      hoge1: -1,
      hoge2: 0,
    });
    expect(newOrderData6.sub_total).equal(undefined);
    expect(newOrderData6.tax).equal(undefined);
    expect(newOrderData6.total).equal(undefined);

    newOrderData6.status.should.equal(constant.order_status.error);


    // invalid number data test
    const newOrderData10 =  await makeOrder({
      hoge1: "abc",
    });

    expect(newOrderData10.sub_total).equal(undefined);
    expect(newOrderData10.tax).equal(undefined);
    expect(newOrderData10.total).equal(undefined);
    newOrderData10.status.should.equal(constant.order_status.error);

    const checkOrderTotal = async (count) => {
      const now = moment().tz("Asia/Tokyo").format('YYYYMMDD');
      const path = `restaurants/${restaurantId}/menus/hoge1/orderTotal/${now}`
      const totalRes = (await adminDB.doc(path).get()).data() || {};
      totalRes.count.should.equal(count);
    };

    const newOrderData12 =  await makeOrder({
      hoge1: 1,
    });
    const uid = "123";
    const { orderId } = newOrderData12;
    const placed = await order.place(adminDB, {restaurantId, orderId}, {auth: { uid, token:{ phone_number: "xxxx"}}} as Context );

    placed.success.should.equal(true);
    await checkOrderTotal(1);

    const newOrderData13 =  await makeOrder({
      hoge1: 1,
    });
    const newOrderRes13 = newOrderData13;
    const placed2 = await order.place(adminDB, {restaurantId, orderId: newOrderRes13.orderId}, {auth: { uid, token:{ phone_number: "xxxx"}}} as Context );
    placed2.success.should.equal(true);
    await checkOrderTotal(2);

    const newOrderData14 =  await makeOrder({
      hoge1: [1, 1],
    });

    const newOrderRes14 = newOrderData14;
    const placed14 = await order.place(adminDB, {restaurantId, orderId: newOrderRes14.orderId}, {auth: { uid, token:{ phone_number: "xxxx"}}} as Context );
    placed14.success.should.equal(true);
    await checkOrderTotal(4);

    
  });

});
