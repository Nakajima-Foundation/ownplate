import { describe, it } from "node:test";
import assert from "node:assert";
import { costCal } from "../../src/utils/commonUtils.ts";

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

  // 0 を設定すると「常に無料」のつもりだが、`freeThreshold || null` で落ちるので課金される。
  // 管理画面の読み込み（Postage.vue の `if (data.freeThreshold)`）でも同じく落ちる。
  // いまの挙動として留める。直すかは omochikaeri-docs の課題。
  it("ignores a threshold of zero and charges anyway", () => {
    assert.strictEqual(
      costCal({ postageList, freeThreshold: 0 }, TOKYO, 100),
      1300,
    );
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

// 一覧の外を指したときの形。いまは NaN が返る。
//
// 管理画面は常に47件で作るので、都道府県の選択（1〜47）からは届かない。ただし古い店舗や
// 途中まで保存された文書で一覧が短いと届きうる。NaN は注文の合計に入り、そのまま Stripe へ行く。
// 到達を示せていないので直さず、そうなっていることだけを留める。
describe("costCal が一覧の外を指したとき", () => {
  const shortList = { default: [100, 200] };

  it("gives back NaN rather than nothing", () => {
    assert.strictEqual(
      Number.isNaN(costCal({ postageList: shortList }, 47, 1000)),
      true,
    );
    assert.strictEqual(
      Number.isNaN(costCal({ postageList: shortList }, 3, 1000)),
      true,
    );
  });

  it("still charges correctly inside the short list", () => {
    assert.strictEqual(costCal({ postageList: shortList }, 1, 1000), 100);
    assert.strictEqual(costCal({ postageList: shortList }, 2, 1000), 200);
  });

  // 無料の境目を超えていれば、一覧の外でも NaN にならない（先に 0 で返る）。
  it("returns zero before reaching the list when the order is free", () => {
    assert.strictEqual(
      costCal({ postageList: shortList, freeThreshold: 500 }, 47, 1000),
      0,
    );
  });

  // 負の prefectureId も一覧の外。
  it("gives back NaN for a negative prefecture", () => {
    assert.strictEqual(Number.isNaN(costCal({ postageList }, -1, 1000)), true);
  });
});
