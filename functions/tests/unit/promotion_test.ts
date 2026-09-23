import { describe, it } from "node:test";
import assert from "node:assert";

import {
  getDiscountPrice,
  getPromotion,
  getUserHistoryCollectionPath,
} from "../../src/functions/order/promotion";
import { PromotionData } from "../../src/lib/types/promotion";

const promotion = (values: Partial<PromotionData>): PromotionData =>
  values as PromotionData;

describe("getDiscountPrice", () => {
  it("takes the stated amount off when the promotion is an amount", () => {
    const result = getDiscountPrice(
      promotion({ discountMethod: "amount", discountValue: 300 }),
      5000,
    );
    assert.strictEqual(result, 300);
  });

  it("ignores the order total when the promotion is an amount", () => {
    const amountOff = promotion({
      discountMethod: "amount",
      discountValue: 300,
    });
    assert.strictEqual(
      getDiscountPrice(amountOff, 100),
      getDiscountPrice(amountOff, 100000),
    );
  });

  it("takes a share of the total when the promotion is a percentage", () => {
    const result = getDiscountPrice(
      promotion({ discountMethod: "percentage", discountValue: 10 }),
      5000,
    );
    assert.strictEqual(result, 500);
  });

  // 割り切れない率。端数をここで丸めていないことを固定しておく。
  it("does not round the share it computes", () => {
    const result = getDiscountPrice(
      promotion({ discountMethod: "percentage", discountValue: 33 }),
      1000,
    );
    assert.strictEqual(result, 330);
    assert.strictEqual(
      getDiscountPrice(
        promotion({ discountMethod: "percentage", discountValue: 7 }),
        1005,
      ),
      70.35,
    );
  });

  it("discounts nothing for a zero promotion", () => {
    assert.strictEqual(
      getDiscountPrice(
        promotion({ discountMethod: "percentage", discountValue: 0 }),
        5000,
      ),
      0,
    );
    assert.strictEqual(
      getDiscountPrice(
        promotion({ discountMethod: "amount", discountValue: 0 }),
        5000,
      ),
      0,
    );
  });
});

// 割引が使えるかどうかの判定。ここを抜けた注文は請求額が下がるので、緩めると
// 終わった催しの券や、条件を満たさない注文にも割引が乗る。
//
// Firestore からは promotion の中身を読むだけなので、作り物の transaction を渡せば
// 判定そのものを試験できる。
const daysFromNow = (days: number) => ({
  toDate: () => new Date(Date.now() + days * 24 * 60 * 60 * 1000),
});

const coupon = (overrides: Partial<PromotionData> = {}): PromotionData => ({
  promotionId: "promo1",
  promotionName: "500円引き",
  enable: true,
  type: "onetimeCoupon",
  hasTerm: false,
  termFrom: daysFromNow(-1),
  termTo: daysFromNow(1),
  discountThreshold: 1000,
  discountMethod: "amount",
  discountValue: 500,
  paymentRestrictions: "",
  usageRestrictions: false,
  ...overrides,
});

const restaurant = { restaurantId: "rest1" };
const db = { doc: (path: string) => path };
const transactionHolding = (data: PromotionData | undefined) => ({
  get: async () => ({ data: () => data }),
});

const askFor = (
  promotion: PromotionData | undefined,
  orderTotal: number,
  enableStripe: boolean = false,
) =>
  getPromotion(
    db,
    transactionHolding(promotion),
    "promo1",
    restaurant,
    orderTotal,
    enableStripe,
  );

const refused = async (promise: Promise<unknown>, why: string) => {
  await assert.rejects(
    promise,
    (error: { code?: string }) => {
      assert.strictEqual(error.code, "invalid-argument", why);
      return true;
    },
    why,
  );
};

describe("getPromotion", () => {
  it("hands back a live coupon on an order that reaches the threshold", async () => {
    const promotion = coupon();
    assert.strictEqual((await askFor(promotion, 1000)).promotionId, "promo1");
  });

  it("refuses a coupon the shop has switched off", async () => {
    await refused(
      askFor(coupon({ enable: false }), 1000),
      "止めた券を通してはいけない",
    );
  });

  it("refuses when the shop has no such coupon", async () => {
    await refused(askFor(undefined, 1000), "無い券を通してはいけない");
  });

  // 境目。しきい値ちょうどは通る。
  it("allows the order that lands exactly on the threshold", async () => {
    assert.ok(await askFor(coupon({ discountThreshold: 1000 }), 1000));
    await refused(
      askFor(coupon({ discountThreshold: 1000 }), 999),
      "しきい値に届かない注文を通してはいけない",
    );
  });

  it("allows any total when the shop set no threshold", async () => {
    assert.ok(await askFor(coupon({ discountThreshold: 0 }), 0));
  });
});

describe("getPromotion — 催しの期間", () => {
  it("ignores the dates when the coupon has no term", async () => {
    const noTerm = coupon({
      hasTerm: false,
      termFrom: daysFromNow(10),
      termTo: daysFromNow(-10),
    });
    assert.ok(await askFor(noTerm, 1000));
  });

  it("allows a coupon inside its term", async () => {
    const running = coupon({
      hasTerm: true,
      termFrom: daysFromNow(-1),
      termTo: daysFromNow(1),
    });
    assert.ok(await askFor(running, 1000));
  });

  it("refuses one whose term has not started", async () => {
    const notYet = coupon({
      hasTerm: true,
      termFrom: daysFromNow(1),
      termTo: daysFromNow(2),
    });
    await refused(askFor(notYet, 1000), "始まっていない催しを通してはいけない");
  });

  it("refuses one whose term has passed", async () => {
    const over = coupon({
      hasTerm: true,
      termFrom: daysFromNow(-2),
      termTo: daysFromNow(-1),
    });
    await refused(askFor(over, 1000), "終わった催しを通してはいけない");
  });

  // 片側だけの期間。開始だけ、終了だけを決めた催しがある。
  it("checks whichever end of the term the shop set", async () => {
    assert.ok(
      await askFor(
        coupon({ hasTerm: true, termFrom: undefined, termTo: daysFromNow(1) }),
        1000,
      ),
    );
    assert.ok(
      await askFor(
        coupon({ hasTerm: true, termFrom: daysFromNow(-1), termTo: undefined }),
        1000,
      ),
    );
  });
});

// 支払い方法を絞った催し。カード決済だけ、現地払いだけ、という券がある。
describe("getPromotion — 支払い方法の縛り", () => {
  it("allows any payment when the coupon names none", async () => {
    assert.ok(await askFor(coupon({ paymentRestrictions: "" }), 1000, true));
    assert.ok(await askFor(coupon({ paymentRestrictions: "" }), 1000, false));
  });

  it("allows a card-only coupon only on a card order", async () => {
    const cardOnly = coupon({ paymentRestrictions: "stripe" });
    assert.ok(await askFor(cardOnly, 1000, true));
    await refused(
      askFor(cardOnly, 1000, false),
      "カード専用の券を現地払いで通してはいけない",
    );
  });

  it("allows an in-store-only coupon only on an in-store order", async () => {
    const inStoreOnly = coupon({ paymentRestrictions: "instore" });
    assert.ok(await askFor(inStoreOnly, 1000, false));
    await refused(
      askFor(inStoreOnly, 1000, true),
      "現地払い専用の券をカードで通してはいけない",
    );
  });
});

// 使用履歴の置き場。客ごとに分かれていないと、他の客の履歴を見て使用済みと判定される。
describe("getUserHistoryCollectionPath", () => {
  it("puts each customer's history under their own uid", () => {
    assert.strictEqual(
      getUserHistoryCollectionPath("customer1"),
      "/users/customer1/promotionHistories",
    );
    assert.notStrictEqual(
      getUserHistoryCollectionPath("customer1"),
      getUserHistoryCollectionPath("customer2"),
    );
  });
});
