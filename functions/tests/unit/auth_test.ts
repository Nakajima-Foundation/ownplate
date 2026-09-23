import { describe, it } from "node:test";
import assert from "node:assert";

import {
  is_admin_auth,
  is_subAccount,
  required_params,
  validate_admin_auth,
  validate_auth,
  validate_customer_auth,
  validate_owner_admin_auth,
  validate_parent_admin_auth,
} from "../../src/lib/utils";

// Callable Functions の権限の入口。ここを抜けた呼び出しは、その uid のものとして
// 注文や店舗の情報を触る。
//
// 注文者はショートメッセージで認証するので token に phone_number が入り、
// 店舗の管理者はメールで認証するので email が入る。**この2つで種別を見分けている。**
// サブアカウントには親の uid が parentUid として入る。
const customer = {
  auth: { uid: "customer-uid", token: { phone_number: "+819012345678" } },
};
const owner = {
  auth: { uid: "owner-uid", token: { email: "owner@example.com" } },
};
const subAccount = {
  auth: {
    uid: "sub-uid",
    token: { email: "staff@example.com", parentUid: "owner-uid" },
  },
};
const anonymous = { auth: { uid: "anon-uid", token: {} } };
const signedOut = {};

const rejects = (fn: () => unknown, why: string) => {
  assert.throws(
    fn,
    (error: { code?: string }) => {
      assert.strictEqual(error.code, "failed-precondition", why);
      return true;
    },
    why,
  );
};

describe("validate_auth", () => {
  it("hands back the uid of whoever is signed in", () => {
    assert.strictEqual(validate_auth(customer), "customer-uid");
    assert.strictEqual(validate_auth(owner), "owner-uid");
    assert.strictEqual(validate_auth(anonymous), "anon-uid");
  });

  it("refuses a caller who is not signed in", () => {
    rejects(() => validate_auth(signedOut), "署名なしを通してはいけない");
  });
});

// 注文者向けの入口。メールで認証した管理者は通さない。
describe("validate_customer_auth", () => {
  it("hands back the uid of a customer who signed in by phone", () => {
    assert.strictEqual(validate_customer_auth(customer), "customer-uid");
  });

  it("refuses a caller with no phone number on their token", () => {
    rejects(() => validate_customer_auth(owner), "管理者を通してはいけない");
    rejects(
      () => validate_customer_auth(anonymous),
      "電話番号なしを通してはいけない",
    );
    rejects(
      () => validate_customer_auth(signedOut),
      "署名なしを通してはいけない",
    );
  });
});

// 管理者向けの入口。電話番号で認証した注文者は通さない。
describe("validate_admin_auth", () => {
  it("hands back the uid of an owner who signed in by email", () => {
    assert.strictEqual(validate_admin_auth(owner), "owner-uid");
  });

  it("lets a sub-account through, under its own uid", () => {
    assert.strictEqual(validate_admin_auth(subAccount), "sub-uid");
  });

  it("refuses a caller with no email on their token", () => {
    rejects(() => validate_admin_auth(customer), "注文者を通してはいけない");
    rejects(
      () => validate_admin_auth(anonymous),
      "メールなしを通してはいけない",
    );
    rejects(() => validate_admin_auth(signedOut), "署名なしを通してはいけない");
  });
});

// 店舗のデータを触る入口。サブアカウントは**親の uid**として扱われる。自分の uid で
// 通すと、親の店舗ではなく存在しない自分の店舗を触ることになる。
describe("validate_owner_admin_auth", () => {
  it("hands back the owner's own uid", () => {
    assert.strictEqual(validate_owner_admin_auth(owner), "owner-uid");
  });

  it("hands back the parent's uid for a sub-account, not its own", () => {
    assert.strictEqual(validate_owner_admin_auth(subAccount), "owner-uid");
  });

  it("refuses a caller with no email on their token", () => {
    rejects(
      () => validate_owner_admin_auth(customer),
      "注文者を通してはいけない",
    );
    rejects(
      () => validate_owner_admin_auth(signedOut),
      "署名なしを通してはいけない",
    );
  });
});

// 親の管理者だけが通る入口。サブアカウントの作成や削除など、子に任せられない操作。
describe("validate_parent_admin_auth", () => {
  it("lets the owner through", () => {
    assert.strictEqual(validate_parent_admin_auth(owner), "owner-uid");
  });

  it("refuses a sub-account even though it signed in by email", () => {
    rejects(
      () => validate_parent_admin_auth(subAccount),
      "サブアカウントを通してはいけない",
    );
  });

  it("refuses a caller with no email, and one not signed in", () => {
    rejects(
      () => validate_parent_admin_auth(customer),
      "注文者を通してはいけない",
    );
    rejects(
      () => validate_parent_admin_auth(signedOut),
      "署名なしを通してはいけない",
    );
  });
});

// 種別の見分け。こちらは弾かずに真偽を返す（呼び出し側が分岐する）。
describe("is_admin_auth", () => {
  it("says yes for an account signed in by email", () => {
    assert.strictEqual(is_admin_auth(owner), true);
    assert.strictEqual(is_admin_auth(subAccount), true);
  });

  it("says no for a customer and for an account with no email", () => {
    assert.strictEqual(is_admin_auth(customer), false);
    assert.strictEqual(is_admin_auth(anonymous), false);
  });

  // 見分けの前に、そもそも署名があるかは弾く。
  it("still refuses a caller who is not signed in", () => {
    rejects(() => is_admin_auth(signedOut), "署名なしを通してはいけない");
  });
});

describe("is_subAccount", () => {
  it("says yes only when the token names a parent", () => {
    assert.strictEqual(is_subAccount(subAccount), true);
    assert.strictEqual(is_subAccount(owner), false);
    assert.strictEqual(is_subAccount(customer), false);
  });

  // こちらは弾かない。署名が無ければサブアカウントでもない、と答える。
  it("answers no rather than refusing when nobody is signed in", () => {
    assert.strictEqual(is_subAccount(signedOut), false);
  });
});

// 呼び出しに要る値が揃っているか。揃っていなければ、欠けた名前を添えて弾く。
describe("required_params", () => {
  it("passes when everything is there", () => {
    assert.strictEqual(
      required_params({ restaurantId: "rest1", orderId: "order1" }),
      undefined,
    );
  });

  it("names every missing value, not only the first", () => {
    assert.throws(
      () =>
        required_params({
          restaurantId: undefined,
          orderId: "order1",
          uid: undefined,
        }),
      (error: { code?: string; details?: { params?: string[] } }) => {
        assert.strictEqual(error.code, "invalid-argument");
        assert.deepStrictEqual(error.details?.params, ["restaurantId", "uid"]);
        return true;
      },
    );
  });

  // 見ているのは undefined だけ。空文字も null も 0 も「入っている」扱い。
  it("counts an empty string, null and zero as present", () => {
    assert.strictEqual(
      required_params({ a: "", b: null, c: 0, d: false }),
      undefined,
    );
  });

  it("passes when there is nothing to check", () => {
    assert.strictEqual(required_params({}), undefined);
  });
});
