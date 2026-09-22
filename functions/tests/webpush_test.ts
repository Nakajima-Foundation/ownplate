import { describe, it } from "node:test";
import assert from "node:assert";

import {
  INVALID_TARGET_CODES,
  MULTICAST_LIMIT,
  adminOrderPath,
  asPlatform,
  chunk,
  createOrderPushData,
  createWebPushData,
  detectPlatform,
  truncate,
  RECENT_SENDS_KEPT,
  appendSend,
} from "../src/functions/notify/webpushFormat";
import {
  DEFAULT_DEVICE_NAME,
  MAX_DEVICE_NAME_LENGTH,
  createInviteToken,
  deviceName,
  hashInviteToken,
  inviteExpiry,
  inviteStatus,
  inviteUrl,
  isInviteToken,
} from "../src/functions/notify/pushInviteFormat";
import { validateCheckPushInvite, validateCreatePushInvite, validateRedeemPushInvite } from "../src/lib/validator";

// Firebase Installation ID は base64url 相当の固定長文字列
const fid = "dGVzdEZpZFZhbHVlMDAx";

describe("webPushFormat", () => {
  it("builds the admin order path", () => {
    assert.strictEqual(adminOrderPath("rest1", "order1"), "/admin/restaurants/rest1/orders/order1");
  });

  it("builds a data-only payload the service worker can read", () => {
    assert.deepStrictEqual(createOrderPushData("新しい注文 #12", "テスト店", "rest1", "order1"), {
      title: "新しい注文 #12",
      body: "テスト店",
      url: "/admin/restaurants/rest1/orders/order1",
    });
  });

  it("keeps the url host-free so the service worker can resolve it", () => {
    assert.ok(createOrderPushData("t", "n", "rest1", "order1").url.startsWith("/"));
  });

  // tag を付けると同じ tag の通知は置き換えになり、renotify が無い限り再通知されない。
  // 実機で「1通目だけ出て以降沈黙する」状態になったため、payload に tag は持たせない。
  it("carries no tag", () => {
    assert.strictEqual(createOrderPushData("t", "n", "rest1", "order9").tag, undefined);
  });

  it("truncates long title and body", () => {
    const data = createWebPushData("a".repeat(300), "b".repeat(500), "/x");
    assert.strictEqual(data.title.length, 100);
    assert.ok(data.title.endsWith("…"));
    assert.strictEqual(data.body.length, 300);
  });

  // slice は UTF-16 の単位で切るため、絵文字の途中で切ると孤立サロゲートが残る
  it("never splits a surrogate pair", () => {
    const data = createWebPushData("\u{1F363}".repeat(300), "\u{1F363}".repeat(500), "/x");
    const lonely = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
    assert.ok(!lonely.test(data.title));
    assert.ok(!lonely.test(data.body));
  });

  it("counts the bound in code points, not utf-16 units", () => {
    const data = createWebPushData("\u{1F363}".repeat(300), "", "/x");
    assert.strictEqual(Array.from(data.title).length, 100);
  });

  it("keeps text at the boundary untouched", () => {
    const data = createWebPushData("a".repeat(100), "b".repeat(300), "/x");
    assert.strictEqual(data.title, "a".repeat(100));
    assert.strictEqual(data.body, "b".repeat(300));
  });

  it("emits only string values, as FCM data requires", () => {
    Object.values(createOrderPushData("t", "n", "r", "o")).forEach((value) => {
      assert.strictEqual(typeof value, "string");
    });
  });
});

describe("detectPlatform", () => {
  it("classifies the platforms the device list shows", () => {
    assert.strictEqual(detectPlatform("iPhone; CPU iPhone OS 17_4"), "ios");
    assert.strictEqual(detectPlatform("Linux; Android 14"), "android");
    assert.strictEqual(detectPlatform("Macintosh"), "other");
  });
});

describe("asPlatform", () => {
  it("maps anything unexpected to other", () => {
    assert.strictEqual(asPlatform("ios"), "ios");
    [undefined, null, 7, "windows"].forEach((value) => {
      assert.strictEqual(asPlatform(value), "other");
    });
  });
});

describe("chunk", () => {
  it("splits at the multicast limit", () => {
    const fids = Array.from({ length: MULTICAST_LIMIT + 1 }, (_unused, i) => `fid${i}`);
    const batches = chunk(fids, MULTICAST_LIMIT);
    assert.strictEqual(batches.length, 2);
    assert.strictEqual(batches[0].length, MULTICAST_LIMIT);
    assert.strictEqual(batches[1].length, 1);
  });

  it("returns no batch for an empty list", () => {
    assert.deepStrictEqual(chunk([], MULTICAST_LIMIT), []);
  });

  it("loses nothing", () => {
    const items = ["a", "b", "c", "d", "e"];
    assert.deepStrictEqual(chunk(items, 2).flat(), items);
  });
});

describe("INVALID_TARGET_CODES", () => {
  it("covers the codes that mean the target itself is dead", () => {
    assert.ok(INVALID_TARGET_CODES.includes("messaging/installation-id-not-registered"));
    assert.ok(INVALID_TARGET_CODES.includes("messaging/registration-token-not-registered"));
  });

  // invalid-argument はペイロード不正でも返る。prune の根拠にすると
  // 生きている端末の登録まで消してしまう。
  it("excludes invalid-argument so healthy fids are never pruned", () => {
    assert.ok(!INVALID_TARGET_CODES.includes("messaging/invalid-argument"));
  });
});

describe("web push validator", () => {
  const redeem = { token: "a".repeat(43), fid, platform: "ios", name: "レジ" };

  it("accepts an invite redemption from an unauthenticated device", () => {
    assert.strictEqual(validateRedeemPushInvite(redeem).result, true);
  });

  it("rejects a token that is too short to be a generated one", () => {
    assert.strictEqual(validateRedeemPushInvite({ ...redeem, token: "short" }).result, false);
  });

  it("rejects a token carrying characters base64url never produces", () => {
    assert.strictEqual(validateRedeemPushInvite({ ...redeem, token: "a".repeat(42) + "/" }).result, false);
  });

  it("rejects a missing token, fid or name", () => {
    assert.strictEqual(validateRedeemPushInvite({ ...redeem, token: "" }).result, false);
    assert.strictEqual(validateRedeemPushInvite({ ...redeem, fid: "" }).result, false);
    assert.strictEqual(validateRedeemPushInvite({ ...redeem, name: "" }).result, false);
  });

  it("rejects a fid with invalid characters", () => {
    assert.strictEqual(validateRedeemPushInvite({ ...redeem, fid: "abc$def" }).result, false);
  });

  it("rejects a non-alphabetic platform", () => {
    assert.strictEqual(validateRedeemPushInvite({ ...redeem, platform: "ios9" }).result, false);
  });

  it("accepts a check carrying only the token", () => {
    assert.strictEqual(validateCheckPushInvite({ token: "a".repeat(43) }).result, true);
  });

  it("rejects a check whose token is malformed", () => {
    assert.strictEqual(validateCheckPushInvite({ token: "short" }).result, false);
    assert.strictEqual(validateCheckPushInvite({ token: "" }).result, false);
  });

  it("rejects a check whose fid is malformed", () => {
    assert.strictEqual(validateCheckPushInvite({ token: "a".repeat(43), fid: "abc$def" }).result, false);
  });

  it("accepts an invite request naming a restaurant", () => {
    assert.strictEqual(validateCreatePushInvite({ restaurantId: "abcABC123" }).result, true);
  });

  it("rejects an invite request without a restaurant", () => {
    assert.strictEqual(validateCreatePushInvite({ restaurantId: "" }).result, false);
  });
});

describe("appendSend", () => {
  const ok = (at: number) => ({ at, ok: true });

  it("puts the newest result first", () => {
    assert.deepStrictEqual(appendSend([ok(1)], ok(2)), [ok(2), ok(1)]);
  });

  it("starts a history for a device that has none", () => {
    assert.deepStrictEqual(appendSend(undefined, ok(1)), [ok(1)]);
  });

  // 既存 doc の recentSends が配列でない場合でも落とさない
  it("ignores a stored value that is not a list", () => {
    assert.deepStrictEqual(appendSend("nonsense" as never, ok(1)), [ok(1)]);
  });

  it("keeps only the most recent results", () => {
    const history = Array.from({ length: RECENT_SENDS_KEPT }, (_unused, i) => ok(i));
    const grown = appendSend(history, ok(99));
    assert.strictEqual(grown.length, RECENT_SENDS_KEPT);
    assert.deepStrictEqual(grown[0], ok(99));
  });

  it("never grows past the cap however many times it is called", () => {
    const grown = Array.from({ length: RECENT_SENDS_KEPT * 3 }).reduce<ReturnType<typeof appendSend>>((history, _unused, i) => appendSend(history, ok(i)), []);
    assert.strictEqual(grown.length, RECENT_SENDS_KEPT);
  });

  // Firestore は undefined を書けないので、成功時に code を持たせてはいけない
  it("carries no code for a success", () => {
    assert.strictEqual("code" in appendSend([], ok(1))[0], false);
  });
});

describe("invite token", () => {
  it("generates a token the validator accepts", () => {
    assert.ok(isInviteToken(createInviteToken()));
  });

  it("never generates the same token twice", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => createInviteToken()));
    assert.strictEqual(tokens.size, 200);
  });

  // doc id にはハッシュだけを置く。DB が漏れても URL は復元できない。
  it("hashes to something that is not the token", () => {
    const token = createInviteToken();
    const hash = hashInviteToken(token);
    assert.notStrictEqual(hash, token);
    assert.ok(!hash.includes(token));
    assert.strictEqual(hash, hashInviteToken(token));
  });

  it("hashes different tokens differently", () => {
    assert.notStrictEqual(hashInviteToken(createInviteToken()), hashInviteToken(createInviteToken()));
  });

  it("puts the token in the url and nothing else", () => {
    const token = createInviteToken();
    const url = inviteUrl("example.com", token);
    assert.strictEqual(url, `https://example.com/pushdevice/${token}`);
  });
});

describe("inviteStatus", () => {
  const usable = { restaurantId: "r1", createdBy: "u1", expiresAt: 2000 };
  const fid = "dGVzdEZpZFZhbHVlMDAx";

  it("accepts an unused invite inside its window", () => {
    assert.strictEqual(inviteStatus(usable, 1999), "usable");
  });

  it("rejects an invite that was never issued", () => {
    assert.strictEqual(inviteStatus(undefined, 0), "not-found");
  });

  it("rejects an invite already redeemed", () => {
    assert.strictEqual(inviteStatus({ ...usable, usedAt: 1500 }, 1999), "used");
  });

  it("rejects an invite at and past its expiry", () => {
    assert.strictEqual(inviteStatus(usable, 2000), "expired");
    assert.strictEqual(inviteStatus(usable, 9999), "expired");
  });

  // 期限切れの使用済み招待を「期限切れ」と言うと、作り直せば通ると読めてしまう
  it("reports a redeemed invite as used even after it expired", () => {
    assert.strictEqual(inviteStatus({ ...usable, usedAt: 1500 }, 9999), "used");
  });

  // PWA の start_url が招待 URL なので、登録を済ませた端末が同じ画面に戻ってくる。
  // そこに「使用済み」とだけ出すと、動いている利用者が押し直して登録を壊す。
  it("tells the device that redeemed it apart from anyone else", () => {
    const used = { ...usable, usedAt: 1500, usedByFid: fid };
    assert.strictEqual(inviteStatus(used, 1999, fid), "registered-here");
    assert.strictEqual(inviteStatus(used, 1999, "otherFid"), "used");
    assert.strictEqual(inviteStatus(used, 1999), "used");
  });

  // 未使用の招待は、fid を渡しても usable のまま
  it("never reports registered-here for an invite nobody redeemed", () => {
    assert.strictEqual(inviteStatus(usable, 1999, fid), "usable");
  });

  it("expires ahead of the moment it was issued", () => {
    assert.ok(inviteExpiry(1000) > 1000);
  });
});

describe("deviceName", () => {
  it("keeps what the person typed", () => {
    assert.strictEqual(deviceName("  レジの iPad  ", truncate), "レジの iPad");
  });

  it("falls back rather than refusing an empty name", () => {
    [undefined, null, "", "   ", 7].forEach((value) => {
      assert.strictEqual(deviceName(value, truncate), DEFAULT_DEVICE_NAME);
    });
  });

  it("caps a long name", () => {
    const name = deviceName("あ".repeat(200), truncate);
    assert.strictEqual(Array.from(name).length, MAX_DEVICE_NAME_LENGTH);
  });
});
