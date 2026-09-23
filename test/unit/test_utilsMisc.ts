import { describe, it } from "node:test";
import assert from "node:assert";
import {
  array2obj,
  arrayChunk,
  cleanObject,
  countObj,
  errorCode,
  errorMessage,
  forceArray,
  haversine_distance,
  orderFilter,
} from "../../src/utils/utils.ts";
import { order_status } from "../../src/config/constant.ts";
import { orderInfoFixture } from "../fixtures/orderInfo.ts";

// Firestore の `in` は一度に10件までなので、鍵をその大きさで割ってから引く。
// 割り方を間違えると、超えた分の問い合わせが黙って落ちる。
describe("arrayChunk", () => {
  it("splits into chunks of the size asked for", () => {
    assert.deepStrictEqual(arrayChunk([1, 2, 3, 4, 5], 2), [
      [1, 2],
      [3, 4],
      [5],
    ]);
    assert.deepStrictEqual(arrayChunk([1, 2, 3], 3), [[1, 2, 3]]);
  });

  it("keeps everything when the chunk is bigger than the list", () => {
    assert.deepStrictEqual(arrayChunk([1, 2, 3], 10), [[1, 2, 3]]);
  });

  // 既定は1。大きさを渡し忘れると1件ずつになり、問い合わせの回数が要素数と同じになる。
  it("splits one by one when no size is given", () => {
    assert.deepStrictEqual(arrayChunk([1, 2, 3]), [[1], [2], [3]]);
  });

  it("gives nothing back for an empty list", () => {
    assert.deepStrictEqual(arrayChunk([], 2), []);
  });

  // 0 を渡すと空の塊が要素数だけ並ぶ。要素は1つも入らないので、問い合わせが全部空になる。
  it("produces empty chunks for a size of zero, losing every element", () => {
    assert.deepStrictEqual(arrayChunk([1, 2, 3], 0), [[], [], []]);
  });

  it("does not modify the list it was given", () => {
    const original = [1, 2, 3];
    arrayChunk(original, 2);
    assert.deepStrictEqual(original, [1, 2, 3]);
  });
});

// 一覧を id で引ける形に直す。
describe("array2obj", () => {
  it("keys each item by its id", () => {
    assert.deepStrictEqual(array2obj([{ id: "a" }, { id: "b" }]), {
      a: { id: "a" },
      b: { id: "b" },
    });
  });

  // id の無いものは落ちる。落ちたことは戻り値からは分からない。
  it("drops an item that has no id, silently", () => {
    const converted = array2obj([{ id: "a" }, {}, { id: "b" }]);
    assert.deepStrictEqual(Object.keys(converted).sort(), ["a", "b"]);
  });

  // 同じ id が2つあれば後が勝つ。
  it("lets the later item win when two share an id", () => {
    const converted = array2obj([
      { id: "a", n: 1 },
      { id: "a", n: 2 },
    ]);
    assert.strictEqual(converted.a.n, 2);
  });

  it("gives nothing back for an empty list", () => {
    assert.deepStrictEqual(array2obj([]), {});
  });
});

// 注文の点数を数えるのに使う。
describe("countObj", () => {
  it("counts the elements of an array", () => {
    assert.strictEqual(countObj([1, 2, 3]), 3);
  });

  it("counts through a nested array", () => {
    assert.strictEqual(countObj([[1, 2], [3]]), 3);
  });

  // object の鍵は数えない。値に降りていき、配列の要素だけを数える。
  // つまり scalar だけを持つ object は 0 になる。「項目数」を期待すると合わない。
  it("counts nothing for an object of plain values", () => {
    assert.strictEqual(countObj({ a: 1, b: 2 }), 0);
  });

  it("counts the array elements found inside an object", () => {
    assert.strictEqual(countObj({ a: [1, 2], b: { c: 3 } }), 2);
  });

  it("counts nothing for a value that is not a container", () => {
    assert.strictEqual(countObj(5), 0);
    assert.strictEqual(countObj(null), 0);
    assert.strictEqual(countObj(undefined), 0);
    assert.strictEqual(countObj("abc"), 0);
  });
});

// Firestore は undefined を拒む。保存の手前で落とす。
describe("cleanObject", () => {
  it("drops null and undefined", () => {
    assert.deepStrictEqual(
      cleanObject({ a: 1, b: null, c: undefined } as Record<string, unknown>),
      { a: 1 },
    );
  });

  // 0 と空文字は落とさない。落とすと「0円」「未入力」が保存されなくなる。
  it("keeps zero and the empty string", () => {
    assert.deepStrictEqual(
      cleanObject({ price: 0, memo: "", flag: false } as Record<
        string,
        unknown
      >),
      { price: 0, memo: "", flag: false },
    );
  });

  it("gives nothing back for an empty object", () => {
    assert.deepStrictEqual(cleanObject({}), {});
  });
});

describe("forceArray", () => {
  it("wraps a single value", () => {
    assert.deepStrictEqual(forceArray(5), [5]);
    assert.deepStrictEqual(forceArray("a"), ["a"]);
  });

  it("leaves a list alone", () => {
    assert.deepStrictEqual(forceArray([1, 2]), [1, 2]);
    assert.deepStrictEqual(forceArray([]), []);
  });
});

// 配達の距離。**メートルの整数**で返る（名前に単位が無いので、ここで留めておく）。
describe("haversine_distance", () => {
  const TOKYO_STATION = { lat: 35.6812, lng: 139.7671 };
  const SHINJUKU_STATION = { lat: 35.6896, lng: 139.7006 };

  it("gives the distance in whole metres, not kilometres", () => {
    const metres = haversine_distance(
      TOKYO_STATION.lat,
      TOKYO_STATION.lng,
      SHINJUKU_STATION.lat,
      SHINJUKU_STATION.lng,
    );
    assert.strictEqual(Number.isInteger(metres), true);
    // 東京駅と新宿駅は約6km。km で返していれば 6 前後になる。
    assert.ok(metres > 5500 && metres < 6500, `${metres} m`);
  });

  it("gives nothing for the same point", () => {
    assert.strictEqual(
      haversine_distance(
        TOKYO_STATION.lat,
        TOKYO_STATION.lng,
        TOKYO_STATION.lat,
        TOKYO_STATION.lng,
      ),
      0,
    );
  });

  it("does not care which point comes first", () => {
    const there = haversine_distance(35.6812, 139.7671, 35.6896, 139.7006);
    const back = haversine_distance(35.6896, 139.7006, 35.6812, 139.7671);
    assert.strictEqual(there, back);
  });

  it("grows with the separation", () => {
    const near = haversine_distance(35.6812, 139.7671, 35.6822, 139.7671);
    const far = haversine_distance(35.6812, 139.7671, 35.7812, 139.7671);
    assert.ok(far > near);
  });
});

// 一覧に出さない注文。取り消しや支払い待ちを混ぜると、店主の点数が合わなくなる。
describe("orderFilter", () => {
  it("hides an order that was hidden after the transaction", () => {
    assert.strictEqual(
      orderFilter(orderInfoFixture({ status: order_status.transaction_hide })),
      false,
    );
  });

  it("hides an order still waiting for payment", () => {
    assert.strictEqual(
      orderFilter(orderInfoFixture({ status: order_status.waiting_payment })),
      false,
    );
  });

  it("keeps every other state", () => {
    [
      order_status.order_placed,
      order_status.order_accepted,
      order_status.ready_to_pickup,
      order_status.transaction_complete,
      order_status.order_canceled,
    ].forEach((status) => {
      assert.strictEqual(
        orderFilter(orderInfoFixture({ status })),
        true,
        String(status),
      );
    });
  });
});

// 失敗の中身を取り出す。Firebase は code を、素の Error は message を持つ。
describe("errorCode / errorMessage", () => {
  it("reads the code Firebase puts on its errors", () => {
    assert.strictEqual(
      errorCode({ code: "auth/user-not-found" }),
      "auth/user-not-found",
    );
  });

  it("reads the message of an ordinary error", () => {
    assert.strictEqual(errorMessage(new Error("boom")), "boom");
  });

  // 文字列でないものを返すと、表示側が文字列を期待して落ちる。
  it("refuses a code or message that is not text", () => {
    assert.strictEqual(errorCode({ code: 123 }), undefined);
    assert.strictEqual(errorMessage({ message: { nested: true } }), undefined);
  });

  it("tolerates anything at all", () => {
    [null, undefined, 0, "", "text", [], {}].forEach((value) => {
      assert.strictEqual(errorCode(value), undefined);
      assert.strictEqual(errorMessage(value), undefined);
    });
  });
});
