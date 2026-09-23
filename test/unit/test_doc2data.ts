import { describe, it } from "node:test";
import assert from "node:assert";
import type { DocumentData } from "firebase/firestore";
import { doc2data } from "../../src/utils/utils.ts";

// Firestore から読むデータはほぼ全部ここを通る。id を書き足し、どの種類かの印を付ける。
// ここが狂うと、一覧から詳細へ飛べない・種類で分岐している画面が静かに壊れる。
//
// 引数の型が Firestore の snapshot 全体だったときは、この試験が書けなかった。
// 使うのは id と data() だけなので、型をその2つに狭めてある。

const snapshotOf = (id: string, data: DocumentData | undefined) => ({
  id,
  data: () => data,
});

describe("doc2data", () => {
  it("keeps the document's own fields", () => {
    const converted = doc2data("menu")(
      snapshotOf("abc", { itemName: "から揚げ", price: 500 }),
    );
    assert.strictEqual(converted.itemName, "から揚げ");
    assert.strictEqual(converted.price, 500);
  });

  // 一覧から詳細へ飛ぶのに id が要る。Firestore は data() に id を含めない。
  it("writes the document id into the data", () => {
    const converted = doc2data("menu")(
      snapshotOf("menu-1", { itemName: "あ" }),
    );
    assert.strictEqual(converted.id, "menu-1");
  });

  it("marks which kind of document it is", () => {
    assert.strictEqual(doc2data("menu")(snapshotOf("a", {}))._dataType, "menu");
    assert.strictEqual(
      doc2data("title")(snapshotOf("a", {}))._dataType,
      "title",
    );
  });

  // 消された文書は data() が undefined を返す。落ちずに、印だけ付いた空の値になる。
  it("turns a missing document into an empty one rather than throwing", () => {
    const converted = doc2data("menu")(snapshotOf("gone", undefined));
    assert.deepStrictEqual(converted, { id: "gone", _dataType: "menu" });
  });

  // 文書が id や _dataType という項目を持っていても、こちらが勝つ。
  it("overwrites an id the document happened to carry", () => {
    const converted = doc2data("menu")(
      snapshotOf("real-id", { id: "stale-id", itemName: "あ" }),
    );
    assert.strictEqual(converted.id, "real-id");
  });

  it("overwrites a _dataType the document happened to carry", () => {
    const converted = doc2data("menu")(
      snapshotOf("a", { _dataType: "something-else" }),
    );
    assert.strictEqual(converted._dataType, "menu");
  });

  // data() が返した object をそのまま書き換えて返す。呼び出し側が data() の結果を
  // 別に持っていると、そちらにも id と _dataType が付く。
  it("writes into the object data() returned, rather than copying it", () => {
    const original: Record<string, unknown> = { itemName: "あ" };
    const converted = doc2data("menu")({ id: "abc", data: () => original });
    assert.strictEqual(converted, original);
    assert.strictEqual(original.id, "abc");
  });

  // 種類ごとに1つ作って使い回す形。作った変換器が種類を覚えていること。
  it("remembers its kind across several documents", () => {
    const toMenu = doc2data("menu");
    assert.strictEqual(toMenu(snapshotOf("a", {}))._dataType, "menu");
    assert.strictEqual(toMenu(snapshotOf("b", {}))._dataType, "menu");
  });

  it("takes an empty document and an empty kind without throwing", () => {
    assert.deepStrictEqual(doc2data("")(snapshotOf("a", {})), {
      id: "a",
      _dataType: "",
    });
  });
});
