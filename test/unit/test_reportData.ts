import { describe, it } from "node:test";
import assert from "node:assert";

import { order2ReportData } from "../../src/models/orderInfo.ts";
import { orderInfoFixture, timestampOf } from "../fixtures/orderInfo.ts";

// 売上報告と書き出しの一行分。店舗が売上を数え、税を申告するのに使う。
// 注文を **その場で書き換えて** 返すので、渡した側の値も変わる。
const SERVICE_TAX_RATE = 0.1;

describe("order2ReportData — 心づけにかかる税", () => {
  const serviceTaxOf = (tip: number) =>
    order2ReportData(orderInfoFixture({ tip }), SERVICE_TAX_RATE).accounting
      ?.service;

  // 心づけは税込で受け取っている。そこから税の分を割り出す。
  it("takes the tax out of the tip, rather than adding it on top", () => {
    const service = serviceTaxOf(110);
    assert.strictEqual(service?.revenue, 110);
    assert.strictEqual(service?.tax, 10);
  });

  it("rounds the tax to whole yen", () => {
    assert.strictEqual(serviceTaxOf(100)?.tax, 9);
    assert.strictEqual(serviceTaxOf(1)?.tax, 0);
  });

  it("charges no tax on no tip", () => {
    const service = serviceTaxOf(0);
    assert.strictEqual(service?.revenue, 0);
    assert.strictEqual(service?.tax, 0);
  });

  it("follows the rate it is handed", () => {
    const untaxed = order2ReportData(orderInfoFixture({ tip: 110 }), 0);
    assert.strictEqual(untaxed.accounting?.service?.tax, 0);
  });

  // 心づけの行は、税の区分がすでにある注文にも足される。無いと申告の合計が合わない。
  it("adds the tip line even to an order that already has a breakdown", () => {
    const withBreakdown = order2ReportData(
      orderInfoFixture({
        tip: 110,
        accounting: {
          food: { revenue: 1000, tax: 74 },
          alcohol: { revenue: 500, tax: 45 },
        },
      }),
      SERVICE_TAX_RATE,
    );
    assert.strictEqual(withBreakdown.accounting?.food.revenue, 1000);
    assert.strictEqual(withBreakdown.accounting?.service?.revenue, 110);
  });
});

// 区分を持たない古い注文。持たないまま出すと、税率ごとの内訳が報告から消える。
describe("order2ReportData — 区分の無い注文", () => {
  const withoutBreakdown = (total: number, tax: number) =>
    order2ReportData(
      orderInfoFixture({ accounting: undefined, total, tax, tip: 0 }),
      SERVICE_TAX_RATE,
    );

  it("treats the whole order as food, with the tax it recorded", () => {
    const report = withoutBreakdown(1080, 80);
    assert.strictEqual(report.accounting?.food.revenue, 1000);
    assert.strictEqual(report.accounting?.food.tax, 80);
  });

  it("records no alcohol for an order it cannot split", () => {
    const report = withoutBreakdown(1080, 80);
    assert.strictEqual(report.accounting?.alcohol.revenue, 0);
    assert.strictEqual(report.accounting?.alcohol.tax, 0);
  });

  it("copes with an order that carried no tax", () => {
    const report = withoutBreakdown(1000, 0);
    assert.strictEqual(report.accounting?.food.revenue, 1000);
    assert.strictEqual(report.accounting?.food.tax, 0);
  });
});

describe("order2ReportData — 受渡方法", () => {
  const typeOf = (extra: Parameters<typeof orderInfoFixture>[0]) =>
    order2ReportData(orderInfoFixture(extra), SERVICE_TAX_RATE).type;

  it("names the handover method on the row", () => {
    assert.strictEqual(typeOf({}), "Takeout");
    assert.strictEqual(typeOf({ isDelivery: true }), "Delivery");
    assert.strictEqual(typeOf({ isEC: true }), "EC");
  });
});

// 日時は Firestore の形のままでは表計算に出せないので、Date へ直す。
describe("order2ReportData — 日時", () => {
  it("turns the recorded times into dates", () => {
    const report = order2ReportData(orderInfoFixture(), SERVICE_TAX_RATE);
    assert.ok(report.timeConfirmed instanceof Date);
    assert.ok(report.timePlaced instanceof Date);
    assert.ok(report.timeEstimated instanceof Date);
  });

  it("keeps the moment, not just the shape", () => {
    const placed = timestampOf("2026-09-22T09:00:00Z");
    const report = order2ReportData(
      orderInfoFixture({ timePlaced: placed }),
      SERVICE_TAX_RATE,
    );
    assert.strictEqual(
      new Date(String(report.timePlaced)).toISOString(),
      "2026-09-22T09:00:00.000Z",
    );
  });

  // 受け付けられなかった注文は確定時刻を持たない。落ちずに空のまま出す。
  it("leaves an order with no confirmed time alone", () => {
    const report = order2ReportData(
      orderInfoFixture({ timeConfirmed: undefined }),
      SERVICE_TAX_RATE,
    );
    assert.strictEqual(report.timeConfirmed, undefined);
  });
});

// その場で書き換える。同じ注文を二度渡す呼び出し側は、二度目に別の値を渡している。
describe("order2ReportData — 引数を書き換えること", () => {
  it("hands back the very object it was given", () => {
    const order = orderInfoFixture({ tip: 110 });
    assert.strictEqual(order2ReportData(order, SERVICE_TAX_RATE), order);
  });

  it("leaves the dates converted on the caller's own order", () => {
    const order = orderInfoFixture();
    order2ReportData(order, SERVICE_TAX_RATE);
    assert.ok(order.timePlaced instanceof Date);
  });

  // **二度通せない。** 一度目で日時を Date に直すので、二度目は toDate が無くて落ちる。
  // いまの呼び出し側は Firestore の snapshot から毎回 data() で新しい実体を作るため
  // 起きないが、同じ注文を使い回す呼び出しを足すと落ちる。
  it("cannot be run twice over one and the same order", () => {
    const order = orderInfoFixture({ tip: 110 });
    order2ReportData(order, SERVICE_TAX_RATE);
    assert.throws(
      () => order2ReportData(order, SERVICE_TAX_RATE),
      TypeError,
      "二度目は日時を直せない",
    );
  });
});
