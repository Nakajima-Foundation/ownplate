import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { createPinia, setActivePinia } from "pinia";

import { useUserStore } from "../../src/store/user.ts";
import { useAdminUids } from "../../src/utils/utils.ts";
import { adminUser, customerUser, userFixture } from "../fixtures/user.ts";

// 画面側の身元判定。**メールが入っていれば店舗の管理者、電話番号が入っていれば注文者**
// として扱う。ここを取り違えると、注文者に管理画面が開くか、管理者が自分の店舗を
// 開けなくなる。
//
// サーバ側の同じ判定は functions/tests/unit/auth_test.ts にある。
beforeEach(() => {
  setActivePinia(createPinia());
});

// 役割の型は store から export されていないので、受け取る側の型から導く。
// 書き写すと、store が項目を増やしたときに気づけない。
type Claims = NonNullable<
  Parameters<ReturnType<typeof useUserStore>["setCustomClaims"]>[0]
>;

// 役割は Custom Claims で付く。型は admin と operator を必ず要求するので、既定を
// 埋めてから上書きする。どの判定も「無い」と false を同じに扱うので、埋めても
// 見ているものは変わらない。
const claimsOf = (overrides: Partial<Claims> = {}): Claims => ({
  admin: false,
  operator: false,
  ...overrides,
});

const signedInAs = (user = adminUser(), claims: Partial<Claims> = {}) => {
  const store = useUserStore();
  store.setUser(user);
  store.setCustomClaims(claimsOf(claims));
  return store;
};

describe("uidAdmin と uidUser", () => {
  it("names the admin uid only for an account with an email", () => {
    assert.strictEqual(signedInAs(adminUser("owner-1")).uidAdmin, "owner-1");
    assert.strictEqual(signedInAs(customerUser()).uidAdmin, undefined);
  });

  it("names the customer uid only for an account with a phone number", () => {
    assert.strictEqual(
      signedInAs(customerUser("customer-1")).uidUser,
      "customer-1",
    );
    assert.strictEqual(signedInAs(adminUser()).uidUser, undefined);
  });

  // どちらも持たない利用者（匿名で作られた直後など）はどちらでもない。
  it("names neither for an account carrying neither", () => {
    const store = signedInAs(userFixture({ uid: "plain-uid" }));
    assert.strictEqual(store.uidAdmin, undefined);
    assert.strictEqual(store.uidUser, undefined);
    assert.strictEqual(store.uid, "plain-uid");
  });

  it("names nothing at all when nobody is signed in", () => {
    const store = useUserStore();
    assert.strictEqual(store.uid, undefined);
    assert.strictEqual(store.uidAdmin, undefined);
    assert.strictEqual(store.uidUser, undefined);
  });
});

// 署名が済んでいないあいだは undefined、署名して誰でもないときは null。
// どちらも「まだ誰でもない」として扱う。
describe("isAnonymous", () => {
  it("counts both not-yet-loaded and signed-out as anonymous", () => {
    assert.strictEqual(useUserStore().isAnonymous, true);
    const store = useUserStore();
    store.setUser(null);
    assert.strictEqual(store.isAnonymous, true);
  });

  it("counts a signed-in account as not anonymous", () => {
    assert.strictEqual(signedInAs(adminUser()).isAnonymous, false);
    assert.strictEqual(signedInAs(customerUser()).isAnonymous, false);
  });
});

// 役割は Firebase の Custom Claims で付く。claims が来ていないあいだは「持たない」側。
describe("役割", () => {
  it("says super admin only when the claim says so", () => {
    assert.strictEqual(
      signedInAs(adminUser(), { admin: true }).isSuperAdmin,
      true,
    );
    assert.strictEqual(
      signedInAs(adminUser(), { admin: true }).isNotSuperAdmin,
      false,
    );
    assert.strictEqual(signedInAs(adminUser(), {}).isNotSuperAdmin, true);
  });

  it("treats claims that have not arrived as carrying no role", () => {
    const store = useUserStore();
    store.setUser(adminUser());
    assert.strictEqual(store.isNotSuperAdmin, true);
    assert.strictEqual(store.isNotOperator, true);
  });

  it("keeps the operator role apart from the super role", () => {
    const operator = signedInAs(adminUser(), { operator: true });
    assert.strictEqual(operator.isOperator, true);
    assert.strictEqual(operator.isNotSuperAdmin, true);
  });

  it("calls an account with an email and a uid an admin", () => {
    assert.strictEqual(signedInAs(adminUser()).isAdmin, true);
    assert.strictEqual(signedInAs(customerUser()).isAdmin, false);
  });
});

// LINE から入った利用者。claims に liffId が付く。
describe("LINE から入った利用者", () => {
  it("names the uid only when both the account and the app are known", () => {
    assert.strictEqual(
      signedInAs(customerUser("line-uid"), { liffId: "liff-1" }).uidLiff,
      "line-uid",
    );
    assert.strictEqual(signedInAs(customerUser(), {}).uidLiff, undefined);
  });

  it("names no app when nobody is signed in", () => {
    const store = useUserStore();
    store.setCustomClaims(claimsOf({ liffId: "liff-1" }));
    assert.strictEqual(store.liffId, undefined);
    assert.strictEqual(store.uidLiff, undefined);
  });
});

// 子アカウント。親が招いて作る。**店舗のデータは親の uid の下にある。**
describe("サブアカウント", () => {
  const staff = () =>
    signedInAs(adminUser("staff-uid"), { parentUid: "owner-uid" });

  it("recognises a sub-account by the parent on its claims", () => {
    assert.strictEqual(staff().isSubAccount, true);
    assert.strictEqual(staff().parentId, "owner-uid");
    assert.strictEqual(signedInAs(adminUser()).isSubAccount, false);
  });

  // ここがサーバ側の validate_owner_admin_auth と対になる。子は自分の uid で
  // 署名するが、触る店舗は親のもの。
  it("reads the shop under the parent's uid, while keeping its own", () => {
    staff();
    const { uid, ownerUid, isOwner } = useAdminUids();
    assert.strictEqual(uid.value, "staff-uid");
    assert.strictEqual(ownerUid.value, "owner-uid");
    assert.strictEqual(isOwner.value, false);
  });

  it("reads the shop under the owner's own uid for an owner", () => {
    signedInAs(adminUser("owner-uid"));
    const { uid, ownerUid, isOwner } = useAdminUids();
    assert.strictEqual(uid.value, "owner-uid");
    assert.strictEqual(ownerUid.value, "owner-uid");
    assert.strictEqual(isOwner.value, true);
  });

  it("passes on whether the account has confirmed its email", () => {
    signedInAs(userFixture({ email: "a@example.com", emailVerified: false }));
    assert.strictEqual(useAdminUids().emailVerified.value, false);
    signedInAs(adminUser());
    assert.strictEqual(useAdminUids().emailVerified.value, true);
  });
});

// 署名し直したら、前の利用者の値が残らないこと。残ると、切り替えたあとも
// 前の店舗のデータを読む。
describe("署名し直したとき", () => {
  it("forgets the account that signed out", () => {
    const store = signedInAs(adminUser("owner-1"), { admin: true });
    store.setUser(null);
    store.setCustomClaims(null);
    assert.strictEqual(store.uidAdmin, undefined);
    assert.strictEqual(store.isSuperAdmin, undefined);
    assert.strictEqual(store.isNotSuperAdmin, true);
    assert.strictEqual(store.isAnonymous, true);
  });

  it("follows a switch from an owner to a sub-account", () => {
    const store = signedInAs(adminUser("owner-1"));
    assert.strictEqual(useAdminUids().ownerUid.value, "owner-1");
    store.setUser(adminUser("staff-1"));
    store.setCustomClaims(claimsOf({ parentUid: "owner-1" }));
    assert.strictEqual(useAdminUids().ownerUid.value, "owner-1");
    assert.strictEqual(useAdminUids().uid.value, "staff-1");
  });
});
