import { describe, it } from "node:test";
import assert from "node:assert";
import { costCal, freeThresholdOf } from "../../src/utils/commonUtils.ts";

// EC の送料。注文確定のときにサーバ（functions/src/functions/order/orderPlace.ts）でも
// 呼ばれるので、ここが狂うと客の請求額が変わる。
//
// 都道府県ごとの金額の一覧は47件（管理画面が Array(47) で作る）。位置は prefectureId - 1。

const postageList = {
  default: Array.from({ length: 47 }, (_, i) => (i + 1) * 100),
};
const TOKYO = 13;
const OKINAWA = 47;

describe("costCal", () => {
  it("charges the amount set for that prefecture", () => {
    assert.strictEqual(costCal({ postageList }, 1, 1000), 100);
    assert.strictEqual(costCal({ postageList }, TOKYO, 1000), 1300);
    assert.strictEqual(costCal({ postageList }, OKINAWA, 1000), 4700);
  });

  it("reads the position as prefectureId minus one", () => {
    assert.strictEqual(costCal({ postageList }, 2, 1000), 200);
  });
});

// 送料無料になる金額。
describe("costCal の無料の境目", () => {
  it("charges nothing once the total reaches the threshold", () => {
    assert.strictEqual(
      costCal({ postageList, freeThreshold: 5000 }, TOKYO, 5000),
      0,
    );
    assert.strictEqual(
      costCal({ postageList, freeThreshold: 5000 }, TOKYO, 5001),
      0,
    );
  });

  // 境目ちょうどは無料。1円下は有料。ここが1円ずれると、客の請求額が送料ぶん変わる。
  it("still charges one yen below the threshold", () => {
    assert.strictEqual(
      costCal({ postageList, freeThreshold: 5000 }, TOKYO, 4999),
      1300,
    );
  });

  it("charges when no threshold is set", () => {
    assert.strictEqual(costCal({ postageList }, TOKYO, 999999), 1300);
  });

  // 0 は「常に無料」。
  it("makes every order free when the threshold is zero", () => {
    assert.strictEqual(
      costCal({ postageList, freeThreshold: 0 }, TOKYO, 100),
      0,
    );
    assert.strictEqual(costCal({ postageList, freeThreshold: 0 }, TOKYO, 0), 0);
  });

  // 管理画面の数値欄を空のまま保存すると "" が入る。これを 0 と読むと常に無料になってしまう。
  it("charges when the saved threshold is an empty string", () => {
    assert.strictEqual(
      costCal({ postageList, freeThreshold: "" }, TOKYO, 100),
      1300,
    );
  });
});

describe("freeThresholdOf", () => {
  it("reads a number, including zero", () => {
    assert.strictEqual(freeThresholdOf(0), 0);
    assert.strictEqual(freeThresholdOf(3000), 3000);
    assert.strictEqual(freeThresholdOf(-5), -5);
  });

  it("reads a numeric string as a number", () => {
    assert.strictEqual(freeThresholdOf("3000"), 3000);
    assert.strictEqual(freeThresholdOf("0"), 0);
  });

  it("treats empty, missing and non-numeric values as not set", () => {
    [undefined, null, "", "abc", NaN, true, false, {}, []].forEach((raw) => {
      assert.strictEqual(freeThresholdOf(raw), null, JSON.stringify(raw));
    });
  });
});

describe("costCal が何も請求しない場合", () => {
  it("charges nothing when the prefecture is not set", () => {
    assert.strictEqual(costCal({ postageList }, 0, 1000), 0);
  });

  it("charges nothing when there is no postage information at all", () => {
    assert.strictEqual(costCal(null, TOKYO, 1000), 0);
    assert.strictEqual(costCal(undefined, TOKYO, 1000), 0);
    assert.strictEqual(costCal({}, TOKYO, 1000), 0);
  });

  // 一覧が1件だけ。`postageList.length > 0` の境目。> 1 にすると1件の一覧が無視される。
  it("uses a list of exactly one entry", () => {
    assert.strictEqual(
      costCal({ postageList: { default: [300] } }, 1, 1000),
      300,
    );
  });

  it("charges nothing when the list is empty", () => {
    assert.strictEqual(
      costCal({ postageList: { default: [] } }, TOKYO, 1000),
      0,
    );
  });

  // 一覧が無い形。postageList はあるが default が無い。
  it("charges nothing when the default list is missing", () => {
    assert.strictEqual(costCal({ postageList: {} }, TOKYO, 1000), 0);
  });
});

// 一覧の外を指したとき。管理画面は常に47件で作るが、一覧の短い古い文書では届きうる。
// NaN を返すと注文の合計に入り、そのまま決済へ行くので 0 にする。
describe("costCal が一覧の外を指したとき", () => {
  const shortList = { default: [100, 200] };

  it("charges nothing rather than NaN", () => {
    assert.strictEqual(costCal({ postageList: shortList }, 47, 1000), 0);
    assert.strictEqual(costCal({ postageList: shortList }, 3, 1000), 0);
  });

  it("charges nothing for a broken amount in the list", () => {
    assert.strictEqual(
      costCal({ postageList: JSON.parse('{"default":[100,"x"]}') }, 2, 1000),
      0,
    );
  });

  it("still charges correctly inside the short list", () => {
    assert.strictEqual(costCal({ postageList: shortList }, 1, 1000), 100);
    assert.strictEqual(costCal({ postageList: shortList }, 2, 1000), 200);
  });

  it("returns zero before reaching the list when the order is free", () => {
    assert.strictEqual(
      costCal({ postageList: shortList, freeThreshold: 500 }, 47, 1000),
      0,
    );
  });

  it("charges nothing for a negative prefecture", () => {
    assert.strictEqual(costCal({ postageList }, -1, 1000), 0);
  });

  // prefectureId は入力経路で型が変わる。郵便番号から選ぶと数、都道府県の欄から
  // 選ぶと文字列がそのまま保存される（omochikaeri-docs #222）。**請求額は同じ**で
  // なければならない。
  it("charges the same whether the prefecture arrives as a number or a string", () => {
    assert.strictEqual(
      costCal({ postageList }, TOKYO, 1000),
      costCal({ postageList }, String(TOKYO), 1000),
    );
    assert.strictEqual(costCal({ postageList }, "13", 1000), 1300);
    assert.strictEqual(costCal({ postageList }, "1", 1000), 100);
    assert.strictEqual(costCal({ postageList }, "47", 1000), 4700);
  });

  it("charges nothing for an empty or non-numeric prefecture", () => {
    assert.strictEqual(costCal({ postageList }, "", 1000), 0);
    assert.strictEqual(costCal({ postageList }, undefined, 1000), 0);
    assert.strictEqual(costCal({ postageList }, "abc", 1000), 0);
  });
});
