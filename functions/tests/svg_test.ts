import * as admin from "firebase-admin";
import { should } from "chai";
import { getSVG } from "../src/functions/express/apis";
import { writeFile } from 'fs';
import { convert } from 'convert-svg-to-png';

should();

describe("Order function", () => {
  it("Order function, orderCounter test", async function () {
    const restaurantData = {
      restaurantName: "テスト店舗",
    };
    const orderData = {
      number: 123,
      isDelivery: false,
      timePlaced: new admin.firestore.Timestamp(1573804400, 0),
      name: "お客様",
      order: {
        "111": [1],
        "222": [1, 2],
      },
      menuItems: {
        "111": {
          itemName: "商品1",
        },
        "222": {
          itemName: "商品2",
        },
      },
      options: {
        "111": [["サルサソース", "ハラペーニョソース"]],
        "222": [["", "ハラペーニョソース"], ["大盛り", ""]],
      },
      totalCharge: 1208,
      total: 900,
      tax: 90,
      tip: 218,
    };
    const ret = getSVG(restaurantData, orderData);
    
    await writeFile(`./order.svg`, ret, () => {});
    const png = await convert(ret, {background: "white"});
    await writeFile(`./order.png`, png, () => {});
    console.log(ret);
  });
});
     
