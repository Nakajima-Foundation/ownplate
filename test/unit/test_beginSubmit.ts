import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { parse } from "vue/compiler-sfc";

import { beginSubmit } from "../../src/utils/beginSubmit.ts";

describe("beginSubmit", () => {
  it("lets the first submit through and marks it in flight", () => {
    const flag = { value: false };
    assert.strictEqual(beginSubmit(flag), true);
    assert.strictEqual(flag.value, true);
  });

  // 送信中に届いた2回目。ここで止めないと Firebase が2回呼ばれる。
  it("stops a second submit while the first is in flight", () => {
    const flag = { value: true };
    assert.strictEqual(beginSubmit(flag), false);
    assert.strictEqual(flag.value, true);
  });

  it("lets a submit through again once the flag is released", () => {
    const flag = { value: false };
    beginSubmit(flag);
    flag.value = false;
    assert.strictEqual(beginSubmit(flag), true);
  });
});

// 上の関数が正しくても、ハンドラが使っていなければ意味が無い。各認証画面のハンドラで、
// beginSubmit の判定が Firebase を呼ぶより前にあることを構文木で確かめる。
// 画面の処理は Firebase・store・router に依存するので、単体では動かせないため。

const root = fileURLToPath(new URL("../../", import.meta.url));

const handlers = [
  { file: "src/app/auth/SignInPage.vue", name: "onSignin", firebase: "signInWithEmailAndPassword" },
  { file: "src/app/auth/ResetPasswordPage.vue", name: "handleNext", firebase: "sendPasswordResetEmail" },
  { file: "src/app/auth/PhoneLogin.vue", name: "handleSubmit", firebase: "signInWithPhoneNumber" },
  { file: "src/app/auth/PhoneLogin.vue", name: "handleCode", firebase: "confirm" },
];

const scriptOf = (file: string) => {
  const descriptor = parse(readFileSync(join(root, file), "utf-8")).descriptor;
  const script = descriptor.script ?? descriptor.scriptSetup;
  assert.ok(script, `${file} に script が無い`);
  return ts.createSourceFile(file, script.content, ts.ScriptTarget.Latest, true);
};

const findHandlerBody = (source: ts.SourceFile, name: string): ts.Block | undefined => {
  const found: ts.Block[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      ts.isArrowFunction(node.initializer) &&
      ts.isBlock(node.initializer.body)
    ) {
      found.push(node.initializer.body);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found[0];
};

// 条件だけでなく、中で必ず抜けることまで見る。条件が同じでも return が無ければ、
// 素通りして Firebase を呼ぶ。
const exitsUnconditionally = (statement: ts.Statement): boolean =>
  ts.isReturnStatement(statement) ||
  ts.isThrowStatement(statement) ||
  (ts.isBlock(statement) &&
    statement.statements.some((s) => ts.isReturnStatement(s) || ts.isThrowStatement(s)));

const isBeginSubmitCondition = (expression: ts.Expression) =>
  ts.isPrefixUnaryExpression(expression) &&
  expression.operator === ts.SyntaxKind.ExclamationToken &&
  ts.isCallExpression(expression.operand) &&
  expression.operand.expression.getText() === "beginSubmit" &&
  expression.operand.arguments.map((a) => a.getText()).join() === "submitting";

// `if (!beginSubmit(submitting)) { return; }` の形か。
const isBeginSubmitGuard = (statement: ts.Statement) =>
  ts.isIfStatement(statement) &&
  isBeginSubmitCondition(statement.expression) &&
  exitsUnconditionally(statement.thenStatement);

// その文の中のどこかで、名前が一致する関数を呼んでいるか（obj.confirm(...) も含む）。
const callsFunction = (node: ts.Node, name: string): boolean => {
  const callee = ts.isCallExpression(node) ? node.expression : undefined;
  const calleeName =
    callee && ts.isPropertyAccessExpression(callee) ? callee.name.text : callee?.getText();
  return calleeName === name || (ts.forEachChild(node, (c) => callsFunction(c, name) || undefined) ?? false);
};

// 問題が無ければ null、あればその理由。
const guardProblem = (
  source: ts.SourceFile,
  name: string,
  firebase: string,
): string | null => {
  const body = findHandlerBody(source, name);
  if (!body) {
    return `${name} が見つからない`;
  }
  const statements = [...body.statements];
  const guard = statements.findIndex(isBeginSubmitGuard);
  const call = statements.findIndex((s) => callsFunction(s, firebase));
  if (call < 0) {
    return `${name} が ${firebase} を呼んでいない（検査の前提が崩れている）`;
  }
  if (guard < 0) {
    return `${name} に、必ず抜ける beginSubmit の判定が無い`;
  }
  return guard < call ? null : `${name} の beginSubmit が ${firebase} より後にある`;
};

const snippet = (body: string) =>
  ts.createSourceFile(
    "snippet.ts",
    `const go = async () => {${body}};`,
    ts.ScriptTarget.Latest,
    true,
  );

// 検査そのものを両方向で固定する。ここが赤くならないと、下の実ファイルの検査は何も守らない。
describe("guardProblem — 判定そのもの", () => {
  it("accepts a guard that returns before the call", () => {
    [
      `if (!beginSubmit(submitting)) { return; } await fire();`,
      `if (!beginSubmit(submitting)) return; await fire();`,
      `setup(); if (!beginSubmit(submitting)) { log(); return; } await fire();`,
    ].forEach((body) => assert.strictEqual(guardProblem(snippet(body), "go", "fire"), null, body));
  });

  // 見た目は同じ判定でも、抜けなければ Firebase まで素通りする。
  it("rejects a guard that does not leave the handler", () => {
    [
      `if (!beginSubmit(submitting)) { log("busy"); } await fire();`,
      `if (!beginSubmit(submitting)) {} await fire();`,
      `if (!beginSubmit(submitting)) { if (x) { return; } } await fire();`,
    ].forEach((body) => assert.notStrictEqual(guardProblem(snippet(body), "go", "fire"), null, body));
  });

  it("rejects a missing guard, a guard after the call, or a guard on another flag", () => {
    [
      `await fire();`,
      `await fire(); if (!beginSubmit(submitting)) { return; }`,
      `const p = fire(); if (!beginSubmit(submitting)) { return; } await p;`,
      `if (!beginSubmit(other)) { return; } await fire();`,
      `if (beginSubmit(submitting)) { return; } await fire();`,
    ].forEach((body) => assert.notStrictEqual(guardProblem(snippet(body), "go", "fire"), null, body));
  });
});

describe("認証画面のハンドラは、Firebase を呼ぶ前に beginSubmit で止める", () => {
  handlers.forEach(({ file, name, firebase }) => {
    it(`${file.split("/").pop()} の ${name}`, () => {
      assert.strictEqual(guardProblem(scriptOf(file), name, firebase), null);
    });
  });
});

// 送信中の判定を戻す場所。成功時に戻すと、画面が遷移するまでの間に再送できてしまう。
// 失敗の側（catch）で戻すか、成功後も続けて使う form なら両方の側（finally）で戻す。
type ReleaseSite = "catch" | "finally" | "success" | "other";

const isRelease = (node: ts.Node): boolean =>
  ts.isBinaryExpression(node) &&
  node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
  node.left.getText() === "submitting.value" &&
  node.right.kind === ts.SyntaxKind.FalseKeyword;

// その位置から外側へたどり、最初に当たった catch / finally / then を返す。
const siteOf = (node: ts.Node | undefined): ReleaseSite => {
  if (!node) {
    return "other";
  }
  if (ts.isCatchClause(node)) {
    return "catch";
  }
  if (node.parent && ts.isTryStatement(node.parent) && node.parent.finallyBlock === node) {
    return "finally";
  }
  const call = ts.isArrowFunction(node) ? node.parent : undefined;
  const method =
    call && ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression)
      ? call.expression.name.text
      : undefined;
  const sites: Record<string, ReleaseSite> = { catch: "catch", finally: "finally", then: "success" };
  return method && sites[method] ? sites[method] : siteOf(node.parent);
};

const releaseSites = (body: ts.Block): ReleaseSite[] => {
  const found: ReleaseSite[] = [];
  const visit = (node: ts.Node) => {
    if (isRelease(node)) {
      found.push(siteOf(node));
    }
    ts.forEachChild(node, visit);
  };
  visit(body);
  return found;
};

// 入れ子の関数の中は見ない（別の実行経路）。
const containsReturn = (node: ts.Node): boolean =>
  ts.isReturnStatement(node) ||
  (!ts.isFunctionLike(node) &&
    (ts.forEachChild(node, (c) => containsReturn(c) || undefined) ?? false));

// 戻す文より前に、途中で抜ける文が無いか。あると、その経路では戻さずに抜ける
// （二段階認証が必要なときの早期 return がそれで、TOTP を閉じても form が無効のまま残る）。
const releaseBeforeEveryReturn = (release: ts.Node): boolean => {
  const statement = release.parent;
  const block = statement?.parent;
  if (!statement || !block || !ts.isBlock(block)) {
    return false;
  }
  const index = block.statements.findIndex((s) => s === statement);
  return block.statements.slice(0, index).every((s) => !containsReturn(s));
};

const releasesOf = (body: ts.Block): ts.Node[] => {
  const found: ts.Node[] = [];
  const visit = (node: ts.Node) => {
    if (isRelease(node)) {
      found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(body);
  return found;
};

describe("送信中の判定を戻す場所", () => {
  const expected = [
    // 成功すると画面が遷移する。遷移を待つ間に再送できないよう、失敗時だけ戻す。
    { file: "src/app/auth/SignInPage.vue", name: "onSignin", sites: ["catch"] },
    { file: "src/app/auth/PhoneLogin.vue", name: "handleCode", sites: ["catch"] },
    // 成功後も確認コードの form に進んで同じ判定を使うので、両方の側で戻す。
    { file: "src/app/auth/PhoneLogin.vue", name: "handleSubmit", sites: ["finally"] },
    // 成功すると送信完了の表示に切り替わり、form は使わない。両方の側で戻してよい。
    { file: "src/app/auth/ResetPasswordPage.vue", name: "handleNext", sites: ["finally"] },
  ];
  expected.forEach(({ file, name, sites }) => {
    it(`${file.split("/").pop()} の ${name} は ${sites.join(" / ")} で戻す`, () => {
      const body = findHandlerBody(scriptOf(file), name);
      assert.ok(body, `${name} が見つからない`);
      assert.deepStrictEqual(releaseSites(body), sites);
    });

    it(`${file.split("/").pop()} の ${name} は、途中で抜ける前に戻す`, () => {
      const body = findHandlerBody(scriptOf(file), name);
      assert.ok(body, `${name} が見つからない`);
      releasesOf(body).forEach((release) => {
        assert.ok(releaseBeforeEveryReturn(release), `${name} で、戻す前に抜ける経路がある`);
      });
    });
  });
});


describe("releaseBeforeEveryReturn — 判定そのもの", () => {
  const releaseIn = (body: string) => {
    const source = snippet(body);
    const found = releasesOf(findHandlerBody(source, "go") ?? ts.factory.createBlock([]));
    assert.strictEqual(found.length, 1, "戻す文がちょうど1つでない");
    return found[0];
  };

  it("accepts a release that comes before any early return", () => {
    [
      `try { await fire(); } catch (e) { submitting.value = false; if (mfa) { return; } show(e); }`,
      `try { await fire(); } catch (e) { show(e); submitting.value = false; }`,
    ].forEach((body) => assert.strictEqual(releaseBeforeEveryReturn(releaseIn(body)), true, body));
  });

  // 早期 return の後ろに置くと、その経路では戻らない。
  it("rejects a release that an early return can skip", () => {
    [
      `try { await fire(); } catch (e) { if (mfa) { return; } submitting.value = false; }`,
      `try { await fire(); } catch (e) { if (mfa) return; show(e); submitting.value = false; }`,
    ].forEach((body) => assert.strictEqual(releaseBeforeEveryReturn(releaseIn(body)), false, body));
  });
});
