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
