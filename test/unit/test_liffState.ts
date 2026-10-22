import { describe, it } from "node:test";
import assert from "node:assert";
import { classifyOS, parseLiffState } from "../../src/utils/liffState.ts";

// query-string が返すのはプロトタイプの無い object。deepStrictEqual は
// プロトタイプまで見るので、比べる前に自分の鍵だけを写す。
const own = (value: unknown) => ({ ...(value as object) });

// LINE から戻ってくる liff.state を読む。ここが狂うと、PC から開いたときの
// 転送先が変わる（LiffWrapper が liffStatePath で転送 URL を組み立てている）。
//
// **返る形が入力によって2通りある。** 空なら鍵が1つも無い object、それ以外なら
// liffStatePath と liffStateQuery の2つ。読む側は liffStateQuery の有無で
// 見分けているので、この違い自体が守るべき約束になる。

describe("parseLiffState", () => {
  it("空のときは鍵を1つも返さない", () => {
    assert.deepStrictEqual(parseLiffState(""), {});
    assert.deepStrictEqual(Object.keys(parseLiffState("")), []);
  });

  it("問い合わせが無いときは経路と空の問い合わせを返す", () => {
    assert.deepStrictEqual(parseLiffState("/r/123"), {
      liffStatePath: "/r/123",
      liffStateQuery: {},
    });
  });

  it("問い合わせを読む", () => {
    const parsed = parseLiffState("/r/123?redirect=1");
    assert.strictEqual(parsed.liffStatePath, "/r/123");
    assert.deepStrictEqual(own(parsed.liffStateQuery), { redirect: "1" });
  });

  // 最初の ? だけで割る。2つめ以降は問い合わせ側の文字として残る。
  it("? が複数あっても最初の1つで割る", () => {
    const parsed = parseLiffState("a?b?c=1");
    assert.strictEqual(parsed.liffStatePath, "a");
    assert.deepStrictEqual(own(parsed.liffStateQuery), { b: null });
  });

  it("? で始まるときは経路が空文字になる", () => {
    const parsed = parseLiffState("?redirect=1");
    assert.strictEqual(parsed.liffStatePath, "");
    assert.deepStrictEqual(own(parsed.liffStateQuery), { redirect: "1" });
  });

  it("値の無い鍵は null になる", () => {
    assert.deepStrictEqual(own(parseLiffState("/r/1?a").liffStateQuery), {
      a: null,
    });
  });

  it("同じ鍵が2回来たら配列になる", () => {
    assert.deepStrictEqual(own(parseLiffState("/r/1?a=1&a=2").liffStateQuery), {
      a: ["1", "2"],
    });
  });

  it("符号化された文字を戻す", () => {
    const parsed = parseLiffState("/a%20b?x=%E3%81%82");
    assert.strictEqual(parsed.liffStatePath, "/a%20b");
    assert.deepStrictEqual(own(parsed.liffStateQuery), { x: "あ" });
  });

  // 落ちないことが要る。ここで投げると LIFF の入口ごと死ぬ。
  it("空に相当する値を渡しても投げない", () => {
    [undefined, null, 0, false, NaN].forEach((value) => {
      assert.deepStrictEqual(
        parseLiffState(value as unknown as string),
        {},
        `${String(value)} で形が変わった`,
      );
    });
  });

  // 試し測りで使った組み合わせをそのまま残す。全部について、
  // 「空なら鍵0個、そうでなければ必ず2個」が成り立つ。
  it("どの組み合わせでも鍵の数は 0 個か 2 個のどちらか", () => {
    const paths = ["", "/", "/r/123", "no-slash", "/日本語", "/a%20b"];
    const queries = [null, "", "redirect=1", "a=1&b=2", "?", "a", "=1"];
    let checked = 0;
    paths.forEach((path) =>
      queries.forEach((query) => {
        const input = query === null ? path : `${path}?${query}`;
        const keys = Object.keys(parseLiffState(input));
        assert.ok(
          keys.length === 0 || keys.length === 2,
          `${JSON.stringify(input)} で鍵が ${keys.length} 個`,
        );
        if (keys.length === 2) {
          assert.deepStrictEqual(keys.sort(), [
            "liffStatePath",
            "liffStateQuery",
          ]);
        }
        checked++;
      }),
    );
    assert.strictEqual(checked, paths.length * queries.length);
  });

  // ここを取り違えると、鍵の有無を hasOwnProperty で見た瞬間に落ちる。
  it("問い合わせはプロトタイプを持たない", () => {
    const query = parseLiffState("/r/1?a=1").liffStateQuery;
    assert.strictEqual(Object.getPrototypeOf(query), null);
  });
});

describe("classifyOS", () => {
  it("3つの OS をそれぞれ1つだけ真にする", () => {
    assert.deepStrictEqual(classifyOS("android"), {
      os: "android",
      isAndroid: true,
      isIOS: false,
      isWeb: false,
    });
    assert.deepStrictEqual(classifyOS("ios"), {
      os: "ios",
      isAndroid: false,
      isIOS: true,
      isWeb: false,
    });
    assert.deepStrictEqual(classifyOS("web"), {
      os: "web",
      isAndroid: false,
      isIOS: false,
      isWeb: true,
    });
  });

  // 大小を区別する。LINE が返すのは小文字。
  it("知らない値ならどれも真にならない", () => {
    ["IOS", "Android", "windows", "", undefined].forEach((os) => {
      const result = classifyOS(os);
      assert.deepStrictEqual(
        [result.isAndroid, result.isIOS, result.isWeb],
        [false, false, false],
        `${String(os)} でどれかが真になった`,
      );
      assert.strictEqual(result.os, os);
    });
  });
});
