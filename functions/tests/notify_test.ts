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
    const orderData = {
      "updatedAt":{"seconds":1613988208,"nanoseconds":981000000},
      "prices":{"VbXMnx4wdTgh1VBpBRIr":[1000]},
      "total":1080,"timePlaced":{"seconds":1614051000,"nanoseconds":756000000},
      "tax":80,"timeCreated":{"seconds":1613988203,"nanoseconds":388000000},
      "sendSMS":true,"orderPlacedAt":{"seconds":1613988208,"nanoseconds":981000000},
      "options":{"VbXMnx4wdTgh1VBpBRIr":{"0":["","","","1"]}},
      "rawOptions":{"VbXMnx4wdTgh1VBpBRIr":{"0":[false,false,false,0]}},
      "memo":"","accounting":{"alcohol":{"revenue":0,"tax":0},
                              "food":{"tax":80,"revenue":1000}},
      "order":{"VbXMnx4wdTgh1VBpBRIr":[1]},
      "number":412,"sub_total":1000,"inclusiveTax":false,"totalCharge":1080,
      "uid":"hdLfvObioAWvymcZsGlq5PKL0CX2","phoneNumber":"+819011111111","name":"山田",
      "status":300,
      "menuItems":{
        "VbXMnx4wdTgh1VBpBRIr":{"category1":"333333","itemName":"美味しい料理","price":1000,"category2":"44"}
      },
      "tip":0,
      "id": 123,
    };
    
    await notify.notifyRestaurant(adminDB,  'msg_order_placed', restaurantId, orderData, "美味しいレストラン", "jp");
  });
});

