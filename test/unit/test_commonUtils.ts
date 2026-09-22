import { describe, it } from "node:test";
import assert from "node:assert";

import {
  isReducedTaxRate,
  isValidInvoiceNumber,
  printableInvoiceNumber,
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
    [[valid], [[valid]], 1234567890123, { toString: () => valid }, true].forEach(
      (value) => {
        assert.strictEqual(printableInvoiceNumber(value), null);
      },
    );
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
