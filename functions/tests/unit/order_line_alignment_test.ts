import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// 注文の1行ぶんの情報は order / prices / options の3つに分かれて保存され、読む側は同じ添字で
// 突き合わせる（src/utils/utils.ts の getOrderItems）。どれか1つでも積み忘れると、別の行の
// オプションや金額がレシートに出る。数量0の行を落とす判定より後で、3つとも積むこと。
const root = fileURLToPath(new URL("../../", import.meta.url));
const orderCreated = "src/functions/order/orderCreated.ts";

type Pushes = { arrays: string[]; zeroGuardFirst: boolean };

const pushedArrayName = (statement: ts.Statement): string | undefined =>
  ts.isExpressionStatement(statement) &&
  ts.isCallExpression(statement.expression) &&
  ts.isPropertyAccessExpression(statement.expression.expression) &&
  statement.expression.expression.name.text === "push" &&
  ts.isIdentifier(statement.expression.expression.expression)
    ? statement.expression.expression.expression.text
    : undefined;

const perLinePushes = (source: string): Pushes | undefined => {
  const file = ts.createSourceFile("orderCreated.ts", source, ts.ScriptTarget.Latest, true);
  const found: Pushes[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isBlock(node)) {
      const guardAt = node.statements.findIndex((statement) => ts.isIfStatement(statement) && /num\s*===\s*0/.test(statement.expression.getText(file)));
      const pushAt = node.statements.map((statement, index) => (pushedArrayName(statement) === undefined ? -1 : index)).filter((index) => index >= 0);
      if (pushAt.length >= 2) {
        found.push({
          arrays: pushAt.map((index) => pushedArrayName(node.statements[index]) as string),
          zeroGuardFirst: guardAt >= 0 && pushAt.every((index) => index > guardAt),
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found.length === 1 ? found[0] : undefined;
};

// 保存する直前で client の options に戻されると、位置の解決が「カートに入れた時のメニュー」に
// 逆戻りして、請求額と印字がまたずれる。保存の1行を構文木で押さえる。
const storedOptionsSource = (source: string): string | undefined => {
  const file = ts.createSourceFile("orderCreated.ts", source, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "options" && ts.isIdentifier(node.initializer)) {
      found.push(node.initializer.text);
    }
    if (ts.isShorthandPropertyAssignment(node) && node.name.text === "options") {
      found.push("options");
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found.length === 1 ? found[0] : undefined;
};

const destructuresFromOrderData = (source: string, name: string): boolean => {
  const file = ts.createSourceFile("orderCreated.ts", source, ts.ScriptTarget.Latest, true);
  let found = false;
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer !== undefined &&
      node.initializer.getText(file) === "orderData" &&
      node.name.elements.some((element) => ts.isIdentifier(element.name) && element.name.text === name)
    ) {
      found = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
};

describe("注文の1行ぶんが、3つとも同じ枝で積まれる", () => {
  const source = readFileSync(join(root, orderCreated), "utf-8");

  it("pushes the quantity, the price and the option names together", () => {
    const pushes = perLinePushes(source);
    assert.ok(pushes, `${orderCreated} に、1行ぶんを積む枝が1つ見つからない`);
    assert.deepStrictEqual([...pushes.arrays].sort(), ["newOrder", "optionNames", "prices"]);
  });

  it("drops the zero-quantity line before pushing anything", () => {
    assert.strictEqual(perLinePushes(source)?.zeroGuardFirst, true);
  });
});

// 取り出す側が壊れると、何も見ていないのに緑になる。壊れた形で落ちることを両方向に留める。
describe("この検査自体が空振りしないこと", () => {
  const good = `numArray.map((num, orderKey) => {
    if (num === 0) { return; }
    newOrder.push(num);
    prices.push(price * num);
    optionNames.push(names);
  });`;

  it("accepts the shape the code actually uses", () => {
    assert.deepStrictEqual([...(perLinePushes(good)?.arrays ?? [])].sort(), ["newOrder", "optionNames", "prices"]);
  });

  it("rejects a line whose option names are never pushed", () => {
    const missing = `numArray.map((num, orderKey) => {
      if (num === 0) { return; }
      newOrder.push(num);
      prices.push(price * num);
    });`;
    assert.notDeepStrictEqual([...(perLinePushes(missing)?.arrays ?? [])].sort(), ["newOrder", "optionNames", "prices"]);
  });

  it("rejects a push that happens before the zero-quantity line is dropped", () => {
    const early = `numArray.map((num, orderKey) => {
      optionNames.push(names);
      if (num === 0) { return; }
      newOrder.push(num);
      prices.push(price * num);
    });`;
    assert.notStrictEqual(perLinePushes(early)?.zeroGuardFirst, true);
  });

  it("rejects code with no zero-quantity guard at all", () => {
    const noGuard = `numArray.map((num, orderKey) => {
      newOrder.push(num);
      prices.push(price * num);
      optionNames.push(names);
    });`;
    assert.strictEqual(perLinePushes(noGuard)?.zeroGuardFirst, false);
  });
});

describe("保存される options は、サーバが位置から作ったもの", () => {
  const source = readFileSync(join(root, orderCreated), "utf-8");

  it("stores the names the server resolved, not the ones the client sent", () => {
    assert.strictEqual(storedOptionsSource(source), "newOptions");
  });

  it("does not take the option names off the order the client wrote", () => {
    assert.strictEqual(destructuresFromOrderData(source, "options"), false);
  });

  it("still takes the positions off the order the client wrote", () => {
    assert.strictEqual(destructuresFromOrderData(source, "rawOptions"), true);
  });
});

describe("保存の検査が空振りしないこと", () => {
  it("rejects storing the client's option names", () => {
    const clientCopy = `const { options, rawOptions } = orderData;
      await orderRef.set(utils.filterData({ order: newOrderData, options, rawOptions }));`;
    assert.strictEqual(storedOptionsSource(clientCopy), "options");
    assert.strictEqual(destructuresFromOrderData(clientCopy, "options"), true);
  });

  it("accepts the shape the code actually uses", () => {
    const serverDerived = `const { rawOptions } = orderData;
      await orderRef.set(utils.filterData({ order: newOrderData, options: newOptions, rawOptions }));`;
    assert.strictEqual(storedOptionsSource(serverDerived), "newOptions");
    assert.strictEqual(destructuresFromOrderData(serverDerived, "options"), false);
    assert.strictEqual(destructuresFromOrderData(serverDerived, "rawOptions"), true);
  });

  it("rejects a file that stores no option names at all", () => {
    const missing = `await orderRef.set(utils.filterData({ order: newOrderData }));`;
    assert.strictEqual(storedOptionsSource(missing), undefined);
  });
});
