import { describe, it } from "node:test";
import assert from "node:assert";

import {
  getPromotionCollctionPath,
  getPromotionDocumentPath,
  isPaymentAllowed,
  promotionDiscount,
  userPromotionHistoryPath,
} from "../../src/utils/promotionRules.ts";
import { getDiscountPrice } from "../../functions/src/functions/order/promotion.ts";
import type { PromotionData as ServerPromotionData } from "../../functions/src/lib/types/promotion.ts";
import type { Timestamp } from "firebase-admin/firestore";
import type {
  DiscountMethod,
  PaymentRestrictions,
} from "../../src/config/constant.ts";

// 券の置き場。店舗ごと・客ごとに分かれている。取り違えると、他の店舗の券を出したり、
// 他の客の履歴で使用済みと判定したりする。
describe("券の置き場", () => {
  it("keeps each shop's coupons under that shop", () => {
    assert.strictEqual(
      getPromotionCollctionPath("rest1"),
      "restaurants/rest1/promotions",
    );
    assert.notStrictEqual(
      getPromotionCollctionPath("rest1"),
      getPromotionCollctionPath("rest2"),
    );
  });

  it("puts one coupon inside its shop's collection", () => {
    assert.strictEqual(
      getPromotionDocumentPath("rest1", "promo1"),
      "restaurants/rest1/promotions/promo1",
    );
    assert.ok(
      getPromotionDocumentPath("rest1", "promo1").startsWith(
        getPromotionCollctionPath("rest1") + "/",
      ),
    );
  });

  // 順番が命。入れ替えると別の店舗を指す。
  it("takes the shop first and the coupon second", () => {
    assert.notStrictEqual(
      getPromotionDocumentPath("a", "b"),
      getPromotionDocumentPath("b", "a"),
    );
  });

  it("keeps each customer's history under their own uid", () => {
    assert.strictEqual(
      userPromotionHistoryPath("customer1"),
      "users/customer1/promotionHistories",
    );
    assert.notStrictEqual(
      userPromotionHistoryPath("customer1"),
      userPromotionHistoryPath("customer2"),
    );
  });

  // 渡された id はそのまま置き場になる。整えてはいない（Firestore の規則側で守る）。
  it("uses the ids as given, without cleaning them", () => {
    assert.strictEqual(
      getPromotionCollctionPath("a/b"),
      "restaurants/a/b/promotions",
    );
  });
});

// 割引額。ここが客の請求額を下げる。
type Coupon = {
  discountThreshold: number;
  discountMethod: DiscountMethod;
  discountValue: number;
};

const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  discountThreshold: 1000,
  discountMethod: "amount",
  discountValue: 500,
  ...over,
});

describe("promotionDiscount — 使える注文額か", () => {
  // 境目。しきい値ちょうどは使える。サーバ側（functions の getPromotion）も
  // 「ちょうど」を通すので、片方だけずらすと画面で使えた券が決済で弾かれる。
  it("allows the order that lands exactly on the threshold", () => {
    assert.strictEqual(promotionDiscount(1000, coupon()).enabled, true);
    assert.strictEqual(promotionDiscount(999, coupon()).enabled, false);
    assert.strictEqual(promotionDiscount(1001, coupon()).enabled, true);
  });

  it("allows any order when the shop set no threshold", () => {
    assert.strictEqual(
      promotionDiscount(0, coupon({ discountThreshold: 0 })).enabled,
      true,
    );
  });
});

describe("promotionDiscount — いくら引くか", () => {
  it("takes the stated amount off a fixed-amount coupon", () => {
    assert.strictEqual(promotionDiscount(5000, coupon()).discountPrice, 500);
  });

  // 定額は注文額に左右されない。しきい値に届かない注文でも金額そのものは出る
  // （使えるかどうかは enabled のほう）。
  it("ignores the order total for a fixed-amount coupon", () => {
    assert.strictEqual(promotionDiscount(1, coupon()).discountPrice, 500);
    assert.strictEqual(promotionDiscount(100000, coupon()).discountPrice, 500);
  });

  it("takes a share of the total for any other method", () => {
    const ratio = coupon({ discountMethod: "ratio", discountValue: 10 });
    assert.strictEqual(promotionDiscount(5000, ratio).discountPrice, 500);
    assert.strictEqual(promotionDiscount(1000, ratio).discountPrice, 100);
  });

  // 丸めていない。サーバ側も丸めていないので、片方だけ丸めると額がずれる。
  it("does not round the share it computes", () => {
    const ratio = coupon({ discountMethod: "ratio", discountValue: 33 });
    assert.strictEqual(promotionDiscount(1001, ratio).discountPrice, 330.33);
  });

  it("discounts nothing for a zero coupon", () => {
    assert.strictEqual(
      promotionDiscount(5000, coupon({ discountValue: 0 })).discountPrice,
      0,
    );
    assert.strictEqual(
      promotionDiscount(
        5000,
        coupon({ discountMethod: "ratio", discountValue: 0 }),
      ).discountPrice,
      0,
    );
  });

  // 種別は amount と ratio の2つだけ。amount 以外はすべて割合として扱う書き方に
  // なっているが、3つめの値は型が認めていないのでここからは渡せない。
  it("treats ratio as a share of the total", () => {
    assert.strictEqual(
      promotionDiscount(
        1000,
        coupon({ discountMethod: "ratio", discountValue: 10 }),
      ).discountPrice,
      100,
    );
  });
});

// 画面が出す割引額と、サーバが請求時に計算する割引額。**ずれると客が見た額と
// 請求額が食い違う。** 別々のファイルに同じ規則が二重に書かれているので、
// 片方だけ直しても気づけない。
describe("画面とサーバの割引額が一致すること", () => {
  // サーバ側の関数は券ひとつ分の型を丸ごと要求する。使うのは discountMethod と
  // discountValue だけなので、残りは型を満たすためだけの値。
  const timestampAt = (seconds: number): Timestamp => ({
    seconds,
    nanoseconds: 0,
    toDate: () => new Date(seconds * 1000),
    toMillis: () => seconds * 1000,
    isEqual: (other) => other.seconds === seconds,
    valueOf: () => String(seconds),
    toInstant: () => {
      throw new Error("この試験では呼ばれない");
    },
  });

  const serverCoupon = (
    discountMethod: DiscountMethod,
    discountValue: number,
  ): ServerPromotionData => ({
    promotionId: "promo1",
    promotionName: "券",
    enable: true,
    type: "onetimeCoupon",
    hasTerm: false,
    termFrom: timestampAt(0),
    termTo: timestampAt(1),
    discountThreshold: 1000,
    discountMethod,
    discountValue,
    paymentRestrictions: null,
    usageRestrictions: false,
  });

  const cases: {
    discountMethod: DiscountMethod;
    discountValue: number;
    total: number;
  }[] = [
    { discountMethod: "amount", discountValue: 500, total: 5000 },
    { discountMethod: "amount", discountValue: 500, total: 1 },
    { discountMethod: "amount", discountValue: 0, total: 5000 },
    { discountMethod: "ratio", discountValue: 10, total: 5000 },
    { discountMethod: "ratio", discountValue: 33, total: 1001 },
    { discountMethod: "ratio", discountValue: 100, total: 2500 },
    { discountMethod: "ratio", discountValue: 0, total: 5000 },
  ];

  it("computes the same amount off as the server does", () => {
    cases.forEach(({ discountMethod, discountValue, total }) => {
      assert.strictEqual(
        promotionDiscount(total, coupon({ discountMethod, discountValue }))
          .discountPrice,
        getDiscountPrice(serverCoupon(discountMethod, discountValue), total),
        `${discountMethod} ${discountValue} / ${total} でずれている`,
      );
    });
  });
});

// 支払い方法の縛り。カード決済だけ、現地払いだけ、という券がある。
describe("isPaymentAllowed", () => {
  const withRestriction = (paymentRestrictions: PaymentRestrictions) => ({
    paymentRestrictions,
  });

  it("allows either payment when the coupon names none", () => {
    assert.strictEqual(isPaymentAllowed(withRestriction(null), true), true);
    assert.strictEqual(isPaymentAllowed(withRestriction(null), false), true);
  });

  it("allows a card-only coupon only on a card order", () => {
    const cardOnly = withRestriction("stripe");
    assert.strictEqual(isPaymentAllowed(cardOnly, true), true);
    assert.strictEqual(isPaymentAllowed(cardOnly, false), false);
  });

  it("allows an in-store-only coupon only on an in-store order", () => {
    const inStoreOnly = withRestriction("instore");
    assert.strictEqual(isPaymentAllowed(inStoreOnly, false), true);
    assert.strictEqual(isPaymentAllowed(inStoreOnly, true), false);
  });

  // 券を選んでいなければ使えない。ここを通すと、券ぶんの割引が乗ったまま決済へ進む。
  it("allows nothing when no coupon is selected", () => {
    assert.strictEqual(isPaymentAllowed(null, true), false);
    assert.strictEqual(isPaymentAllowed(null, false), false);
    assert.strictEqual(isPaymentAllowed(undefined, true), false);
  });

  // 縛りは stripe / instore / 無し の3つだけ。それ以外は型が認めていないので
  // ここからは渡せない（実装は「縛りなし」として通す書き方になっている）。
});
