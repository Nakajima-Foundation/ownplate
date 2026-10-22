import { describe, it } from "node:test";
import assert from "node:assert";

import { routeParamOf } from "../../src/utils/routeParam.ts";

// 型を当てるだけで、値には触れない。
describe("routeParamOf", () => {
  it("returns a string param as it is", () => {
    assert.strictEqual(routeParamOf("e2erestaurant"), "e2erestaurant");
  });

  it("keeps undefined when the route has no such param", () => {
    assert.strictEqual(routeParamOf(undefined), undefined);
  });

  it("does not rewrite an array either", () => {
    const repeated = ["a", "b"];
    assert.strictEqual(routeParamOf(repeated), repeated);
  });
});
