import { describe, it } from "node:test";
import assert from "node:assert";

import {
  stripeActions,
  stripeActionStrings,
} from "../../src/lib/stripe/stripe.ts";

// Stripe の webhook の種類を数で持ち、表示のときに文字列へ戻す。数は保存された
// ログに残るので、**既存の番号を動かすと過去のログの意味が変わる**。
// 番号と名前の対応を両方向で固定する。

describe("stripeActions", () => {
  it("番号が動いていない", () => {
    assert.deepStrictEqual(stripeActions, {
      capability_updated: 1,
      account_updated: 2,
    });
  });

  it("番号から名前へ戻せる", () => {
    assert.strictEqual(
      stripeActionStrings[stripeActions.capability_updated],
      "capability_updated",
    );
    assert.strictEqual(
      stripeActionStrings[stripeActions.account_updated],
      "account_updated",
    );
  });

  // 名前が全部そろっていること。片方だけ足すと、ログに数字が出る。
  it("すべての番号に名前がある", () => {
    Object.entries(stripeActions).forEach(([name, code]) => {
      assert.strictEqual(
        stripeActionStrings[code],
        name,
        `${name}(${code}) の名前が合っていない`,
      );
    });
    assert.strictEqual(
      Object.keys(stripeActionStrings).length,
      Object.keys(stripeActions).length,
    );
  });

  // 0 は「未設定」と見分けが付かないので使わない。
  it("0 を使っていない", () => {
    Object.values(stripeActions).forEach((code) => {
      assert.notStrictEqual(code, 0);
    });
  });
});
