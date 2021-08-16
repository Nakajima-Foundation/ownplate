import { should } from "chai";
//import { expect } from 'chai';

import { createNotifyRestaurantMailMessage } from "./../src/functions/notify";

should();

const order = {
  prices: {
    bPNtYvcrIG0DCENjsfNj: [1000, 1000],
    jmFdqPgZntqH8nifDlGg: [1051, 751],
  },
  description: "#017 テスト cafe",
  number: 17,
  order: {
    jmFdqPgZntqH8nifDlGg: [1, 1],
    bPNtYvcrIG0DCENjsfNj: [1, 1],
  },
  menuItems: {
    jmFdqPgZntqH8nifDlGg: {
      category1: "222",
      itemName: "aaa 炒めももの",
      price: 741,
    },
    bPNtYvcrIG0DCENjsfNj: {
      price: 1000,
      itemName: "aaassasa",
    },
  },
  total: 4106,
  sub_total: 3802,
  inclusiveTax: false,
  totalCharge: 4106,
  options: {
    jmFdqPgZntqH8nifDlGg: {
      "0": ["大盛り (+150)", "豆(+150)", "ひき肉 (+10)"],
      "1": ["大盛り (0)", "+ーAZaz09", "ひき肉 (+10)"],
    },
    bPNtYvcrIG0DCENjsfNj: {
      "0": ["123", ""],
      "1": ["123", "3333"],
    },
  },
  tax: 304,
};

describe("mail template function", () => {
  it("ja mail template function", async function () {
    const mail = await createNotifyRestaurantMailMessage(
      "msg_order_placed",
      "レストランA",
      order,
      123,
      "ja",
      "https://example.com"
    );
    const bodys = mail.split("\n");
    const expectBodys = [
      "レストランA様",
      "",
      "新たな注文が入りました。 (#123)",
      "",
      "★ aaa 炒めももの × 1",
      "オプション: 大盛り (+150)/豆(+150)/ひき肉 (+10)",
      "",
      "★ aaa 炒めももの × 1",
      "オプション: 大盛り (0)/+ーAZaz09/ひき肉 (+10)",
      "",
      "★ aaassasa × 1",
      "オプション: 123/",
      "",
      "★ aaassasa × 1",
      "オプション: 123/3333",
      "",
      "合計金額",
      "4106円",
      "",
      "支払い方法: 現地払い",
      "",
      "詳細はサイトで確認してください。",
      "https://example.com",
      "",
    ];
    Object.keys(bodys).map((key) => {
      bodys[key].should.equal(expectBodys[key]);
    });
  });
  it("en mail template function", async function () {
    const mail = await createNotifyRestaurantMailMessage(
      "msg_order_placed",
      "レストランA",
      order,
      123,
      "en",
      "https://example.com"
    );
    const bodys = mail.split("\n");

    const expectBodys = [
      "Hi, レストランA",
      "",
      "A new order has been placed.  (#123)",
      "",
      "★ aaa 炒めももの × 1",
      "Option: 大盛り (+150)/豆(+150)/ひき肉 (+10)",
      "",
      "★ aaa 炒めももの × 1",
      "Option: 大盛り (0)/+ーAZaz09/ひき肉 (+10)",
      "",
      "★ aaassasa × 1",
      "Option: 123/",
      "",
      "★ aaassasa × 1",
      "Option: 123/3333",
      "",
      "Total Charge",
      "4106円",
      "",
      "Payment method: Payment in the restaurant",
      "",
      "https://example.com",
      "",
    ];
    Object.keys(bodys).map((key) => {
      bodys[key].should.equal(expectBodys[key]);
    });
  });
});
