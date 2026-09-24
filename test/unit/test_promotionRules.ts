import { describe, it } from "node:test";
import assert from "node:assert";

import {
  compareForAdmin,
  compareForCustomer,
  getPromotionCollctionPath,
  getPromotionDocumentPath,
  isPaymentAllowed,
  hasStarted,
  promotionDiscount,
  splitPromotionIdsByLookup,
  usablePromotions,
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

// 管理画面の券の一覧の並び。上から順に「いま使えるか」「止めていないか」「期間つきか」
// を見て、同じ段のものは始まりが遅いほうを先に出す。
describe("compareForAdmin", () => {
  const card = (over: Partial<Parameters<typeof compareForAdmin>[0]> = {}) => ({
    currentOpen: false,
    enable: false,
    hasTerm: false,
    termFrom: new Date("2026-01-01"),
    ...over,
  });
  const order = (list: ReturnType<typeof card>[]) =>
    [...list].sort(compareForAdmin);

  it("puts a coupon that is live now above everything else", () => {
    const live = card({ currentOpen: true });
    const stopped = card({ enable: true, hasTerm: true });
    assert.deepStrictEqual(order([stopped, live]), [live, stopped]);
  });

  // 「いま使える」が同じなら、止めていないほうが上。
  it("puts an enabled coupon above a disabled one", () => {
    const on = card({ enable: true });
    const off = card({ enable: false });
    assert.deepStrictEqual(order([off, on]), [on, off]);
  });

  it("puts a coupon with a term above one without", () => {
    const withTerm = card({ enable: true, hasTerm: true });
    const forever = card({ enable: true, hasTerm: false });
    assert.deepStrictEqual(order([forever, withTerm]), [withTerm, forever]);
  });

  // 最後は始まりの遅い順。新しく作った催しが上に出る。
  it("puts the later start first among coupons that tie", () => {
    const older = card({ hasTerm: true, termFrom: new Date("2026-01-01") });
    const newer = card({ hasTerm: true, termFrom: new Date("2026-09-01") });
    assert.deepStrictEqual(order([older, newer]), [newer, older]);
  });

  // 順位の付け方。止めていない券より、いま使える券が先（enable より currentOpen が強い）。
  it("prefers being live now over merely being enabled", () => {
    const liveButDisabled = card({ currentOpen: true, enable: false });
    const enabledButNotLive = card({ currentOpen: false, enable: true });
    assert.deepStrictEqual(order([enabledButNotLive, liveButDisabled]), [
      liveButDisabled,
      enabledButNotLive,
    ]);
  });

  it("orders a whole list top to bottom", () => {
    const live = card({ currentOpen: true, enable: true, hasTerm: true });
    const enabled = card({ enable: true, hasTerm: true });
    const noTerm = card({ enable: true });
    const stopped = card();
    assert.deepStrictEqual(order([stopped, noTerm, enabled, live]), [
      live,
      enabled,
      noTerm,
      stopped,
    ]);
  });
});

// 客に出す一覧の並び。割引の小さいものから。
describe("compareForCustomer", () => {
  const order = (values: number[]) =>
    values
      .map((discountValue) => ({ discountValue }))
      .sort(compareForCustomer)
      .map((p) => p.discountValue);

  it("puts the smallest discount first", () => {
    assert.deepStrictEqual(order([500, 100, 300]), [100, 300, 500]);
  });

  it("copes with a list of one and a list of none", () => {
    assert.deepStrictEqual(order([100]), [100]);
    assert.deepStrictEqual(order([]), []);
  });
});

// 期間つきの券は、Firestore 側で「終わっていない」ものだけを引いている。
// 始まっているかはこちらで見る。
describe("hasStarted", () => {
  const now = new Date("2026-09-24T00:00:00Z");

  it("says yes for a term that has already begun", () => {
    assert.strictEqual(
      hasStarted({ termFrom: new Date("2026-09-23") }, now),
      true,
    );
  });

  it("says no for a term that has not begun", () => {
    assert.strictEqual(
      hasStarted({ termFrom: new Date("2026-09-25") }, now),
      false,
    );
  });

  // 境目。開始のちょうどその瞬間はまだ始まっていない扱い。
  it("says no at the exact moment the term starts", () => {
    assert.strictEqual(hasStarted({ termFrom: new Date(now) }, now), false);
    assert.strictEqual(
      hasStarted({ termFrom: new Date(now.getTime() - 1) }, now),
      true,
    );
  });
});

// 使用履歴の引き方が2通りある。**一度きりの券は文書 id が券の id そのもの**なので
// id で引き、何度も使える券は履歴が複数あるので中の promotionId で引く。
// 振り分けを間違えると、使った券が未使用として出る。
describe("splitPromotionIdsByLookup", () => {
  const entry = (
    type: "discount" | "onetimeCoupon" | "multipletimesCoupon",
    usageRestrictions: boolean,
    promotionId: string,
  ) => ({ type, usageRestrictions, promotionId });

  it("looks a restricted one-time coupon up by its document id", () => {
    assert.deepStrictEqual(
      splitPromotionIdsByLookup([entry("onetimeCoupon", true, "p1")]),
      { byDocumentId: ["p1"], byField: [] },
    );
  });

  it("looks a restricted discount up by its document id too", () => {
    assert.deepStrictEqual(
      splitPromotionIdsByLookup([entry("discount", true, "p1")]),
      { byDocumentId: ["p1"], byField: [] },
    );
  });

  // 何度も使える券は履歴が複数あるので、文書 id では引けない。
  it("looks a multi-use coupon up by the field, even when restricted", () => {
    assert.deepStrictEqual(
      splitPromotionIdsByLookup([entry("multipletimesCoupon", true, "p1")]),
      { byDocumentId: [], byField: ["p1"] },
    );
  });

  // 使用制限が無い券は履歴を見る必要がないが、振り分けとしては field 側に入る。
  it("puts an unrestricted coupon on the field side whatever its type", () => {
    assert.deepStrictEqual(
      splitPromotionIdsByLookup([
        entry("discount", false, "p1"),
        entry("onetimeCoupon", false, "p2"),
      ]),
      { byDocumentId: [], byField: ["p1", "p2"] },
    );
  });

  it("splits a mixed list and keeps the order within each side", () => {
    assert.deepStrictEqual(
      splitPromotionIdsByLookup([
        entry("onetimeCoupon", true, "a"),
        entry("multipletimesCoupon", true, "b"),
        entry("discount", true, "c"),
        entry("discount", false, "d"),
      ]),
      { byDocumentId: ["a", "c"], byField: ["b", "d"] },
    );
  });

  it("splits an empty list into two empty sides", () => {
    assert.deepStrictEqual(splitPromotionIdsByLookup([]), {
      byDocumentId: [],
      byField: [],
    });
  });
});

// まだ使える券だけを残す。ここが客の画面に出る券を決める。
describe("usablePromotions", () => {
  const coupon2 = (
    id: string,
    type: "discount" | "onetimeCoupon" | "multipletimesCoupon",
    usageRestrictions: boolean,
  ) => ({ id, type, usageRestrictions, data: { promotionId: id } });
  const ids = (list: { id: string }[]) => list.map((p) => p.id);

  // 履歴がまだ来ていないあいだは何も出さない。出すと、使い切った券が
  // 選べる状態で表示される。
  it("shows nothing until the history has arrived", () => {
    assert.deepStrictEqual(
      usablePromotions([coupon2("p1", "onetimeCoupon", true)], null),
      [],
    );
  });

  it("shows everything once the history arrives empty", () => {
    assert.deepStrictEqual(
      ids(usablePromotions([coupon2("p1", "onetimeCoupon", true)], {})),
      ["p1"],
    );
  });

  // 使用制限の無い券は履歴を見ない。
  it("keeps an unrestricted coupon whatever the history says", () => {
    assert.deepStrictEqual(
      ids(
        usablePromotions([coupon2("p1", "onetimeCoupon", false)], {
          p1: { used: true },
        }),
      ),
      ["p1"],
    );
  });

  it("drops a one-time coupon the customer has already used", () => {
    assert.deepStrictEqual(
      ids(
        usablePromotions([coupon2("p1", "onetimeCoupon", true)], {
          p1: { used: true },
        }),
      ),
      [],
    );
  });

  it("keeps a one-time coupon whose history says it is unused", () => {
    assert.deepStrictEqual(
      ids(
        usablePromotions([coupon2("p1", "onetimeCoupon", true)], {
          p1: { used: false },
        }),
      ),
      ["p1"],
    );
  });

  // 履歴が配列で入っているのは何度も使える券の形。一度きりの券にそれが来たら
  // 残す（判定できないので出しておく）。
  it("keeps a one-time coupon whose history came back as a list", () => {
    assert.deepStrictEqual(
      ids(
        usablePromotions([coupon2("p1", "onetimeCoupon", true)], {
          p1: [{ used: true }],
        }),
      ),
      ["p1"],
    );
  });

  // 値引き（discount）は履歴があるだけで落とす。使ったかどうかは見ない。
  it("drops a restricted discount as soon as any history exists", () => {
    assert.deepStrictEqual(
      ids(
        usablePromotions([coupon2("p1", "discount", true)], {
          p1: { used: false },
        }),
      ),
      [],
    );
    assert.deepStrictEqual(
      ids(usablePromotions([coupon2("p1", "discount", true)], {})),
      ["p1"],
    );
  });

  // **何度も使える券は、いまのところ値引きと同じ扱いに落ちている**（実装に TODO が
  // 残っていて、専用の分岐が空のまま）。履歴が1件でもあると出なくなる。
  it("currently treats a multi-use coupon like a discount, history and all", () => {
    assert.deepStrictEqual(
      ids(
        usablePromotions([coupon2("p1", "multipletimesCoupon", true)], {
          p1: [{ used: true }],
        }),
      ),
      [],
    );
    assert.deepStrictEqual(
      ids(usablePromotions([coupon2("p1", "multipletimesCoupon", true)], {})),
      ["p1"],
    );
  });

  it("judges each coupon on its own history", () => {
    const list = [
      coupon2("used", "onetimeCoupon", true),
      coupon2("fresh", "onetimeCoupon", true),
      coupon2("open", "onetimeCoupon", false),
    ];
    assert.deepStrictEqual(
      ids(usablePromotions(list, { used: { used: true } })),
      ["fresh", "open"],
    );
  });

  it("keeps the order it was given", () => {
    const list = [
      coupon2("a", "onetimeCoupon", false),
      coupon2("b", "onetimeCoupon", false),
      coupon2("c", "onetimeCoupon", false),
    ];
    assert.deepStrictEqual(ids(usablePromotions(list, {})), ["a", "b", "c"]);
  });
});
