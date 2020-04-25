import { should } from 'chai';
// import { expect } from 'chai';

//import * as firestore from './../src/functions/firestore'

// import * as constant from './../src/common/constant';
// import * as test_db_helper from './test_db_helper';

// const adminDB = test_db_helper.adminDB();

should()

describe('Order function', () => {
  it ('Order function, orderCounter test', async function() {
    /*
    // create restaurant.
    await adminDB.doc(`restaurants/testbar1`).set({
      orderCount: 10,
      foodTax: 5,
      alcoholTax: 8,
    });
    // create menu.
    await adminDB.doc(`restaurants/testbar1/menus/hoge1`).set({
      price: 100,
      tax: "food",
    });

    // create order
    await adminDB.doc(`restaurants/testbar1/orders/hoge`).set({
      status: constant.order_status.new_order,
      order: {
        hoge1: 10,
      },
    });

    //  get order
    const orderdata = await adminDB.doc(`restaurants/testbar1/orders/hoge`).get();

    // call function
    await firestore.orderCreate(adminDB, orderdata, {});

    // check order counter on restaurant
    const restaurantDoc = await adminDB.doc(`restaurants/testbar1`).get();
    expect(restaurantDoc).to.exist;
    const data = restaurantDoc.data();
    expect(data).to.exist;
    if (data) {
      data.orderCount.should.equal(11);
    }
  })

  it ('Order function, calculate test', async function() {
    // create restaurant.
    await adminDB.doc(`restaurants/testbar2`).set({
      orderCount: 10,
      foodTax: 5,
      alcoholTax: 8,
    });
    // create menu.
    await adminDB.doc(`restaurants/testbar2/menus/hoge1`).set({
      price: 100,
      tax: "food",
    });

    await adminDB.doc(`restaurants/testbar2/menus/hoge2`).set({
      price: 50,
      tax: "alcohol",
    });


    // create order
    await adminDB.doc(`restaurants/testbar2/orders/hoge`).set({
      status: constant.order_status.new_order,
      order: {
        hoge1: 10,
        hoge2: 5,
      },
    });

    //  get order
    const orderdata = await adminDB.doc(`restaurants/testbar2/orders/hoge`).get();

    // call function
    await firestore.orderCreate(adminDB, orderdata, {});

    //  check order
    const newOrderDoc = await adminDB.doc(`restaurants/testbar2/orders/hoge`).get();
    const newOrderData = newOrderDoc.data();

    const sub_total = 100 * 10 + 50 * 5;
    const tax = 100 * 10 * 0.05 + 50 * 5 * 0.08
    const total = sub_total + tax;

    expect(newOrderData).to.exist;
    if (newOrderData) {
      newOrderData.sub_total.should.equal(sub_total);
      newOrderData.tax.should.equal(tax);
      newOrderData.total.should.equal(total);
    }
  })

  it ('Order function, error test', async function() {
    // create restaurant.
    await adminDB.doc(`restaurants/testbar3`).set({
      orderCount: 10,
      foodTax: 5,
      alcoholTax: 8,
    });
    // create menu.
    await adminDB.doc(`restaurants/testbar3/menus/hoge1`).set({
      price: 100,
      tax: "food",
    });
    // create order
    await adminDB.doc(`restaurants/testbar3/orders/hoge`).set({
      status: constant.order_status.new_order,
      order: {
        hoge1: 10,
        hoge2: 5,
      },
    });

    //  get order
    const orderdata = await adminDB.doc(`restaurants/testbar3/orders/hoge`).get();

    // call function
    await firestore.orderCreate(adminDB, orderdata, {});

    //  check order
    const newOrderDoc = await adminDB.doc(`restaurants/testbar3/orders/hoge`).get();
    const newOrderData = newOrderDoc.data();

    expect(newOrderData).to.exist;
    if (newOrderData) {
      newOrderData.status.should.equal(constant.order_status.error);
    }
    */
  })


});
