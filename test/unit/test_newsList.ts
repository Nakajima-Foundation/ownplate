import { describe, it } from "node:test";
import assert from "node:assert";

import {
  NewsEntry,
  newsByYear,
  newsSummary,
  newsVersion,
} from "../../src/utils/newsList.ts";

// 一覧は本文を開かずに中身が分かる必要がある。要約が空になると、題が全部
// 「vX.Y.Z をリリースしました。」なので、その回だけ何も語らない行になる。
describe("newsSummary", () => {
  it("takes the opening paragraph when there is one", () => {
    const markdown = [
      "## v4.1.0 (2026/10/23)",
      "",
      "店舗向けの通知に Web Push を追加しました。",
      "",
      "- 管理系",
      "  - 端末ごとに ON / OFF します",
    ].join("\n");
    assert.strictEqual(
      newsSummary(markdown),
      "店舗向けの通知に Web Push を追加しました。",
    );
  });

  it("joins a paragraph that was wrapped for readability", () => {
    const markdown = [
      "## v4.1.0 (2026/10/23)",
      "",
      "店舗向けの通知を追加しました。画面を閉じていても、",
      "新しい注文が端末に届きます。",
    ].join("\n");
    assert.strictEqual(
      newsSummary(markdown),
      "店舗向けの通知を追加しました。画面を閉じていても、新しい注文が端末に届きます。",
    );
  });

  it("names the category and its first item when there is no paragraph", () => {
    const markdown = [
      "## v4.0.1 (2026/05/05)",
      "",
      "- 管理系",
      "  - メニュー一覧で並べ替えに対応しました",
      "  - 画像の制限を表示するようにしました",
    ].join("\n");
    assert.strictEqual(
      newsSummary(markdown),
      "管理系: メニュー一覧で並べ替えに対応しました",
    );
  });

  // 古い回は分類そのものが字下げされている。桁で子を見分けると、分類だけを拾う。
  it("finds the item even when the whole list is indented", () => {
    const markdown = [
      "## v0.5.1 (2020/06/05)",
      "  - ユーザ系",
      "    - プロフィールページに「注文履歴」を追加",
    ].join("\n");
    assert.strictEqual(
      newsSummary(markdown),
      "ユーザ系: プロフィールページに「注文履歴」を追加",
    );
  });

  it("falls back to the category when it has no items", () => {
    assert.strictEqual(
      newsSummary("## v1.0.0 (2020/01/01)\n\n- 管理系"),
      "管理系",
    );
  });

  it("returns an empty summary for a body that is only a heading", () => {
    assert.strictEqual(newsSummary("## v1.0.0 (2020/01/01)\n\n"), "");
  });

  it("returns an empty summary for an empty body", () => {
    assert.strictEqual(newsSummary(""), "");
  });
});

describe("newsVersion", () => {
  it("reads the version off the title", () => {
    assert.strictEqual(newsVersion("v4.1.0 をリリースしました。"), "v4.1.0");
  });

  // 古い回は版と「を」のあいだに空白が無い。
  it("reads it when nothing separates it from the sentence", () => {
    assert.strictEqual(newsVersion("v3.0.6をリリースしました。"), "v3.0.6");
  });

  it("gives nothing when the title does not start with a version", () => {
    assert.strictEqual(newsVersion("サービスを開始しました。"), "");
    assert.strictEqual(newsVersion("version 4 をリリースしました。"), "");
    assert.strictEqual(newsVersion(""), "");
  });
});

const entry = (date: string): NewsEntry => ({
  title: "",
  date,
  markdown: "",
  summary: "",
  version: "",
});

describe("newsByYear", () => {
  it("keeps the order it was given", () => {
    const grouped = newsByYear(
      ["2026-10-23", "2026-05-05", "2025-11-29", "2020-05-11"].map(entry),
    );
    assert.deepStrictEqual(
      grouped.map((group) => [group.year, group.items.length]),
      [
        ["2026", 2],
        ["2025", 1],
        ["2020", 1],
      ],
    );
  });

  it("loses nothing", () => {
    const dates = ["2026-10-23", "2026-05-05", "2025-11-29", "2020-05-11"];
    const grouped = newsByYear(dates.map(entry));
    assert.deepStrictEqual(
      grouped.flatMap((group) => group.items.map((item) => item.date)),
      dates,
    );
  });

  it("gives nothing for an empty list", () => {
    assert.deepStrictEqual(newsByYear([]), []);
  });
});
