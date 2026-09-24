import { describe, it } from "node:test";
import assert from "node:assert";

import { inputValueOf } from "../../src/utils/domEvent.ts";

// 入力欄の値の取り出し。無ければ空欄として扱う（空欄の入力と同じ扱いになる）。
const eventWith = (target: unknown) => ({ target }) as unknown as Event;

describe("inputValueOf", () => {
  it("takes the string the input holds", () => {
    assert.strictEqual(inputValueOf(eventWith({ value: "18" })), "18");
  });

  it("passes an empty input through as empty", () => {
    assert.strictEqual(inputValueOf(eventWith({ value: "" })), "");
  });

  it("treats a missing target as empty", () => {
    assert.strictEqual(inputValueOf(eventWith(null)), "");
    assert.strictEqual(inputValueOf(eventWith(undefined)), "");
  });

  it("keeps a numeric value rather than discarding it", () => {
    assert.strictEqual(inputValueOf(eventWith({ value: 540 })), "540");
    assert.strictEqual(inputValueOf(eventWith({ value: 0 })), "0");
  });

  it("treats a target without a usable value as empty", () => {
    assert.strictEqual(inputValueOf(eventWith({})), "");
    assert.strictEqual(inputValueOf(eventWith({ value: null })), "");
    assert.strictEqual(inputValueOf(eventWith({ value: true })), "");
    assert.strictEqual(inputValueOf(eventWith("text")), "");
  });

  it("does not fall back for a value inherited from the prototype", () => {
    assert.strictEqual(inputValueOf(eventWith(Object.create({ value: "x" }))), "x");
  });
});
