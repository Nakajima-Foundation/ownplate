import { describe, it } from "node:test";
import assert from "node:assert";

import {
  extraCharges,
  isEmpty,
  isInclusiveTax,
  isNull,
  isReducedTaxRate,
  isValidInvoiceNumber,
  printableInvoiceNumber,
  taxCategories,
  taxDisplayRows,
} from "../../src/utils/commonUtils.ts";

describe("isReducedTaxRate", () => {
  // 画面の選択肢は「8% 軽減税率が適用される飲食料品」と「10% それ以外(酒、グッズなど)」。
  // 保存される値は後者だけが "alcohol" で、前者は別の値になる。
  it("treats alcohol as the standard rate", () => {
    assert.strictEqual(isReducedTaxRate({ tax: "alcohol" }), false);
  });

  it("treats food as the reduced rate", () => {
    assert.strictEqual(isReducedTaxRate({ tax: "food" }), true);
  });

  // 税区分が入っていない古いメニューは軽減税率として扱う。これは orderAccounting が
  // 同じ判定（"alcohol" 以外は foodTax）をしているのに合わせたもので、印だけが
  // 食い違うと「8%対象なのに ※ が無い」行ができる。
  it("matches what the tax calculation does for an item with no category", () => {
    assert.strictEqual(isReducedTaxRate({}), true);
    assert.strictEqual(isReducedTaxRate({ tax: "" }), true);
    assert.strictEqual(isReducedTaxRate(undefined), true);
  });
});

describe("isValidInvoiceNumber", () => {
  const valid = "T1234567890123";

  it("accepts the legal shape", () => {
    assert.strictEqual(isValidInvoiceNumber(valid), true);
  });

  // 免税事業者は番号を持たない。必須にすると入力欄で詰まる。
  it("accepts an unset number", () => {
    assert.strictEqual(isValidInvoiceNumber(undefined), true);
    assert.strictEqual(isValidInvoiceNumber(""), true);
  });

  it("rejects a wrong digit count", () => {
    assert.strictEqual(isValidInvoiceNumber("T123456789012"), false);
    assert.strictEqual(isValidInvoiceNumber("T12345678901234"), false);
  });

  it("rejects a missing or lowercase prefix", () => {
    assert.strictEqual(isValidInvoiceNumber("1234567890123"), false);
    assert.strictEqual(isValidInvoiceNumber("t1234567890123"), false);
  });

  it("rejects the separators people actually type", () => {
    assert.strictEqual(isValidInvoiceNumber("T123456789012X"), false);
    assert.strictEqual(isValidInvoiceNumber("T1234-5678-90123"), false);
    assert.strictEqual(isValidInvoiceNumber("T 1234567890123"), false);
  });

  // 空白は弾く。通すと空白つきの番号がそのまま請求書に印字される。
  it("rejects surrounding whitespace rather than trimming it", () => {
    assert.strictEqual(isValidInvoiceNumber(` ${valid}`), false);
    assert.strictEqual(isValidInvoiceNumber(`${valid}\n`), false);
  });
});

describe("printableInvoiceNumber", () => {
  const valid = "T1234567890123";

  it("returns the number when it is set and well formed", () => {
    assert.strictEqual(printableInvoiceNumber(valid), valid);
  });

  // ここが「印字してよいか」を1箇所で決める。呼び出し側が && を重ねなくて済む。
  // 重ねる形だと、片方を消したときに「登録番号：」だけの行が出る。
  it("returns nothing for an unset number", () => {
    assert.strictEqual(printableInvoiceNumber(undefined), null);
    assert.strictEqual(printableInvoiceNumber(""), null);
  });

  it("returns nothing for a malformed number", () => {
    ["T123", "1234567890123", "t1234567890123", " " + valid].forEach(
      (value) => {
        assert.strictEqual(printableInvoiceNumber(value), null);
      },
    );
  });

  // Firestore を直接書けば文字列以外も入る。RegExp.test() は引数を文字列化するので、
  // [valid] は形の検査を通ってしまう。そのまま返すと印字側（文字列を前提にしている）
  // がそこで落ち、その店舗のレシートが一枚も出なくなる。
  it("returns nothing for a value that is not a string", () => {
    [
      [valid],
      [[valid]],
      1234567890123,
      { toString: () => valid },
      true,
    ].forEach((value) => {
      assert.strictEqual(printableInvoiceNumber(value), null);
    });
  });

  it("rejects a non-string in the form validation too", () => {
    assert.strictEqual(isValidInvoiceNumber([valid]), false);
  });

  // isValidInvoiceNumber は空を通す（入力欄で必須にしないため）。
  // 印字の可否はそれとは別の判断で、この2つが混ざったのが元の欠陥だった。
  it("differs from isValidInvoiceNumber precisely on the empty case", () => {
    assert.strictEqual(isValidInvoiceNumber(""), true);
    assert.strictEqual(printableInvoiceNumber(""), null);
  });
});

describe("isInclusiveTax", () => {
  // 金額は注文時の設定で計算されて凍結されている。店舗の現在値を見ると、
  // 店舗が後から切り替えたときに金額と食い違う札を貼ることになる。
  it("takes the order's own setting over the restaurant's current one", () => {
    assert.strictEqual(
      isInclusiveTax({ inclusiveTax: true }, { inclusiveTax: false }),
      true,
    );
    assert.strictEqual(
      isInclusiveTax({ inclusiveTax: false }, { inclusiveTax: true }),
      false,
    );
  });

  // 古い注文は inclusiveTax を持たない（accounting と同じ場所で書かれる）。
  it("falls back to the restaurant when the order has no setting", () => {
    assert.strictEqual(isInclusiveTax({}, { inclusiveTax: true }), true);
    assert.strictEqual(isInclusiveTax({}, { inclusiveTax: false }), false);
  });

  // ここが ?? である理由。|| だと「外税で保存された注文」が false を偽と見なされて
  // 店舗の設定に落ち、税込の店舗では内税と書かれる。
  it("keeps an explicit false rather than falling through to the restaurant", () => {
    assert.strictEqual(
      isInclusiveTax({ inclusiveTax: false }, { inclusiveTax: true }),
      false,
    );
  });

  it("is exclusive when neither says anything", () => {
    assert.strictEqual(isInclusiveTax({}, {}), false);
  });
});

describe("extraCharges", () => {
  it("returns a line for each amount the order actually carries", () => {
    assert.deepStrictEqual(
      extraCharges({ shippingCost: 200, discountPrice: 150 }),
      [
        { kind: "shipping", amount: 200 },
        { kind: "discount", amount: 150 },
      ],
    );
  });

  // 0円 の行は出さない。いまどちらの書類にも行が無いので、増やすと紙が伸びる。
  it("leaves out an amount that is zero or absent", () => {
    assert.deepStrictEqual(extraCharges({}), []);
    assert.deepStrictEqual(
      extraCharges({ shippingCost: 0, discountPrice: 0 }),
      [],
    );
    assert.deepStrictEqual(extraCharges({ shippingCost: 200 }), [
      { kind: "shipping", amount: 200 },
    ]);
  });

  // Firestore の生データなので数値とは限らない。"5" > 0 は真になるので、
  // そのまま通すと金額の行に文字列がそのまま出る。
  it("ignores an amount that is not a finite number", () => {
    ["200", null, undefined, NaN, Infinity, {}, [200]].forEach((value) => {
      assert.deepStrictEqual(extraCharges({ shippingCost: value }), []);
    });
  });

  // どちらの金額かは kind で決まる。割引は合計から引かれるので、
  // 出すときに符号を付けるのは描画側の仕事。
  it("says which amount each line is", () => {
    assert.strictEqual(extraCharges({ shippingCost: 1 })[0].kind, "shipping");
    assert.strictEqual(extraCharges({ discountPrice: 1 })[0].kind, "discount");
  });
});

describe("taxDisplayRows", () => {
  const food = { revenue: 1000, tax: 74 };
  const alcohol = { revenue: 500, tax: 45 };

  it("returns one row per rate that has revenue", () => {
    assert.deepStrictEqual(taxDisplayRows({ food, alcohol }, 8, 10, 119), [
      { kind: "category", rate: 8, revenue: 1000, tax: 74 },
      { kind: "category", rate: 10, revenue: 500, tax: 45 },
    ]);
  });

  // 酒だけの注文。両方渡す case では順番が入れ替わりを隠すので、片方だけも見る。
  it("puts the alcohol revenue against the alcohol rate", () => {
    assert.deepStrictEqual(taxDisplayRows({ alcohol }, 8, 10, 45), [
      { kind: "category", rate: 10, revenue: 500, tax: 45 },
    ]);
  });

  it("takes the rates from the caller rather than assuming 8 and 10", () => {
    assert.deepStrictEqual(taxDisplayRows({ food }, 1, 10, 74), [
      { kind: "category", rate: 1, revenue: 1000, tax: 74 },
    ]);
  });

  // 区分に入れるかどうかは売上で決める。税額で決めると、売上0で税額だけある区分が
  // 「0%対象 | ¥0」の行になって、その税率の取引があったように読める。
  it("leaves out a category that has tax but no revenue", () => {
    assert.deepStrictEqual(
      taxDisplayRows({ food: { revenue: 0, tax: 74 } }, 8, 10, 119),
      [{ kind: "total", tax: 119 }],
    );
  });

  // ここが一番の要点。空配列を返すと、呼ぶ側が「何も出さない」を選べてしまう。
  // 実際 PDF がそうなっていて、古い注文の請求書から消費税の記載が消えていた。
  it("never returns an empty list, so no renderer can print nothing", () => {
    [undefined, {}, { food: { revenue: 0, tax: 0 } }].forEach((accounting) => {
      const rows = taxDisplayRows(accounting, 8, 10, 119);
      assert.strictEqual(rows.length, 1);
      assert.deepStrictEqual(rows[0], { kind: "total", tax: 119 });
    });
  });

  // どちらの行かは kind だけで決まる。率の値で見分けていたときは、foodTax が null で
  // 保存されているだけで区分のある注文が合計1行に化け、対象 の行が黙って消えた。
  // kind は関数が書く値なので、注文や店舗のデータでは偽装できない。
  it("marks the two kinds of row with a field no data value supplies", () => {
    taxDisplayRows({ food, alcohol }, 8, 10, 119).forEach((row) => {
      assert.strictEqual(row.kind, "category");
    });
    assert.strictEqual(taxDisplayRows(undefined, 8, 10, 119)[0].kind, "total");
  });
});

// 「空か」の判定。入力欄の検証と表示の分岐に使う。
// isNull と違って、値を文字列にしてから空かどうかを見る。
describe("isNull", () => {
  it("says yes only for null and undefined", () => {
    assert.strictEqual(isNull(null), true);
    assert.strictEqual(isNull(undefined), true);
  });

  it("says no for everything else, including the falsy ones", () => {
    [0, "", false, NaN, [], {}, "text"].forEach((value) => {
      assert.strictEqual(
        isNull(value),
        false,
        JSON.stringify(value) ?? String(value),
      );
    });
  });
});

describe("isEmpty", () => {
  it("says yes for null and undefined", () => {
    assert.strictEqual(isEmpty(null), true);
    assert.strictEqual(isEmpty(undefined), true);
  });

  it("says yes for the empty string", () => {
    assert.strictEqual(isEmpty(""), true);
  });

  // 空配列は String([]) が "" なので空として扱われる。
  it("says yes for an empty array, because it reads as an empty string", () => {
    assert.strictEqual(isEmpty([]), true);
  });

  // 0 と false は空ではない。空として扱うと「0円」「無効」が未入力になる。
  it("says no for zero and false", () => {
    assert.strictEqual(isEmpty(0), false);
    assert.strictEqual(isEmpty(false), false);
  });

  it("says no for ordinary values", () => {
    ["text", " ", 1, -1, [0], {}, NaN].forEach((value) => {
      assert.strictEqual(isEmpty(value), false, String(value));
    });
  });
});

// 税率ごとの区分。売上の無い区分は行として出さない。
describe("taxCategories の境目", () => {
  it("drops a category whose revenue is zero", () => {
    const rows = taxCategories({ food: { revenue: 0, tax: 0 } }, 8, 10);
    assert.deepStrictEqual(rows, []);
  });

  // 1円でも売上があれば出す。ここを > 1 にすると、1円の区分が消える。
  it("keeps a category whose revenue is one yen", () => {
    const rows = taxCategories({ food: { revenue: 1, tax: 0 } }, 8, 10);
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].revenue, 1);
  });

  // 税額が入っていない古い注文。0 として扱う。1 などに化けると帳簿が狂う。
  it("reads a missing tax as zero, not as anything else", () => {
    const rows = taxCategories({ food: { revenue: 100 } }, 8, 10);
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].tax, 0);
  });

  it("reads a missing revenue as zero, so the category drops out", () => {
    assert.deepStrictEqual(taxCategories({ food: { tax: 50 } }, 8, 10), []);
  });

  it("keeps both categories when both have revenue", () => {
    const rows = taxCategories(
      { food: { revenue: 100, tax: 8 }, alcohol: { revenue: 200, tax: 20 } },
      8,
      10,
    );
    assert.strictEqual(rows.length, 2);
    assert.deepStrictEqual(
      rows.map((r) => r.rate),
      [8, 10],
    );
  });

  it("gives nothing back for an order with no accounting at all", () => {
    assert.deepStrictEqual(taxCategories(undefined, 8, 10), []);
  });
});
