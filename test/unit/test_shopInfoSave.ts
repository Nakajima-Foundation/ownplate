import { describe, it } from "node:test";
import assert from "node:assert";

import { getEditShopInfo } from "../../src/utils/admin/shopInfoPayload.ts";

// getEditShopInfo は保存する値の「許可リスト」で、ここに無いフィールドは
// 画面で編集できても Firestore に書かれない。入力も検証も通り、保存も成功したように
// 見えるので、抜けていても気づけない。実際 invoiceNumber が抜けていて、機能が
// 丸ごと死んでいるのにテストは緑だった。
const shopInfo = (extra = {}) => ({
  restaurantName: "テスト店",
  ownerName: "山田",
  streetAddress: "1-2-3",
  city: "渋谷区",
  state: "東京都",
  zip: "1500001",
  phoneNumber: "0312345678",
  foodTax: 8,
  alcoholTax: 10,
  openTimes: {},
  temporaryClosure: [],
  ...extra,
});

describe("getEditShopInfo", () => {
  it("carries the invoice registration number through to the saved payload", () => {
    const saved = getEditShopInfo(
      shopInfo({ invoiceNumber: "T1234567890123" }),
    );
    assert.strictEqual(saved.invoiceNumber, "T1234567890123");
  });

  it("carries an empty number through rather than dropping the key", () => {
    const saved = getEditShopInfo(shopInfo({ invoiceNumber: "" }), "NOW");
    assert.strictEqual(saved.invoiceNumber, "");
  });

  // 許可リストなので、隣にある税率も同じ性質を持つ。片方だけ通ると
  // 「保存したのに戻る」が起きる。
  it("carries the tax rates, which sit beside it in the same list", () => {
    const saved = getEditShopInfo(
      shopInfo({ foodTax: 1, alcoholTax: 10 }),
      "NOW",
    );
    assert.strictEqual(saved.foodTax, 1);
    assert.strictEqual(saved.alcoholTax, 10);
  });
});

describe("getEditShopInfo — 時刻の注入", () => {
  // Firestore の serverTimestamp をこの中で呼ぶと、ファイルが Firebase に依存して
  // 単体テストから読めなくなる。呼び出し側から渡す形にしてある。
  it("uses the timestamp it is handed", () => {
    const saved = getEditShopInfo(shopInfo(), "NOW");
    assert.strictEqual(saved.updatedAt, "NOW");
    assert.strictEqual(saved.createdAt, "NOW");
  });

  it("keeps an existing creation time rather than overwriting it", () => {
    const saved = getEditShopInfo(shopInfo({ createdAt: "ORIGINAL" }), "NOW");
    assert.strictEqual(saved.createdAt, "ORIGINAL");
    assert.strictEqual(saved.updatedAt, "NOW");
  });
});
