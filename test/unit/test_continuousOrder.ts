import { Timestamp } from "firebase/firestore";
import { describe, it } from "node:test";
import assert from "node:assert";

import { isContinuousOrder } from "../../src/utils/continuousOrder.ts";

const MS_PER_HOUR = 60 * 60 * 1000;
const lastUpdatedAt = Timestamp.fromDate(new Date("2026-09-28T03:00:00.000Z"));
const hoursAfter = (hours: number) =>
  Timestamp.fromMillis(lastUpdatedAt.toMillis() + hours * MS_PER_HOUR);

describe("isContinuousOrder", () => {
  it("warns when the order came within four hours after the previous one", () => {
    [0.001, 1, 3.99].forEach((hours) => {
      assert.strictEqual(
        isContinuousOrder(hoursAfter(hours), lastUpdatedAt),
        true,
        `${hours}h`,
      );
    });
  });

  // 前の注文より古い注文を開いたときも、差が 4 時間以内なら知らせる。
  it("warns within four hours before the previous one as well", () => {
    [-0.001, -1, -3.99].forEach((hours) => {
      assert.strictEqual(
        isContinuousOrder(hoursAfter(hours), lastUpdatedAt),
        true,
        `${hours}h`,
      );
    });
  });

  it("does not warn at four hours or more, in either direction", () => {
    [4, 4.01, 24, -4, -4.01, -24].forEach((hours) => {
      assert.strictEqual(
        isContinuousOrder(hoursAfter(hours), lastUpdatedAt),
        false,
        `${hours}h`,
      );
    });
  });

  it("does not warn when both are the same instant", () => {
    assert.strictEqual(
      isContinuousOrder(
        new Timestamp(lastUpdatedAt.seconds, lastUpdatedAt.nanoseconds),
        lastUpdatedAt,
      ),
      false,
    );
  });

  // 同じ秒でも、ナノ秒が違えば別の時刻。
  it("warns when the two differ only in nanoseconds", () => {
    assert.strictEqual(
      isContinuousOrder(
        new Timestamp(lastUpdatedAt.seconds, lastUpdatedAt.nanoseconds + 1),
        lastUpdatedAt,
      ),
      true,
    );
  });

  it("does not warn when either time is missing", () => {
    assert.strictEqual(isContinuousOrder(undefined, lastUpdatedAt), false);
    assert.strictEqual(isContinuousOrder(hoursAfter(1), undefined), false);
    assert.strictEqual(isContinuousOrder(undefined, undefined), false);
  });

  // 前の注文の更新時刻が userLog に無いとき、functions は 2020 年の時刻を入れる（orderPlace.ts）。
  it("does not warn against the placeholder for an unknown previous time", () => {
    assert.strictEqual(
      isContinuousOrder(hoursAfter(1), new Timestamp(1577804400, 0)),
      false,
    );
  });
});
