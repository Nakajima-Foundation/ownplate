import { describe, it } from "node:test";
import assert from "node:assert";

import { signinErrorField } from "../../src/utils/signinErrorField.ts";

describe("signinErrorField", () => {
  it("puts password problems under the password field", () => {
    ["auth/wrong-password", "auth/internal-error", "auth/missing-password"].forEach((code) => {
      assert.strictEqual(signinErrorField(code), "password", code);
    });
  });

  // パスワード欄に出すと決めたもの以外は、メール欄に出す（アカウントの有無など）。
  it("puts everything else under the email field", () => {
    ["auth/invalid-email", "auth/user-not-found", "auth/too-many-requests", "auth/invalid-credential", ""].forEach(
      (code) => assert.strictEqual(signinErrorField(code), "email", code),
    );
  });

  // 切り出す前の条件（そのまま写したもの）と一致すること。missing-password だけは
  // 今回パスワード欄に移したので、差はそこだけのはず。
  it("matches the condition it replaced, except for missing-password", () => {
    const before = (code: string) =>
      code === "auth/wrong-password" || code === "auth/internal-error" ? "password" : "email";
    const codes = [
      "auth/wrong-password", "auth/internal-error", "auth/invalid-email", "auth/user-not-found",
      "auth/too-many-requests", "auth/invalid-credential", "auth/invalid-login-credentials",
      "auth/network-request-failed", "auth/missing-password", "",
    ];
    const differing = codes.filter((code) => before(code) !== signinErrorField(code));
    assert.deepStrictEqual(differing, ["auth/missing-password"]);
  });
});
