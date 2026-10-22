import { describe, it } from "node:test";
import assert from "node:assert";

import * as validator from "../../src/lib/validator";

describe("validator function", () => {
  it("should validate order update data correctly", async () => {
    const data = {
      restaurantId: "123123",
      orderId: "aaabb",
      status: 256,
      timezone: "Asia/Tokyo",
      // lng?: string;
      //timeEstimated?: admin.firestore.Timestamp;
    };
    const res = validator.validateOrderUpdate(data);
    assert.strictEqual(res.result, true);
  });

  it("should validate URL correctly", async () => {
    const url = "http://localhost:3000/callback/line";
    // const url = "http://example.com/callback/line";
    const res = validator.validateUrl(url);
    console.log(res);
    // Add assertion to make the test meaningful
    assert.ok(res);
  });
});

// ここは Callable Functions の入口。外から来た値が Firestore の道筋や Stripe への
// 問い合わせに渡る前に、形だけを見て弾く。許す文字を一つ広げると、そのぶん奥へ届く。
describe("isNumber", () => {
  it("accepts a run of digits", () => {
    assert.strictEqual(validator.isNumber("0"), true);
    assert.strictEqual(validator.isNumber("1234567890"), true);
    assert.strictEqual(validator.isNumber("-42"), true);
  });

  it("rejects anything that is not just digits", () => {
    assert.strictEqual(validator.isNumber(""), false);
    assert.strictEqual(validator.isNumber("12.5"), false);
    assert.strictEqual(validator.isNumber("12abc"), false);
    assert.strictEqual(validator.isNumber(" 12"), false);
    assert.strictEqual(validator.isNumber("12 "), false);
    assert.strictEqual(validator.isNumber("+12"), false);
    assert.strictEqual(validator.isNumber("１２"), false);
  });

  it("counts digits, including the minus sign, against maxDigits", () => {
    assert.strictEqual(validator.isNumber("1234", { maxDigits: 4 }), true);
    assert.strictEqual(validator.isNumber("12345", { maxDigits: 4 }), false);
    assert.strictEqual(validator.isNumber("-123", { maxDigits: 4 }), true);
    assert.strictEqual(validator.isNumber("-1234", { maxDigits: 4 }), false);
  });

  it("holds the low end with minDigits", () => {
    assert.strictEqual(validator.isNumber("123", { minDigits: 3 }), true);
    assert.strictEqual(validator.isNumber("12", { minDigits: 3 }), false);
  });

  it("compares the value itself against max and min", () => {
    assert.strictEqual(validator.isNumber("100", { max: 100 }), true);
    assert.strictEqual(validator.isNumber("101", { max: 100 }), false);
    assert.strictEqual(validator.isNumber("100", { min: 100 }), true);
    assert.strictEqual(validator.isNumber("99", { min: 100 }), false);
    assert.strictEqual(validator.isNumber("-1", { min: 0 }), false);
  });

  it("applies every limit it is given at once", () => {
    const within = { minDigits: 2, maxDigits: 3, min: 10, max: 500 };
    assert.strictEqual(validator.isNumber("100", within), true);
    assert.strictEqual(validator.isNumber("9", within), false);
    assert.strictEqual(validator.isNumber("501", within), false);
    assert.strictEqual(validator.isNumber("1000", within), false);
  });
});

describe("isString", () => {
  it("accepts anything when told nothing", () => {
    assert.strictEqual(validator.isString(""), true);
    assert.strictEqual(validator.isString("から揚げ弁当"), true);
    assert.strictEqual(validator.isString("<script>"), true);
  });

  it("holds the shape it is told to expect", () => {
    assert.strictEqual(validator.isString("123", { type: "number" }), true);
    assert.strictEqual(validator.isString("12a", { type: "number" }), false);
    assert.strictEqual(validator.isString("abc", { type: "alpha" }), true);
    assert.strictEqual(validator.isString("ab1", { type: "alpha" }), false);
    assert.strictEqual(
      validator.isString("ab1", { type: "alphanumeric" }),
      true,
    );
    assert.strictEqual(
      validator.isString("ab-1", { type: "alphanumeric" }),
      false,
    );
  });

  it("holds both ends of the length", () => {
    assert.strictEqual(validator.isString("abc", { maxLen: 3 }), true);
    assert.strictEqual(validator.isString("abcd", { maxLen: 3 }), false);
    assert.strictEqual(validator.isString("abc", { minLen: 3 }), true);
    assert.strictEqual(validator.isString("ab", { minLen: 3 }), false);
    assert.strictEqual(validator.isString("", { minLen: 1 }), false);
  });
});

// 文書の id はそのまま Firestore の道筋に入る。`/` や `.` を通すと、渡された
// 店舗の下ではない場所を指せる。
describe("id の形", () => {
  const traversal = ["..", "../other", "a/b", "a.b", "a b", "a\\b", "%2e%2e"];

  it("accepts letters and digits", () => {
    assert.strictEqual(validator.validateFirebaseId("abc123XYZ"), true);
    assert.strictEqual(validator.validateNumAlpha("abc123XYZ"), true);
  });

  it("lets no path separator or dot through", () => {
    traversal.forEach((bad) => {
      assert.strictEqual(
        validator.validateFirebaseId(bad),
        false,
        `firebaseId が通してはいけない: ${bad}`,
      );
      assert.strictEqual(
        validator.validateNumAlpha(bad),
        false,
        `numAlpha が通してはいけない: ${bad}`,
      );
    });
  });

  it("lets nothing empty or blank through", () => {
    assert.strictEqual(validator.validateFirebaseId(""), false);
    assert.strictEqual(validator.validateFirebaseId(" "), false);
    assert.strictEqual(validator.validateFirebaseId("\n"), false);
  });

  it("lets no quote, bracket or null byte through", () => {
    ["a'b", 'a"b', "a<b", "a{b", "a\u0000b", "a;b"].forEach((bad) => {
      assert.strictEqual(validator.validateFirebaseId(bad), false);
    });
  });

  // 外の仕組みが使う形。バーと下線だけ余分に許す。
  it("allows a bar and an underscore where the outside world needs them", () => {
    assert.strictEqual(validator.validateNumAlphaBar("ac_1-2"), true);
    assert.strictEqual(validator.validateNumAlphaBar("a/b"), false);
    assert.strictEqual(validator.validateNumAlphaBar("a.b"), false);
    assert.strictEqual(validator.validateNumAlphaBar(""), false);
  });

  it("allows what base64 needs, and the url-safe variant on top", () => {
    assert.strictEqual(validator.validateBase64("ab+/9Z"), true);
    assert.strictEqual(validator.validateBase64("ab-_9Z"), false);
    assert.strictEqual(validator.validateBase64Ext("ab-_+/9Z"), true);
    assert.strictEqual(validator.validateBase64("a=b"), false);
    assert.strictEqual(validator.validateBase64(""), false);
  });
});

describe("validateUrl", () => {
  it("accepts the addresses the callbacks come back to", () => {
    assert.ok(validator.validateUrl("https://omochikaeri.com/callback/line"));
    assert.ok(validator.validateUrl("http://localhost:3000/callback/line"));
  });

  it("rejects what is not an address", () => {
    assert.ok(!validator.validateUrl(""));
    assert.ok(!validator.validateUrl("not a url"));
    assert.ok(!validator.validateUrl("/callback/line"));
  });
});

// 呼び出しごとの決まり。必須が欠けたら empty、形が違ったら invalid を返す。
// 返すのは真偽ではなく理由つきの一覧なので、どちらで落ちたかまで見る。
const reasons = (result: { errors: unknown[] }) =>
  JSON.stringify(result.errors);

describe("注文まわりの決まり", () => {
  const ids = { restaurantId: "rest123", orderId: "order456" };

  it("accepts a well-formed order", () => {
    assert.strictEqual(validator.validateOrderCreated(ids).result, true);
    assert.strictEqual(validator.validateCancelPayment(ids).result, true);
    assert.strictEqual(validator.validateStripeReceipt(ids).result, true);
  });

  it("says which required field was missing", () => {
    const result = validator.validateOrderCreated({ restaurantId: "rest123" });
    assert.strictEqual(result.result, false);
    assert.deepStrictEqual(result.errors, [{ key: "orderId", empty: true }]);
  });

  it("treats an empty string, null and undefined all as missing", () => {
    [{ orderId: "" }, { orderId: null }, { orderId: undefined }, {}].forEach(
      (missing) => {
        const result = validator.validateOrderCreated({
          restaurantId: "rest123",
          ...missing,
        });
        assert.strictEqual(result.result, false, reasons(result));
        assert.deepStrictEqual(result.errors, [
          { key: "orderId", empty: true },
        ]);
      },
    );
  });

  it("says invalid, not missing, for a present id of the wrong shape", () => {
    const result = validator.validateOrderCreated({
      restaurantId: "rest123",
      orderId: "../other",
    });
    assert.deepStrictEqual(result.errors, [
      { key: "orderId", error: "invalid" },
    ]);
  });

  it("reports every field that is wrong, not only the first", () => {
    const result = validator.validateOrderCreated({});
    assert.deepStrictEqual(result.errors, [
      { key: "restaurantId", empty: true },
      { key: "orderId", empty: true },
    ]);
  });

  // 余分な欄は決まりに無いので見られない。ここを通った値を後段がそのまま使うと、
  // 見ていない値が奥へ届く。
  it("looks only at the fields it is told about", () => {
    const result = validator.validateOrderCreated({
      ...ids,
      injected: "../../elsewhere",
    });
    assert.strictEqual(result.result, true);
  });
});

describe("注文の状態を動かす決まり", () => {
  const base = { restaurantId: "rest123", orderId: "order456", status: 256 };

  it("accepts a status with no handover time", () => {
    assert.strictEqual(validator.validateOrderUpdate(base).result, true);
  });

  it("accepts a handover time in Firestore's own shape", () => {
    const result = validator.validateOrderUpdate({
      ...base,
      timeEstimated: { seconds: 1700000000, nanoseconds: 0 },
    });
    assert.strictEqual(result.result, true, reasons(result));
  });

  it("rejects a handover time that is not whole", () => {
    const result = validator.validateOrderUpdate({
      ...base,
      timeEstimated: { seconds: 1700000000.5, nanoseconds: 0 },
    });
    assert.strictEqual(result.result, false);
  });

  it("rejects a handover time sent as text", () => {
    const result = validator.validateOrderUpdate({
      ...base,
      timeEstimated: "2026-09-24T00:00:00Z",
    });
    assert.strictEqual(result.result, false);
  });

  it("wants the status to be a number, not the text of one", () => {
    assert.strictEqual(
      validator.validateOrderUpdate({ ...base, status: "256" }).result,
      false,
    );
  });

  // 見ているのは型だけで、値の範囲は見ていない。注文の状態として使われない 0 も
  // ここは通り、意味のある値かどうかは後段が決める。
  it("passes any number, including one no status uses", () => {
    assert.strictEqual(
      validator.validateOrderUpdate({ ...base, status: 0 }).result,
      true,
    );
    assert.strictEqual(
      validator.validateOrderUpdate({ ...base, status: -1 }).result,
      true,
    );
  });
});

describe("注文を確定する決まり", () => {
  const base = {
    restaurantId: "rest123",
    orderId: "order456",
    timeToPickup: { seconds: 1700000000, nanoseconds: 0 },
  };

  it("accepts an order with a pickup time", () => {
    assert.strictEqual(validator.validateOrderPlaced(base).result, true);
  });

  it("insists on the pickup time", () => {
    const result = validator.validateOrderPlaced({
      restaurantId: "rest123",
      orderId: "order456",
    });
    assert.deepStrictEqual(result.errors, [
      { key: "timeToPickup", empty: true },
    ]);
  });

  it("accepts a promotion and an affiliate, and checks their shape", () => {
    assert.strictEqual(
      validator.validateOrderPlaced({ ...base, promotionId: "promo1" }).result,
      true,
    );
    assert.strictEqual(
      validator.validateOrderPlaced({ ...base, promotionId: "../promo" })
        .result,
      false,
    );
    assert.strictEqual(
      validator.validateOrderPlaced({ ...base, affiliateId: "a/b" }).result,
      false,
    );
  });
});

describe("注文の中身を差し替える決まり", () => {
  const base = {
    restaurantId: "rest123",
    orderId: "order456",
    newOrder: [{ menuId: "menu1", index: 0 }],
  };

  it("accepts a new order naming a menu item and its position", () => {
    assert.strictEqual(validator.validateOrderChange(base).result, true);
  });

  it("checks every line, not just the first", () => {
    const result = validator.validateOrderChange({
      ...base,
      newOrder: [
        { menuId: "menu1", index: 0 },
        { menuId: "../menu2", index: 1 },
      ],
    });
    assert.strictEqual(result.result, false, reasons(result));
  });

  it("wants the position to be a whole number", () => {
    assert.strictEqual(
      validator.validateOrderChange({
        ...base,
        newOrder: [{ menuId: "menu1", index: 1.5 }],
      }).result,
      false,
    );
    assert.strictEqual(
      validator.validateOrderChange({
        ...base,
        newOrder: [{ menuId: "menu1", index: "0" }],
      }).result,
      false,
    );
  });

  // 空の一覧は「どの行も形を満たす」ので通る。中身が空かどうかは後段の話。
  it("accepts an empty list of lines", () => {
    assert.strictEqual(
      validator.validateOrderChange({ ...base, newOrder: [] }).result,
      true,
    );
  });
});

describe("Stripe とつなぐ決まり", () => {
  it("accepts the code and the account id the outside world sends", () => {
    assert.strictEqual(
      validator.validatorStripeOAuthConnect({ code: "ac_123-4_5" }).result,
      true,
    );
    assert.strictEqual(
      validator.validatorStripeOAuthVerify({ account_id: "acct_123" }).result,
      true,
    );
  });

  it("insists on them", () => {
    assert.strictEqual(validator.validatorStripeOAuthConnect({}).result, false);
    assert.strictEqual(validator.validatorStripeOAuthVerify({}).result, false);
  });

  it("lets no path separator through either of them", () => {
    assert.strictEqual(
      validator.validatorStripeOAuthConnect({ code: "a/b" }).result,
      false,
    );
    assert.strictEqual(
      validator.validatorStripeOAuthVerify({ account_id: "a.b" }).result,
      false,
    );
  });
});

describe("LINE とつなぐ決まり", () => {
  const base = {
    code: "abc123",
    redirect_uri: "https://omochikaeri.com/callback/line",
  };

  it("accepts a code with a return address", () => {
    assert.strictEqual(validator.validateLineValidate(base).result, true);
  });

  it("insists the return address is an address", () => {
    const result = validator.validateLineValidate({
      ...base,
      redirect_uri: "javascript:alert(1)",
    });
    assert.strictEqual(result.result, false, reasons(result));
  });

  it("insists on both the code and the return address", () => {
    assert.strictEqual(
      validator.validateLineValidate({ code: "abc123" }).result,
      false,
    );
    assert.strictEqual(
      validator.validateLineValidate({ redirect_uri: base.redirect_uri })
        .result,
      false,
    );
  });

  it("checks the shop id when one is sent, and does not require it", () => {
    assert.strictEqual(
      validator.validateLineValidate({ ...base, restaurantId: "rest123" })
        .result,
      true,
    );
    assert.strictEqual(
      validator.validateLineValidate({ ...base, restaurantId: "../rest" })
        .result,
      false,
    );
  });

  it("accepts a LINE token with the app it came from", () => {
    assert.strictEqual(
      validator.validateLiffAuthenticate({
        token: "abc123",
        liffIndexId: "liff1",
      }).result,
      true,
    );
    assert.strictEqual(
      validator.validateLiffAuthenticate({ token: "abc123" }).result,
      false,
    );
  });
});

describe("通知の引き換えの決まり", () => {
  const token = "a".repeat(22);

  it("accepts a token of the length it hands out", () => {
    const result = validator.validateCheckPushInvite({ token });
    assert.strictEqual(result.result, true, reasons(result));
  });

  it("rejects a token that is too short or too long", () => {
    assert.strictEqual(
      validator.validateCheckPushInvite({ token: "a".repeat(21) }).result,
      false,
    );
    assert.strictEqual(
      validator.validateCheckPushInvite({ token: "a".repeat(129) }).result,
      false,
    );
  });

  it("rejects a token carrying anything outside the url-safe set", () => {
    ["a/".repeat(11), "a+".repeat(11), "a ".repeat(11)].forEach((bad) => {
      assert.strictEqual(
        validator.validateCheckPushInvite({ token: bad }).result,
        false,
        `通してはいけない: ${bad}`,
      );
    });
  });

  it("wants the device, its kind and its name when the token is redeemed", () => {
    const whole = {
      token,
      fid: "fid_123-4",
      platform: "ios",
      name: "レジ横のタブレット",
    };
    assert.strictEqual(
      validator.validateRedeemPushInvite(whole).result,
      true,
      reasons(validator.validateRedeemPushInvite(whole)),
    );
    assert.strictEqual(
      validator.validateRedeemPushInvite({ ...whole, platform: "ios2" }).result,
      false,
    );
    assert.strictEqual(
      validator.validateRedeemPushInvite({ ...whole, fid: "a/b" }).result,
      false,
    );
    assert.strictEqual(
      validator.validateRedeemPushInvite({ ...whole, name: "" }).result,
      false,
    );
  });
});

describe("疎通の決まり", () => {
  it("accepts a shop and what is being asked of it", () => {
    assert.strictEqual(
      validator.validatePing({
        restaurantId: "rest123",
        operationType: "line_test",
      }).result,
      true,
    );
  });

  it("insists on both", () => {
    assert.strictEqual(
      validator.validatePing({ restaurantId: "rest123" }).result,
      false,
    );
    assert.strictEqual(
      validator.validatePing({ operationType: "line_test" }).result,
      false,
    );
  });
});
