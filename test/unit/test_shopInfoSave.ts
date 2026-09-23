import { describe, it } from "node:test";
import assert from "node:assert";

import {
  getCopyShopInfo,
  getEditShopInfo,
} from "../../src/utils/admin/shopInfoPayload.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// getEditShopInfo は保存する値の「許可リスト」で、ここに無いフィールドは
// 画面で編集できても Firestore に書かれない。入力も検証も通り、保存も成功したように
// 見えるので、抜けていても気づけない。実際 invoiceNumber が抜けていて、機能が
// 丸ごと死んでいるのにテストは緑だった。
const shopInfo = restaurantInfoFixture;

describe("getEditShopInfo", () => {
  it("carries the invoice registration number through to the saved payload", () => {
    const saved = getEditShopInfo(
      shopInfo({ invoiceNumber: "T1234567890123" }),
      "NOW",
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

  // 新規の店舗は createdAt を持たない（defaultShopInfo に無い）。
  // 型の上では必須なので、その形を作るには明示的に外す必要がある。
  it("uses the timestamp it is handed when the restaurant has no creation time", () => {
    const saved = getEditShopInfo(shopInfo({ createdAt: undefined }), "NOW");
    assert.strictEqual(saved.updatedAt, "NOW");
    assert.strictEqual(saved.createdAt, "NOW");
  });

  it("keeps an existing creation time rather than overwriting it", () => {
    const original = new Date("2019-05-06T00:00:00Z");
    const saved = getEditShopInfo(shopInfo({ createdAt: original }), "NOW");
    assert.strictEqual(saved.createdAt, original);
    assert.strictEqual(saved.updatedAt, "NOW");
  });
});

describe("getCopyShopInfo", () => {
  const copied = () =>
    getCopyShopInfo(
      getEditShopInfo(
        shopInfo({ invoiceNumber: "T1234567890123", publicFlag: true }),
        "NOW",
      ),
      "COPY_NOW",
    );

  // 登録番号は事業者に紐づく。複製先に引き継ぐと、登録を受けていない事業者の
  // レシートと請求書に他人の番号が載る。
  it("does not carry the invoice registration number into the copy", () => {
    assert.strictEqual(copied().invoiceNumber, "");
  });

  it("resets what must not carry over and keeps the rest", () => {
    const saved = copied();
    assert.strictEqual(saved.publicFlag, false);
    assert.strictEqual(saved.deletedFlag, false);
    assert.strictEqual(saved.createdAt, "COPY_NOW");
    assert.strictEqual(saved.restaurantName, "テスト店");
  });
});

// 営業時間は開始の早い順に並べて保存する。並べずに保存すると、店舗ページの営業時間が
// 入力した順のまま出る（昼の部と夜の部が入れ替わって見える）。
describe("getEditShopInfo — 営業時間", () => {
  const savedTimes = (times: { start: number; end: number }[]) =>
    getEditShopInfo(shopInfo({ openTimes: { "1": times } }), "NOW").openTimes[
      "1"
    ];

  it("orders the day's slots by when they start", () => {
    assert.deepStrictEqual(
      savedTimes([
        { start: 1020, end: 1320 },
        { start: 660, end: 840 },
      ]),
      [
        { start: 660, end: 840 },
        { start: 1020, end: 1320 },
      ],
    );
  });

  it("leaves an already-ordered day alone", () => {
    assert.deepStrictEqual(
      savedTimes([
        { start: 660, end: 840 },
        { start: 1020, end: 1320 },
      ]),
      [
        { start: 660, end: 840 },
        { start: 1020, end: 1320 },
      ],
    );
  });

  it("keeps a day with a single slot, and a day with none", () => {
    assert.deepStrictEqual(savedTimes([{ start: 660, end: 840 }]), [
      { start: 660, end: 840 },
    ]);
    assert.deepStrictEqual(savedTimes([]), []);
  });

  // 曜日ごとに別々。まとめて扱うと、ある曜日の時間が他の曜日にも出る。
  it("sorts each day of the week on its own", () => {
    const saved = getEditShopInfo(
      shopInfo({
        openTimes: {
          "1": [
            { start: 1020, end: 1320 },
            { start: 660, end: 840 },
          ],
          "2": [{ start: 540, end: 780 }],
        },
      }),
      "NOW",
    ).openTimes;
    assert.deepStrictEqual(Object.keys(saved), ["1", "2"]);
    assert.strictEqual(saved["1"][0].start, 660);
    assert.strictEqual(saved["2"][0].start, 540);
  });
});

// 未設定の項目。Firestore は undefined を書けないので、空の値に置き換えて保存する。
// 置き換えを外すと保存そのものが失敗する。
describe("getEditShopInfo — 未設定の項目", () => {
  it("saves an empty object for a shop with no payment methods", () => {
    assert.deepStrictEqual(
      getEditShopInfo(shopInfo({ paymentMethods: undefined }), "NOW")
        .paymentMethods,
      {},
    );
  });

  it("carries the payment methods a shop has set", () => {
    assert.deepStrictEqual(
      getEditShopInfo(shopInfo({ paymentMethods: { stripe: true } }), "NOW")
        .paymentMethods,
      { stripe: true },
    );
  });

  it("saves empty objects for a shop with no images", () => {
    const saved = getEditShopInfo(shopInfo({ images: undefined }), "NOW");
    assert.deepStrictEqual(saved.images, { cover: {}, profile: {} });
  });

  it("treats an unset lunch/dinner switch as off", () => {
    assert.strictEqual(
      getEditShopInfo(shopInfo({ enableLunchDinner: undefined }), "NOW")
        .enableLunchDinner,
      false,
    );
    assert.strictEqual(
      getEditShopInfo(shopInfo({ enableLunchDinner: true }), "NOW")
        .enableLunchDinner,
      true,
    );
  });

  it("saves null rather than nothing for an unset last-order time", () => {
    assert.strictEqual(
      getEditShopInfo(shopInfo({ lastOrderTime: undefined }), "NOW")
        .lastOrderTime,
      null,
    );
    assert.strictEqual(
      getEditShopInfo(shopInfo({ lastOrderTime: 60 }), "NOW").lastOrderTime,
      60,
    );
  });
});
