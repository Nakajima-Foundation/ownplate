import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import { lineGuard, lineVerify } from "../../src/lib/line/line.ts";

// LINE から戻ってきたときに、送り出した本人かを state と nonce で照かめる守り。
// ここが通ってしまうと、他人が用意した認可応答でログインさせられる。
// cookie を読むだけなので、document を差し替えれば試験から呼べる。

const setCookie = (value: string) => {
  (globalThis as { document?: { cookie: string } }).document = {
    cookie: value,
  };
};

const cookieWith = (params: Record<string, string>) =>
  `line_params=${encodeURIComponent(JSON.stringify(params))}`;

const SENT = { state: "s0.5", nonce: "n0.25" };

describe("lineGuard", () => {
  beforeEach(() => setCookie(cookieWith(SENT)));

  it("送り出した state と nonce が揃っていれば通す", () => {
    assert.deepStrictEqual(lineGuard(SENT.nonce, SENT.state), SENT);
  });

  it("state が違えば投げる", () => {
    assert.throws(() => lineGuard(SENT.nonce, "s0.9"), /invalid state/);
  });

  it("nonce が違えば投げる", () => {
    assert.throws(() => lineGuard("n0.9", SENT.state), /invalid state/);
  });

  // 空文字で素通りしないこと。片方が空なら弾く。
  it("空の state や nonce では通さない", () => {
    assert.throws(() => lineGuard(SENT.nonce, ""), /invalid state/);
    assert.throws(() => lineGuard("", SENT.state), /invalid state/);
  });

  // cookie が無い（期限切れなど）ときは通さない。JSON.parse("") が投げる。
  it("cookie が無ければ通さない", () => {
    setCookie("");
    assert.throws(() => lineGuard(SENT.nonce, SENT.state));
  });

  // 他の cookie に紛れていても読めること。
  it("ほかの cookie と並んでいても読める", () => {
    setCookie(`foo=bar; ${cookieWith(SENT)}; baz=qux`);
    assert.deepStrictEqual(lineGuard(SENT.nonce, SENT.state), SENT);
  });
});

describe("lineVerify", () => {
  beforeEach(() => setCookie(cookieWith(SENT)));

  it("state が合えば真", () => {
    assert.strictEqual(lineVerify(SENT.state), true);
  });

  it("state が違えば偽", () => {
    assert.strictEqual(lineVerify("s0.9"), false);
    assert.strictEqual(lineVerify(""), false);
  });
});
