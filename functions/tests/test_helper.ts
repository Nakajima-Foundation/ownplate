import * as cheerio from 'cheerio'
import * as constant from './../src/common/constant';

export const parse_meta = (body) => {
  const parsed = cheerio.load(body);
  const meta = {};
  parsed('head meta').map((i, el) => {
    const property = parsed(el).attr('property')
    const content = parsed(el).attr('content')
    if (property && content) {
      meta[property] = content;
    }
  });
  return meta;
};

export const createRestaurantData = async (db, restaurantId) => {
  await db.doc(`restaurants/${restaurantId}`).set({
    orderCount: 10,
    foodTax: 5,
    alcoholTax: 8,
    publicFlag: true,
  });
  // create menu.
  await db.doc(`restaurants/${restaurantId}/menus/hoge1`).set({
    deletedFlag: false,
    itemName: "hoge1",
    price: 100,
    publicFlag: true,
    tax: "food",
  });
  // create order
  await db.doc(`restaurants/${restaurantId}/menus/hoge2`).set({
    deletedFlag: false,
    itemName: "hoge2",
    price: 50,
    publicFlag: true,
    tax: "alcohol",
  });
}
export const createOrder = async (db, restaurantId, orderId, orderData, func) => {
  const uid = "123";
  await db.doc(`/users/${uid}/system/stripe`).set({});

  const options = {};
  Object.keys(orderData).map(key => {options[key] = {0: []};})
  const menuItems = {};
  // TODO set valid menu adta
  Object.keys(orderData).map(key => {menuItems[key] = {
    itemName: "aaa",
    price: 100,
  };});
  await db.doc(`restaurants/${restaurantId}/orders/${orderId}`).set({
    status: constant.order_status.new_order,
    menuItems,
    order: orderData,
    options,
    rawOptions: options,
    uid,
  });
  
  // call function
  await func(db, {restaurantId, orderId}, {auth: { uid, token:{ phone_number: "xxxx"} }});
}
