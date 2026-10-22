import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";

import {
  coverPath,
  matchImagePaths,
  menuItemPath,
  profilePath,
  sizeOfResize,
} from "../../functions/src/functions/image/constant.ts";

// 画像を縮小する処理は、Cloud Storage の置き場に当てた型で呼ばれる。型が画面の
// 書き込み先とずれると、**縮小が一度も走らないまま原寸が配られる**。落ちも警告も
// 出ないので、ずれても気づけない。
//
// 画面側の書き込み先は .vue の中なので import できない。読み込んで、組み立てている
// 文字列そのものを取り出して照らす。
const pathBuiltIn = (file: string, marker: string): string => {
  const source = readFileSync(
    new URL(`../../${file}`, import.meta.url),
    "utf8",
  );
  const line = source
    .split("\n")
    .find(
      (text) => text.includes(marker) && text.includes("images/restaurants"),
    );
  assert.ok(line, `${file} に ${marker} の書き込み先が見つからない`);
  const literal = line.match(/`([^`]+)`/);
  assert.ok(literal, `${file} の書き込み先が組み立て文字列ではない`);
  // ${...} は id が一つ入る場所。型の * と同じ意味なので置き換える。
  return literal[1].replace(/\$\{[^}]+\}/g, "*").replace(/^\//, "");
};

const matches = (pattern: string, path: string): boolean => {
  const escaped = pattern
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^/]+");
  return new RegExp(`^${escaped}$`).test(path);
};

describe("画像の置き場の型", () => {
  const cover = "images/restaurants/rest1/owner1/cover.jpg";
  const profile = "images/restaurants/rest1/owner1/profile.jpg";
  const menuItem = "images/restaurants/rest1/menus/menu1/owner1/item.jpg";

  it("matches the place each kind of image is written to", () => {
    assert.ok(matches(coverPath.path, cover));
    assert.ok(matches(profilePath.path, profile));
    assert.ok(matches(menuItemPath.path, menuItem));
  });

  // 型ごとに別の処理が走る。取り違えると、店舗の表紙が商品の写真として縮小される。
  it("keeps the three kinds apart", () => {
    assert.ok(!matches(coverPath.path, profile));
    assert.ok(!matches(coverPath.path, menuItem));
    assert.ok(!matches(profilePath.path, cover));
    assert.ok(!matches(menuItemPath.path, cover));
  });

  // * は階層を跨がない。跨ぐと、別の店舗の下にある画像まで当たる。
  it("matches neither a shallower nor a deeper place", () => {
    assert.ok(!matches(coverPath.path, "images/restaurants/rest1/cover.jpg"));
    assert.ok(
      !matches(coverPath.path, "images/restaurants/rest1/a/b/cover.jpg"),
    );
    assert.ok(
      !matches(menuItemPath.path, "images/restaurants/rest1/menus/m1/item.jpg"),
    );
  });

  it("watches all three kinds and nothing else", () => {
    assert.deepStrictEqual(matchImagePaths, [
      coverPath,
      profilePath,
      menuItemPath,
    ]);
  });
});

// ここが本題。画面が書き込む先と、縮小が見ている型が一致していること。
describe("画面の書き込み先と型が合っていること", () => {
  const RESTAURANT_PAGE = "src/app/admin/Restaurants/Index.vue";
  const MENU_ITEM_PAGE = "src/app/admin/Restaurants/MenuItemPage.vue";

  it("covers where the shop's profile photo is written", () => {
    const written = pathBuiltIn(RESTAURANT_PAGE, "profile.jpg");
    assert.ok(
      matches(profilePath.path, written),
      `画面は ${written} に書いている`,
    );
  });

  it("covers where the shop's cover photo is written", () => {
    const written = pathBuiltIn(RESTAURANT_PAGE, "cover.jpg");
    assert.ok(
      matches(coverPath.path, written),
      `画面は ${written} に書いている`,
    );
  });

  it("covers where a menu item's photo is written", () => {
    const written = pathBuiltIn(MENU_ITEM_PAGE, "item.jpg");
    assert.ok(
      matches(menuItemPath.path, written),
      `画面は ${written} に書いている`,
    );
  });
});

describe("縮小する大きさ", () => {
  it("makes a phone-sized and a desktop-sized copy", () => {
    assert.deepStrictEqual(sizeOfResize, [600, 1200]);
  });

  it("orders them small to large, which the file names depend on", () => {
    assert.deepStrictEqual(
      sizeOfResize,
      [...sizeOfResize].sort((a, b) => a - b),
    );
  });
});
