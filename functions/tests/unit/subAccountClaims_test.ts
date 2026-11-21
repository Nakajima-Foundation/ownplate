import { describe, it } from "node:test";
import assert from "node:assert";

import { claimsAfterJoiningParent, claimsAfterLeavingParent } from "../../src/lib/subAccountClaims";

// 親が子アカウントを外すときに、相手の権限情報をどう書き直すか。
// null は「書き換えない」。招待しただけの相手や他の親の子は、こちらから触らない。
describe("claimsAfterLeavingParent", () => {
  it("removes parentUid from a child of this parent", () => {
    assert.deepStrictEqual(claimsAfterLeavingParent({ parentUid: "parent" }, "parent"), {});
  });

  it("keeps the other claims of a child of this parent", () => {
    assert.deepStrictEqual(claimsAfterLeavingParent({ parentUid: "parent", operator: true }, "parent"), { operator: true });
  });

  it("leaves someone who never accepted the invitation untouched", () => {
    assert.strictEqual(claimsAfterLeavingParent(undefined, "parent"), null);
    assert.strictEqual(claimsAfterLeavingParent({}, "parent"), null);
  });

  it("leaves a super admin who was only invited untouched", () => {
    assert.strictEqual(claimsAfterLeavingParent({ admin: true }, "parent"), null);
    assert.strictEqual(claimsAfterLeavingParent({ operator: true }, "parent"), null);
  });

  it("leaves a child of another parent untouched", () => {
    assert.strictEqual(claimsAfterLeavingParent({ parentUid: "other" }, "parent"), null);
  });

  it("does not match a parentUid of another type", () => {
    assert.strictEqual(claimsAfterLeavingParent({ parentUid: ["parent"] }, "parent"), null);
  });
});

// 招待を受けたときの書き直し。もともとの権限は残し、親子の印だけを足す。
describe("claimsAfterJoiningParent", () => {
  it("adds parentUid to someone with no claims", () => {
    assert.deepStrictEqual(claimsAfterJoiningParent(undefined, "parent"), { parentUid: "parent" });
    assert.deepStrictEqual(claimsAfterJoiningParent({}, "parent"), { parentUid: "parent" });
  });

  it("keeps the admin and operator claims the invitee already had", () => {
    assert.deepStrictEqual(claimsAfterJoiningParent({ admin: true, operator: true }, "parent"), { admin: true, operator: true, parentUid: "parent" });
  });

  it("returns to the claims before joining once the parent removes the child", () => {
    const before = { operator: true };
    assert.deepStrictEqual(claimsAfterLeavingParent(claimsAfterJoiningParent(before, "parent"), "parent"), before);
  });
});
