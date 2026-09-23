import { describe, it } from "node:test";
import assert from "node:assert";

import {
  getBackUrl,
  getRestaurantId,
  isSuperPage,
  previewLink,
  routeMode,
  shareUrl,
  shareUrlAdmin,
  useBasePath,
  useLiffBasePath,
  useLiffIndexId,
  useRestaurantId,
  useTopPath,
} from "../../src/utils/utils.ts";
import { runInSetup } from "../helpers/vueSetup.ts";
import { restaurantInfoFixture } from "../fixtures/restaurantInfo.ts";

// LINE の中から開いたときだけ、すべてのリンクに /liff/<id> を前置きする。前置きを
// 落とすと LINE の画面から通常の画面へ飛び出し、そこではログインしていない。
const SHOP = "/r/curry-shop";
const IN_LINE = "/liff/line-app-1/r/curry-shop";

describe("店舗 id を経路から取る", () => {
  it("reads the id from a shop page", async () => {
    assert.strictEqual(
      await runInSetup(() => getRestaurantId(), SHOP),
      "curry-shop",
    );
    assert.strictEqual(
      (await runInSetup(() => useRestaurantId(), SHOP)).value,
      "curry-shop",
    );
  });

  it("reads it from inside LINE too", async () => {
    assert.strictEqual(
      await runInSetup(() => getRestaurantId(), IN_LINE),
      "curry-shop",
    );
  });

  it("hands back undefined off a shop page rather than throwing", async () => {
    assert.strictEqual(
      await runInSetup(() => getRestaurantId(), "/"),
      undefined,
    );
  });
});

describe("LINE の中かどうか", () => {
  it("says liff inside LINE and normal everywhere else", async () => {
    assert.strictEqual(
      (await runInSetup(() => routeMode(), IN_LINE)).value,
      "liff",
    );
    assert.strictEqual(
      (await runInSetup(() => routeMode(), SHOP)).value,
      "normal",
    );
    assert.strictEqual(
      (await runInSetup(() => routeMode(), "/")).value,
      "normal",
    );
  });

  // 前置きが要る経路かどうかは、経路の頭だけで決まる。/liff を含むが頭でない経路は
  // 通常扱い（店舗 id に liff という文字が入っていても巻き込まれない）。
  it("looks only at the start of the path", async () => {
    assert.strictEqual(
      (await runInSetup(() => routeMode(), "/r/liff-cafe")).value,
      "normal",
    );
  });

  it("names the LINE app the customer came in through", async () => {
    assert.strictEqual(
      (await runInSetup(() => useLiffIndexId(), IN_LINE)).value,
      "line-app-1",
    );
    assert.strictEqual(
      (await runInSetup(() => useLiffBasePath(), IN_LINE)).value,
      "/liff/line-app-1",
    );
  });
});

describe("リンクに付ける前置き", () => {
  it("prefixes every link with the LINE app's path inside LINE", async () => {
    assert.strictEqual(
      (await runInSetup(() => useBasePath(), IN_LINE)).value,
      "/liff/line-app-1",
    );
    assert.strictEqual(
      (await runInSetup(() => useTopPath(), IN_LINE)).value,
      "/liff/line-app-1",
    );
  });

  // 通常の画面では前置きは空。ただし先頭へ戻るリンクだけは "/" でなければならない
  // （空文字にすると、いまの画面に留まるリンクになる）。
  it("adds no prefix outside LINE, but still points home at the root", async () => {
    assert.strictEqual((await runInSetup(() => useBasePath(), SHOP)).value, "");
    assert.strictEqual((await runInSetup(() => useTopPath(), SHOP)).value, "/");
  });
});

// 店舗を人に知らせるときのリンク。頭の / を落とすと相対リンクになり、
// いまいる画面の下にぶら下がった宛先が配られる。
describe("店舗ページへのリンク", () => {
  const shopInfo = (restaurantId: string | undefined) =>
    restaurantInfoFixture({ restaurantId });

  it("points at the shop's own page", () => {
    assert.strictEqual(
      previewLink({ shopInfo: shopInfo("curry-shop") }).value,
      "/r/curry-shop",
    );
  });

  it("still makes a path for a shop with no id", () => {
    assert.strictEqual(
      previewLink({ shopInfo: shopInfo(undefined) }).value,
      "/r/undefined",
    );
  });
});

// location を見る関数。画面が無い場所から呼ぶので、その場で差し替えて戻す。
const withLocation = <T>(url: string, fn: () => T): T => {
  const had = "location" in globalThis;
  const previous = Reflect.get(globalThis, "location");
  Reflect.set(globalThis, "location", new URL(url));
  try {
    return fn();
  } finally {
    if (had) {
      Reflect.set(globalThis, "location", previous);
    } else {
      Reflect.deleteProperty(globalThis, "location");
    }
  }
};

describe("共有するリンク", () => {
  // computed なので、返った時点ではまだ location を読んでいない。読むのは .value を
  // 見たとき。差し替えの外で読むと、そこには location が無い。
  const adminUrlAt = (pageUrl: string) =>
    withLocation(
      pageUrl,
      () =>
        shareUrlAdmin({
          shopInfo: restaurantInfoFixture({ restaurantId: "curry-shop" }),
        }).value,
    );

  it("builds an absolute url for the shop the admin is editing", () => {
    assert.strictEqual(
      adminUrlAt("https://omochikaeri.com/admin/restaurants"),
      "https://omochikaeri.com/r/curry-shop",
    );
  });

  it("keeps the port when there is one", () => {
    assert.strictEqual(
      adminUrlAt("http://localhost:5173/admin/restaurants"),
      "http://localhost:5173/r/curry-shop",
    );
  });

  it("puts the prefix in front of the shop path", async () => {
    const url = await runInSetup(
      () =>
        withLocation("https://omochikaeri.com/r/curry-shop", () =>
          shareUrl("/liff/line-app-1"),
        ),
      SHOP,
    );
    assert.strictEqual(
      url,
      "https://omochikaeri.com/liff/line-app-1/r/curry-shop",
    );
  });
});

// 上位管理者の画面は /s/、オペレーターの画面は /op。戻り先を取り違えると、
// 権限の無い画面へ戻してしまう。
describe("上位管理者の画面かどうか", () => {
  it("recognises the super pages by their path", () => {
    assert.strictEqual(
      withLocation("https://x.com/s/restaurants", isSuperPage),
      true,
    );
    assert.strictEqual(withLocation("https://x.com/s/", isSuperPage), true);
  });

  it("does not mistake other paths that merely contain it", () => {
    assert.strictEqual(
      withLocation("https://x.com/op/orders", isSuperPage),
      false,
    );
    assert.strictEqual(
      withLocation("https://x.com/r/s/menu", isSuperPage),
      false,
    );
    assert.strictEqual(withLocation("https://x.com/super", isSuperPage), false);
    assert.strictEqual(withLocation("https://x.com/", isSuperPage), false);
  });

  it("sends each one back to its own top page", () => {
    assert.strictEqual(
      withLocation("https://x.com/s/restaurants", getBackUrl),
      "/s",
    );
    assert.strictEqual(
      withLocation("https://x.com/op/orders", getBackUrl),
      "/op",
    );
  });
});
