import { describe, it } from "node:test";
import assert from "node:assert";

import {
  getPromotionCollctionPath,
  getPromotionDocumentPath,
  isPaymentAllowed,
  promotionDiscount,
  userPromotionHistoryPath,
} from "../../src/utils/promotionRules.ts";
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

// 画面が出す割引額とサーバが請求時に計算する割引額が一致することは、両方を読める
// functions 側で照合している（functions/tests/unit/promotion_test.ts）。
// ここからはサーバ側のファイルを読めない — functions/src/models/ はデプロイ時に
// コピーされるもので、git には入っていない。

// カード決済だけ、現地払いだけ、という券がある。縛りは stripe / instore / 無し の
// 3つだけなので、実装にある「それ以外」の分岐は型が認めておらず、ここからは踏めない。
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
});
