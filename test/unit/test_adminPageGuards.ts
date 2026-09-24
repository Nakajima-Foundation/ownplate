import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { createPinia, setActivePinia } from "pinia";

import { callComponentSetup } from "../helpers/vueComponentSetup.ts";
import { useUserStore } from "../../src/store/user.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";
import { adminUser } from "../fixtures/user.ts";

// 管理画面は `setup()` の冒頭で「この店舗の持ち主か」を見て、違えば **そこで返す**。
// 後ろに続く Firestore の読み書きを走らせないための守りで、**効いていることは
// 「一度も触らない」という形でしか現れない**。
//
// `notFound` が立つことだけを見ても足りない。守りを取得の後ろへ動かしても
// `notFound` は立ったままで、取得だけが走る。だから**回数を数える**。
const OWNER = "owner-1";
const STRANGER = "someone-else";

beforeEach(() => {
  setActivePinia(createPinia());
  const store = useUserStore();
  store.setUser(adminUser(OWNER));
  store.setCustomClaims({ admin: false, operator: false });
});

const openPage = (component: string, shopOwnerUid: string) =>
  callComponentSetup({
    component,
    props: { shopInfo: restaurantInfoFixture({ uid: shopOwnerUid }) },
  });

describe("送料の設定（Postage.vue）", () => {
  const COMPONENT = "src/app/admin/Restaurants/Postage.vue";

  it("touches Firestore not once for someone who does not own the shop", async () => {
    const { bindings, calls } = await openPage(COMPONENT, STRANGER);
    assert.deepStrictEqual(
      calls,
      [],
      `触ってしまった: ${JSON.stringify(calls)}`,
    );
    assert.strictEqual(bindings.notFound, true);
  });

  it("reads the shop's own postage for the owner", async () => {
    const { bindings, calls } = await openPage(COMPONENT, OWNER);
    assert.strictEqual(bindings.notFound, false);
    assert.deepStrictEqual(calls, [
      { op: "getDoc", path: "restaurants/curry-shop/ec/postage" },
    ]);
  });

  // 読む先は経路の店舗。ここが props 側の id になっていると、別の店舗の設定を出す。
  it("reads the shop named by the route", async () => {
    const { calls } = await callComponentSetup({
      component: COMPONENT,
      props: { shopInfo: restaurantInfoFixture({ uid: OWNER }) },
      route: "/r/another-shop",
    });
    assert.deepStrictEqual(calls, [
      { op: "getDoc", path: "restaurants/another-shop/ec/postage" },
    ]);
  });
});
