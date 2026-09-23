import { describe, it } from "node:test";
import assert from "node:assert";
import { getNewItemData } from "../../src/models/menu.ts";
import {
  copyMenuData,
  getBlankMenuItem,
  getBlankTitleItem,
} from "../../src/models/menuUtils.ts";
import { menuFixture } from "../fixtures/menu.ts";

const JP = true;
const NOT_JP = false;
const VALIDATED = true;
const NOT_VALIDATED = false;

// 商品を保存するたびに通る組み立て。画面が渡した値をそのまま書くのではなく、ここで
// いくつかの項目が握り潰される。握り潰される側こそ、読まないと分からない。
describe("getNewItemData", () => {
  // 検証を通っていない商品は、店舗が公開にしていても公開されない。ここが逆になると、
  // 画像も説明も無い書きかけの商品が客の画面に並ぶ。
  it("never publishes an item that has not been validated", () => {
    const wantsToBePublic = menuFixture({ publicFlag: true });
    assert.strictEqual(
      getNewItemData(wantsToBePublic, JP, NOT_VALIDATED).publicFlag,
      false,
    );
    assert.strictEqual(
      getNewItemData(wantsToBePublic, JP, VALIDATED).publicFlag,
      true,
    );
  });

  it("keeps a validated item private when the owner asked for private", () => {
    const item = menuFixture({ publicFlag: false });
    assert.strictEqual(getNewItemData(item, JP, VALIDATED).publicFlag, false);
  });

  // 売り切れは保存のたびに外れる。売り切れにした商品の説明を直して保存すると、
  // 客の画面にまた並ぶ。意図した挙動かどうかは別として、いまはそう動く。
  it("clears sold-out every time the item is saved", () => {
    const soldOut = menuFixture({ soldOut: true });
    assert.strictEqual(getNewItemData(soldOut, JP, VALIDATED).soldOut, false);
  });

  it("never carries a deleted flag into the saved item", () => {
    const deleted = menuFixture({ deletedFlag: true });
    assert.strictEqual(
      getNewItemData(deleted, JP, VALIDATED).deletedFlag,
      false,
    );
  });

  // 円に小数は無い。丸めないと、注文の合計が1円ずれる。
  it("rounds the price to whole yen in Japan, and leaves it alone elsewhere", () => {
    assert.strictEqual(
      getNewItemData(menuFixture({ price: 500.4 }), JP, VALIDATED).price,
      500,
    );
    assert.strictEqual(
      getNewItemData(menuFixture({ price: 500.5 }), JP, VALIDATED).price,
      501,
    );
    assert.strictEqual(
      getNewItemData(menuFixture({ price: 500.5 }), NOT_JP, VALIDATED).price,
      500.5,
    );
  });

  it("gives an item with no options an empty list rather than nothing", () => {
    const item = menuFixture({ itemOptionCheckbox: [] });
    assert.deepStrictEqual(
      getNewItemData(item, JP, VALIDATED).itemOptionCheckbox,
      [],
    );
  });

  // 別名・昼夜・除外日は、設定されていればそのまま持ち越す。既定へ倒すと店舗の設定が消える。
  it("carries the alias the owner typed", () => {
    const item = menuFixture({ itemAliasesName: "からあげ" });
    assert.strictEqual(
      getNewItemData(item, JP, VALIDATED).itemAliasesName,
      "からあげ",
    );
  });

  it("gives an item with no alias an empty one rather than nothing", () => {
    const item = menuFixture({ itemAliasesName: "" });
    assert.strictEqual(getNewItemData(item, JP, VALIDATED).itemAliasesName, "");
  });

  it("carries the lunch and dinner settings across", () => {
    const both = getNewItemData(
      menuFixture({ availableLunch: true, availableDinner: true }),
      JP,
      VALIDATED,
    );
    assert.strictEqual(both.availableLunch, true);
    assert.strictEqual(both.availableDinner, true);

    const neither = getNewItemData(
      menuFixture({ availableLunch: false, availableDinner: false }),
      JP,
      VALIDATED,
    );
    assert.strictEqual(neither.availableLunch, false);
    assert.strictEqual(neither.availableDinner, false);

    const lunchOnly = getNewItemData(
      menuFixture({ availableLunch: true, availableDinner: false }),
      JP,
      VALIDATED,
    );
    assert.strictEqual(lunchOnly.availableLunch, true);
    assert.strictEqual(lunchOnly.availableDinner, false);
  });

  it("carries the days the item is not sold on", () => {
    const item = menuFixture({ exceptDay: { "0": true, "6": true } });
    assert.deepStrictEqual(getNewItemData(item, JP, VALIDATED).exceptDay, {
      "0": true,
      "6": true,
    });
  });

  it("gives an item with no excluded days an empty holder", () => {
    assert.deepStrictEqual(
      getNewItemData(menuFixture(), JP, VALIDATED).exceptDay,
      {},
    );
  });

  it("keeps the options the owner set", () => {
    const item = menuFixture({ itemOptionCheckbox: ["サイズ,S,M", "のり"] });
    assert.deepStrictEqual(
      getNewItemData(item, JP, VALIDATED).itemOptionCheckbox,
      ["サイズ,S,M", "のり"],
    );
  });

  // 無いときに空の入れ物を置くのは、Firestore が undefined を拒むため。
  //
  // 実装は images.item 以外の鍵も落とすが、MenuImages は item しか宣言しておらず
  // それは必須なので、型を守る限り区別できる入力を作れない。あの枝は型に反する
  // Firestore の生データに対する守りで、ここでは到達できない。
  it("carries the item image, and an empty holder when there is none", () => {
    const itemImage = {
      original: "a.jpg",
      resizedImages: { "600": "a-600.jpg" },
    };
    const withImage = menuFixture({ images: { item: itemImage } });
    assert.deepStrictEqual(getNewItemData(withImage, JP, VALIDATED).images, {
      item: itemImage,
    });
    assert.deepStrictEqual(
      getNewItemData(menuFixture(), JP, VALIDATED).images,
      {},
    );
  });
});

// 販売しない時間帯。店舗オーナーは終了を先に打つことがある。
describe("getNewItemData の除外時間", () => {
  const exceptHourOf = (start?: number, end?: number) =>
    getNewItemData(menuFixture({ exceptHour: { start, end } }), JP, VALIDATED)
      .exceptHour;

  it("keeps a range that reads forwards", () => {
    assert.deepStrictEqual(exceptHourOf(14, 17), { start: 14, end: 17 });
  });

  // 逆順に打たれたら入れ替える。そのまま保存すると、どの時刻も範囲に入らない。
  it("turns a backwards range around instead of storing it as typed", () => {
    assert.deepStrictEqual(exceptHourOf(17, 14), { start: 14, end: 17 });
  });

  // 開始と終了が同じ。> を >= にすると入れ替えが起きて、同じ値どうしなので結果は変わらないが、
  // 逆に >= を > にした場合との差はここにしか出ない。
  it("keeps a range whose ends are the same", () => {
    assert.deepStrictEqual(exceptHourOf(14, 14), { start: 14, end: 14 });
  });

  it("stores nothing when either end is missing", () => {
    assert.deepStrictEqual(exceptHourOf(14, undefined), {});
    assert.deepStrictEqual(exceptHourOf(undefined, 17), {});
    assert.deepStrictEqual(exceptHourOf(undefined, undefined), {});
  });

  // 0時は未設定ではない。|| で見ていると、0時始まりの範囲が消える。
  it("treats midnight as a real hour, not as an unset one", () => {
    assert.deepStrictEqual(exceptHourOf(0, 5), { start: 0, end: 5 });
  });
});

// 複製。元が公開でも、複製は公開しない。押し間違いで同じ商品が2つ並ぶのを防いでいる。
describe("copyMenuData", () => {
  const OWNER = "owner-uid";

  it("never publishes the copy, even when the original is public", () => {
    const published = menuFixture({ publicFlag: true, validatedFlag: true });
    assert.strictEqual(copyMenuData(published, JP, OWNER).publicFlag, false);
  });

  it("gives the copy to the owner who made it", () => {
    const copied = copyMenuData(
      menuFixture({ uid: "someone-else" }),
      JP,
      OWNER,
    );
    assert.strictEqual(copied.uid, OWNER);
  });

  it("stamps the copy with a creation time", () => {
    assert.notStrictEqual(
      copyMenuData(menuFixture(), JP, OWNER).createdAt,
      undefined,
    );
  });

  it("carries the name, price and options across", () => {
    const original = menuFixture({
      itemName: "から揚げ",
      price: 800,
      itemOptionCheckbox: ["サイズ,S,M"],
    });
    const copied = copyMenuData(original, JP, OWNER);
    assert.strictEqual(copied.itemName, "から揚げ");
    assert.strictEqual(copied.price, 800);
    assert.deepStrictEqual(copied.itemOptionCheckbox, ["サイズ,S,M"]);
  });

  // 消された商品を複製しても、複製は消えていない状態で作られる。
  it("makes the copy not deleted, even from a deleted original", () => {
    const deleted = menuFixture({ deletedFlag: true });
    assert.strictEqual(copyMenuData(deleted, JP, OWNER).deletedFlag, false);
  });

  it("clears sold-out on the copy", () => {
    const soldOut = menuFixture({ soldOut: true });
    assert.strictEqual(copyMenuData(soldOut, JP, OWNER).soldOut, false);
  });
});

describe("getBlankMenuItem", () => {
  const OWNER = "owner-uid";

  // 新規作成の既定は「公開」。omochikaeri-docs#60 で挙がっている挙動で、ここでは
  // いまの形を留めるだけ。変えるならあちらで。
  it("starts a new item public and unvalidated", () => {
    const blank = getBlankMenuItem(OWNER);
    assert.strictEqual(blank.publicFlag, true);
    assert.strictEqual(blank.validatedFlag, false);
  });

  it("starts a new item available at both lunch and dinner", () => {
    const blank = getBlankMenuItem(OWNER);
    assert.strictEqual(blank.availableLunch, true);
    assert.strictEqual(blank.availableDinner, true);
  });

  it("starts with no price, no name and no options", () => {
    const blank = getBlankMenuItem(OWNER);
    assert.strictEqual(blank.price, 0);
    assert.strictEqual(blank.itemName, "");
    assert.deepStrictEqual(blank.itemOptionCheckbox, []);
  });

  it("belongs to the owner who created it and is not deleted or sold out", () => {
    const blank = getBlankMenuItem(OWNER);
    assert.strictEqual(blank.uid, OWNER);
    assert.strictEqual(blank.deletedFlag, false);
    assert.strictEqual(blank.soldOut, false);
  });

  // 税区分が未設定だと、注文の会計が税率を決められない。
  it("starts under the reduced tax rate rather than with no category", () => {
    assert.strictEqual(getBlankMenuItem(OWNER).tax, "food");
  });
});

describe("getBlankTitleItem", () => {
  const OWNER = "owner-uid";

  it("starts a heading available at both lunch and dinner", () => {
    const blank = getBlankTitleItem(OWNER);
    assert.strictEqual(blank.availableLunch, true);
    assert.strictEqual(blank.availableDinner, true);
  });

  it("starts with no name, owned by its creator, not deleted", () => {
    const blank = getBlankTitleItem(OWNER);
    assert.strictEqual(blank.name, "");
    assert.strictEqual(blank.uid, OWNER);
    assert.strictEqual(blank.deletedFlag, false);
  });
});
