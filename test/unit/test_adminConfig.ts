import { describe, it } from "node:test";
import assert from "node:assert";

import {
  adminConfigPath,
  adminRestaurantConfigPath,
  configValueOr,
} from "../../src/utils/admin/adminConfig.ts";

// 管理画面の切り替え設定の置き場。**ここが管理者どうしの境目**で、取り違えると
// 別の管理者の設定を読み書きする。
describe("adminConfigPath", () => {
  it("puts each admin's settings under their own uid", () => {
    assert.strictEqual(adminConfigPath("owner-1"), "adminConfigs/owner-1");
  });

  it("never gives two admins the same place", () => {
    assert.notStrictEqual(
      adminConfigPath("owner-1"),
      adminConfigPath("owner-2"),
    );
  });

  // uid が空でも、設定の集まりそのものを指さないこと。指すと全管理者ぶんに当たる。
  it("does not collapse to the collection itself for an empty uid", () => {
    assert.strictEqual(adminConfigPath(""), "adminConfigs/");
    assert.notStrictEqual(adminConfigPath(""), "adminConfigs");
  });

  // 渡された uid はそのまま置き場になる。整えてはいない（Firestore の規則側で守る）。
  it("uses the uid as given, without cleaning it", () => {
    assert.strictEqual(adminConfigPath("a/b"), "adminConfigs/a/b");
  });
});

// 店舗ごとの設定。同じ管理者が複数の店舗を持つので、店舗まで含めて分ける。
describe("adminRestaurantConfigPath", () => {
  it("puts the shop's settings under the admin and then the shop", () => {
    assert.strictEqual(
      adminRestaurantConfigPath("owner-1", "shop-a"),
      "adminConfigs/owner-1/restaurants/shop-a",
    );
  });

  it("sits under that admin's own settings", () => {
    assert.ok(
      adminRestaurantConfigPath("owner-1", "shop-a").startsWith(
        adminConfigPath("owner-1") + "/",
      ),
    );
  });

  // 同じ管理者の別の店舗、別の管理者の同じ店舗、どちらも別の場所になること。
  it("keeps one admin's two shops apart", () => {
    assert.notStrictEqual(
      adminRestaurantConfigPath("owner-1", "shop-a"),
      adminRestaurantConfigPath("owner-1", "shop-b"),
    );
  });

  it("keeps two admins' settings for the same shop apart", () => {
    assert.notStrictEqual(
      adminRestaurantConfigPath("owner-1", "shop-a"),
      adminRestaurantConfigPath("owner-2", "shop-a"),
    );
  });

  // 順番が命。入れ替えると別の管理者の場所を指す。
  it("takes the admin first and the shop second", () => {
    assert.notStrictEqual(
      adminRestaurantConfigPath("a", "b"),
      adminRestaurantConfigPath("b", "a"),
    );
    assert.strictEqual(
      adminRestaurantConfigPath("a", "b"),
      "adminConfigs/a/restaurants/b",
    );
  });
});

// 保存されていなければ既定値。保存されているなら、偽値でもそれを使う。
describe("configValueOr", () => {
  it("hands back the stored setting", () => {
    assert.strictEqual(
      configValueOr({ simpleMode: true }, "simpleMode", false),
      true,
    );
    assert.strictEqual(configValueOr({ rows: 25 }, "rows", 10), 25);
  });

  // ここが要。切ったはずの設定が既定値へ倒れると、入ったままになる。
  it("keeps a stored falsy setting rather than falling back", () => {
    assert.strictEqual(
      configValueOr({ simpleMode: false }, "simpleMode", true),
      false,
    );
    assert.strictEqual(configValueOr({ rows: 0 }, "rows", 25), 0);
    assert.strictEqual(configValueOr({ note: "" }, "note", "x"), "");
    assert.ok(Number.isNaN(configValueOr({ rows: NaN }, "rows", 25)));
  });

  // null も「保存されている」側。undefined だけが未設定。
  it("treats a stored null as stored, and only undefined as unset", () => {
    assert.strictEqual(
      configValueOr({ simpleMode: null }, "simpleMode", true),
      null,
    );
    assert.strictEqual(
      configValueOr({ simpleMode: undefined }, "simpleMode", true),
      true,
    );
  });

  it("falls back when the setting was never saved", () => {
    assert.strictEqual(configValueOr({}, "simpleMode", true), true);
    assert.strictEqual(
      configValueOr({ other: false }, "simpleMode", true),
      true,
    );
  });

  // 読み込む前や、文書そのものが無いとき。
  it("falls back when there is no document at all", () => {
    assert.strictEqual(configValueOr(undefined, "simpleMode", true), true);
    assert.strictEqual(configValueOr(undefined, "simpleMode", false), false);
  });

  it("reads the key it is given, not a fixed one", () => {
    const config = { simpleMode: true, queryIsPlacedDate: false };
    assert.strictEqual(configValueOr(config, "simpleMode", false), true);
    assert.strictEqual(configValueOr(config, "queryIsPlacedDate", true), false);
  });

  // **設定の名前は素のまま添字で引いている**ので、Object.prototype が持っている名前は
  // 保存していなくても「保存済み」として返る。いま使っている名前（simpleMode /
  // queryIsPlacedDate / menuOptionsPreview）はどれも当たらないので害は出ていないが、
  // toString のような名前で設定を足すと、切り替えの値が関数になる。
  //
  // 切り出す前からそうで、この変更では直していない。いまの振る舞いのほうを留める。
  it("answers with Object.prototype's own members for a built-in name", () => {
    assert.strictEqual(typeof configValueOr({}, "toString", true), "function");
    assert.strictEqual(typeof configValueOr({}, "valueOf", true), "function");
    assert.strictEqual(
      typeof configValueOr({}, "constructor", true),
      "function",
    );
  });

  it("falls back for the setting names the screens actually use", () => {
    ["simpleMode", "queryIsPlacedDate", "menuOptionsPreview"].forEach((key) => {
      assert.strictEqual(
        configValueOr({}, key, true),
        true,
        `${key} が既定値に倒れない`,
      );
      assert.strictEqual(
        configValueOr({}, key, false),
        false,
        `${key} が既定値に倒れない`,
      );
    });
  });

  it("hands back a setting saved under an unusual name", () => {
    const fromJson = JSON.parse('{"a.b": 1, "0": 2}');
    assert.strictEqual(configValueOr(fromJson, "a.b", 9), 1);
    assert.strictEqual(configValueOr(fromJson, "0", 9), 2);
  });
});
