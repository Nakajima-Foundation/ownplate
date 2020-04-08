import { should } from 'chai';
import { expect } from 'chai';

import * as firestore from './../src/functions/firestore'

import * as constant from './../src/common/constant';
import * as test_db_helper from './test_db_helper';

const adminDB = test_db_helper.adminDB();

should()

describe('Order function', () => {
  it ('Order function, orderCounter test', async function() {
    // create restaurant.
    await adminDB.doc(`restaurants/testbar`).set({
      orderCount: 10,
    });
    // create order
    await adminDB.doc(`restaurants/testbar/orders/hoge`).set({
      status: constant.order_status.new_order
    });

    const orderdata = await adminDB.doc(`restaurants/testbar/orders/hoge`).get();

    //  get order
    await firestore.orderCreate(adminDB, orderdata, {});

    const restaurantDoc = await adminDB.doc(`restaurants/testbar`).get();
    expect(restaurantDoc).to.exist;
    const data = restaurantDoc.data();
    expect(data).to.exist;
    if (data) {
      data.orderCount.should.equal(11);
    }
    true.should.equal(true);
  })
});
