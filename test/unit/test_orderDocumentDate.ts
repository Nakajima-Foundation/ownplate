import { describe, it } from "node:test";
import assert from "node:assert";

import { orderDocumentDate } from "../../src/utils/orderDocumentDate.ts";

const stamp = (iso: string) => ({ toDate: () => new Date(iso) });

const estimated = stamp("2026-09-22T03:00:00Z");
const requested = stamp("2026-09-22T09:00:00Z");

describe("orderDocumentDate", () => {
  it("uses the restaurant's confirmed handover time when the order was accepted", () => {
    const result = orderDocumentDate({
      timeEstimated: estimated,
      timePlaced: requested,
    });
    assert.deepStrictEqual(result, {
      kind: "estimated",
      at: new Date("2026-09-22T03:00:00Z"),
    });
  });

  // timeEstimated は受付時にしか書かれない。受付前にキャンセルされた注文でも
  // 印刷できるので、ここで null を返すと取引年月日の無い書類が出る。
  it("falls back to the requested handover time when the order was never accepted", () => {
    const result = orderDocumentDate({ timePlaced: requested });
    assert.deepStrictEqual(result, {
      kind: "requested",
      at: new Date("2026-09-22T09:00:00Z"),
    });
  });

  // どちらの時刻かは kind で決まる。日付の値では見分けられない。
  it("says which of the two times it returned", () => {
    assert.strictEqual(
      orderDocumentDate({ timeEstimated: estimated })?.kind,
      "estimated",
    );
    assert.strictEqual(
      orderDocumentDate({ timePlaced: requested })?.kind,
      "requested",
    );
  });

  it("returns nothing when the order carries neither time", () => {
    assert.strictEqual(orderDocumentDate({}), null);
  });

  // Firestore を直接書けば Timestamp でない値も入る。toDate を持たない値を
  // そのまま返すと、描画側（moment に渡す）がそこで落ちる。
  it("ignores a value that is not a timestamp", () => {
    [null, undefined, "2026-09-22", 1758510000, {}, { toDate: "no" }].forEach(
      (value) => {
        assert.strictEqual(orderDocumentDate({ timeEstimated: value }), null);
      },
    );
  });

  it("still falls back when only the accepted time is malformed", () => {
    const result = orderDocumentDate({
      timeEstimated: "2026-09-22",
      timePlaced: requested,
    });
    assert.strictEqual(result?.kind, "requested");
  });
});
