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

// `if (!beginSubmit(submitting)) { return; }` の形か。
const isBeginSubmitGuard = (statement: ts.Statement) =>
  ts.isIfStatement(statement) &&
  ts.isPrefixUnaryExpression(statement.expression) &&
  statement.expression.operator === ts.SyntaxKind.ExclamationToken &&
  ts.isCallExpression(statement.expression.operand) &&
  statement.expression.operand.expression.getText() === "beginSubmit" &&
  statement.expression.operand.arguments.map((a) => a.getText()).join() === "submitting";

// その文の中のどこかで、名前が一致する関数を呼んでいるか（obj.confirm(...) も含む）。
const callsFunction = (node: ts.Node, name: string): boolean => {
  const callee = ts.isCallExpression(node) ? node.expression : undefined;
  const calleeName =
    callee && ts.isPropertyAccessExpression(callee) ? callee.name.text : callee?.getText();
  return calleeName === name || (ts.forEachChild(node, (c) => callsFunction(c, name) || undefined) ?? false);
};

describe("認証画面のハンドラは、Firebase を呼ぶ前に beginSubmit で止める", () => {
  handlers.forEach(({ file, name, firebase }) => {
    it(`${file.split("/").pop()} の ${name}`, () => {
      const body = findHandlerBody(scriptOf(file), name);
      assert.ok(body, `${name} が見つからない`);
      const statements = [...body.statements];
      const guard = statements.findIndex(isBeginSubmitGuard);
      const call = statements.findIndex((s) => callsFunction(s, firebase));
      assert.ok(guard >= 0, `${name} に beginSubmit の判定が無い`);
      assert.ok(call >= 0, `${name} が ${firebase} を呼んでいない（検査の前提が崩れている）`);
      assert.ok(guard < call, `${name} の beginSubmit が ${firebase} より後にある`);
    });
  });
});
