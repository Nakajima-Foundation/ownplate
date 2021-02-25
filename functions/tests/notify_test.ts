import { should } from 'chai';
// import { expect } from 'chai';

import * as test_db_helper from './test_db_helper';
import * as test_helper from './test_helper';
import * as order from './../src/functions/order'
import * as notify from './../src/functions/notify'
const adminDB = test_db_helper.adminDB();

should()

describe('Order function', () => {
  it ('Order function, orderCounter test', async () => {
    const a = 1;
    a.should.equal(1);
    
    const restaurantId = "testbar1";
    await test_helper.createRestaurantData(adminDB, restaurantId);
    
    const orderId = "hoge";
    await test_helper.createOrder(adminDB, restaurantId, orderId, {
      hoge1: 10,
    }, order.wasOrderCreated);
    
    const lineId = "U750ebba2d580597e722344ee20fec6d9";
    
    await adminDB.doc(`/restaurants/${restaurantId}/lines/${lineId}`).set({
      displayName: "test",
      notify: true,
      restaurantId,
      uid: "121212",
    });
    
    await order.notifyRestaurantToRestaurant(adminDB,  'msg_order_placed', restaurantId, orderId, "hello", 123, "jp");
  });
});

