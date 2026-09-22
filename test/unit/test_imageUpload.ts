import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

import {
  imageUploadRejection,
  maxImageUploadBytes,
  maxImageUploadMegaBytes,
} from "../../src/utils/imageUpload.ts";

const file = (type: string, size: number) => ({ type, size });

describe("imageUploadRejection", () => {
  it("accepts an image within the limit", () => {
    assert.strictEqual(imageUploadRejection(file("image/jpeg", 1024)), null);
    assert.strictEqual(imageUploadRejection(file("image/png", 1024)), null);
  });

  // ルールは <= なので、ちょうどの大きさは通る。ここを > で書くと、
  // 境界の画像だけ画面では弾かれるのに Storage は受け取る、という食い違いになる。
  it("accepts a file exactly at the limit", () => {
    assert.strictEqual(
      imageUploadRejection(file("image/jpeg", maxImageUploadBytes)),
      null,
    );
  });

  it("rejects a file one byte over the limit", () => {
    assert.strictEqual(
      imageUploadRejection(file("image/jpeg", maxImageUploadBytes + 1)),
      "tooLarge",
    );
  });

  // 入力欄の accept は画像しか選ばせないが、ドラッグ＆ドロップはそれを通らない。
  it("rejects anything that is not an image", () => {
    ["application/pdf", "text/plain", "", "video/mp4"].forEach((type) => {
      assert.strictEqual(imageUploadRejection(file(type, 1024)), "notImage");
    });
  });

  // 画像でなく、かつ大きすぎる場合。どちらの理由を出すかが決まっていないと、
  // 「5MBまで」と言われて小さくしたのにまだ通らない、が起きる。
  it("reports that it is not an image before reporting the size", () => {
    assert.strictEqual(
      imageUploadRejection(file("application/pdf", maxImageUploadBytes + 1)),
      "notImage",
    );
  });

  // 表示する数と実際に弾く大きさが別々に書かれていると、片方だけ変わる。
  it("derives the displayed size from the limit it enforces", () => {
    assert.strictEqual(
      maxImageUploadBytes,
      maxImageUploadMegaBytes * 1024 * 1024,
    );
  });
});

// 画面の上限は storage.rules の上限と同じでなければならない。ずれると、画面は通すのに
// Storage が 403 を返し、「保存に失敗しました」しか出ない元の状態に戻る。
//
// 定数を基準にしたテストは定数と一緒に動くので、値を変えても赤くならない。
// 突き合わせる相手はルールのほう。
describe("アップロード上限は storage.rules と一致する", () => {
  const rules = readFileSync(
    new URL("../../storage.rules", import.meta.url),
    "utf-8",
  );

  // コメントを落としてから、上限を書いている関数の中だけを見る。
  // ファイル全体を検索すると、コメントに同じ式が残っているだけでテストが通る。
  // 実際にそれで、ルールが < に変わっていても緑のままになった。
  const sizeLimitRule = (() => {
    const active = rules
      .split("\n")
      .map((line) => line.replace(/\/\/.*$/, ""))
      .join("\n");
    const body = active.match(
      /function isImageWithinLimit\(\)\s*\{([^}]*)\}/,
    );
    assert.ok(body, "storage.rules に isImageWithinLimit が見つからない");
    return body[1];
  })();

  it("reads the same megabyte limit the deployed rules enforce", () => {
    const limits = [
      ...sizeLimitRule.matchAll(
        /request\.resource\.size <= (\d+) \* 1024 \* 1024/g,
      ),
    ];
    assert.strictEqual(limits.length, 1, "上限の式がちょうど1つでない");
    assert.strictEqual(Number(limits[0][1]), maxImageUploadMegaBytes);
  });

  // ルールは <= で書かれている。< に変わると境界の画像の扱いが食い違う。
  it("matches the comparison the rules use", () => {
    assert.ok(sizeLimitRule.includes("request.resource.size <= "));
    assert.ok(!/request\.resource\.size <(?!=)/.test(sizeLimitRule));
  });
});
