import * as admin from "firebase-admin";
import { should } from "chai";
import { getSVG } from "../src/functions/express/apis";
import { writeFile } from "fs";
import * as receiptline from "receiptline";
// import { convert } from "convert-svg-to-png";
import sharp from "sharp";

should();

describe("svg function", () => {
  /*
  it("svg convert", async function () {
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
        "111": [["サルサソース", "ハラペーニョソース(+120)", "大盛り (+￥150)", "豆(+￥150)", "ひき肉 (+￥10)"]],
        "222": [
          ["", "ハラペーニョソース"],
          ["大盛り", ""],
        ],
      },
      totalCharge: 1208,
      total: 900,
      tax: 90,
      tip: 218,
    };
    const ret = getSVG(restaurantData, orderData);

    await writeFile("./order.svg", ret, () => {});
    const png = await convert(ret, { background: "white" });
    await writeFile("./order.png", png, () => {});
    console.log(ret);
  });
  */
  
  it("shart test", async function () {
    const text =
      "^^テストカフェ8080 デリバリーss\n" +
      "おもちかえり.com\n" +
      "\n" +
      "^^^\"#535\"\n" +
      "\n" +
      "|受渡方法：\"テイクアウト\"\n" +
      "|受渡希望時間：\"2023/04/09 11:40\"\n" +
      "\n" +
      "テスト太郎さん|\n" +
      "{w:*,4;b:line}\n" +
      "お寿司盛り合わせ | x1\n" +
      "~~~*わさびあり|\n" +
      "お寿司盛り合わせ | x1\n" +
      "~~~*わさびあり|\n" +
      "-\n" +
      "{w:16,16;a:right}\n" +
      "小計 | ¥2000\n" +
      "消費税（内税） | ¥148\n" +
      "配達料金 | ¥0 \n" +
      "心づけ (サービス料・消費税含む)| ¥0\n" +
      "-\n" +
      "^^合計 | ^^^¥2000\n" +
      "{w:auto; b:space}\n" +
      "支払方法：\"現地払い\"|\n" +
      "\n" +
      "\n";
    const svg = receiptline.transform(text, { encoding: "cp932" });
    // const png = await convert(svg, {background: "white"});
    await sharp(Buffer.from(svg))
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toFile("./order2.png");
    // .toBuffer()

    // console.log(res);
  });
});
