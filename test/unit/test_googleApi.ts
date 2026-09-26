import { describe, it } from "node:test";
import assert from "node:assert";

import { json_response } from "../../src/lib/google/api.ts";

// 住所検索の応答をほどく。成功の範囲を間違えると、失敗した応答の本文を
// 住所として読んでしまう（郵便番号から住所が入る画面がここを通る）。
//
// 引数は fetch の Response だが、使うのは status / statusText / json() の3つだけ。

const responseOf = (status: number, body: unknown, statusText = "") =>
  ({
    status,
    statusText,
    json: async () => body,
  }) as unknown as Response;

describe("json_response", () => {
  it("200 なら本文を返す", async () => {
    assert.deepStrictEqual(
      await json_response(responseOf(200, { status: "OK", results: [1] })),
      { status: "OK", results: [1] },
    );
  });

  // 成功の範囲は 200 以上 300 未満。両端を押さえる。
  it("299 までは本文を返す", async () => {
    assert.deepStrictEqual(await json_response(responseOf(299, { a: 1 })), {
      a: 1,
    });
  });

  it("300 からは投げる", async () => {
    await assert.rejects(
      () => json_response(responseOf(300, {}, "Multiple Choices")),
      /Multiple Choices/,
    );
  });

  it("199 以下も投げる", async () => {
    await assert.rejects(() => json_response(responseOf(199, {}, "Early")));
  });

  it("404 や 500 は statusText を載せて投げる", async () => {
    await assert.rejects(
      () => json_response(responseOf(404, {}, "Not Found")),
      /Not Found/,
    );
    await assert.rejects(
      () => json_response(responseOf(500, {}, "Internal Server Error")),
      /Internal Server Error/,
    );
  });

  // 本文が空でも 2xx なら通す。Google は結果0件でも 200 を返す。
  it("2xx なら本文が空でも通す", async () => {
    assert.deepStrictEqual(
      await json_response(
        responseOf(200, { status: "ZERO_RESULTS", results: [] }),
      ),
      { status: "ZERO_RESULTS", results: [] },
    );
  });
});
