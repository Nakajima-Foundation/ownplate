import { describe, it } from "node:test";
import assert from "node:assert";
import {
  checkShopAccount,
  checkShopOwner,
} from "../../src/utils/userPermission.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// 管理画面の入口の判定。偽になると画面が「見つかりません」に落ちる。
// 逆に真を返しすぎると、他人の店舗の注文とメニューが見える。
//
// checkShopAccount と checkShopOwner は**中身が同じ**（どちらも shopInfo.uid と
// 渡された uid を比べるだけ）。違いは呼び出し側が何を渡すかにある:
//   checkShopAccount(shopInfo, ownerUid)  — 子アカウントは親の uid が入るので通る
//   checkShopOwner(shopInfo, uid)         — 署名した本人の uid なので子アカウントは通らない
// コメントは「allow subAccounts」「only owner」と書いてあるが、その差は関数の中には無い。

const OWNER = "owner-uid";
const shop = restaurantInfoFixture({ uid: OWNER });

describe("checkShopAccount", () => {
  it("lets the uid that owns the shop through", () => {
    assert.strictEqual(checkShopAccount(shop, OWNER), true);
  });

  it("keeps every other uid out", () => {
    assert.strictEqual(checkShopAccount(shop, "someone-else"), false);
    assert.strictEqual(checkShopAccount(shop, ""), false);
  });

  // 店舗に uid が無い注文・古いデータで、空の uid が通ってしまわないこと。
  it("does not let an empty uid match a shop with no owner", () => {
    const ownerless = restaurantInfoFixture({ uid: "" });
    assert.strictEqual(checkShopAccount(ownerless, "someone-else"), false);
  });
});

describe("checkShopOwner", () => {
  it("lets the uid that owns the shop through", () => {
    assert.strictEqual(checkShopOwner(shop, OWNER), true);
  });

  it("keeps every other uid out", () => {
    assert.strictEqual(checkShopOwner(shop, "someone-else"), false);
  });
});

// 中身が同じであることを留めておく。片方だけ直すと、もう片方が取り残される。
describe("2つの判定は同じ答えを返す", () => {
  it("agrees on every uid, because the difference is in what the caller passes", () => {
    ["owner-uid", "someone-else", "", "OWNER-UID"].forEach((uid) => {
      assert.strictEqual(
        checkShopAccount(shop, uid),
        checkShopOwner(shop, uid),
        `uid=${JSON.stringify(uid)} で食い違った`,
      );
    });
  });

  // 大文字小文字は区別する。Firebase の uid は大小を区別するので、ここで緩めると別人が通る。
  it("compares the uid exactly, not case-insensitively", () => {
    assert.strictEqual(checkShopAccount(shop, "OWNER-UID"), false);
  });
});
