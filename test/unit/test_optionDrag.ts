import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { parse } from "vue/compiler-sfc";

// オプションの目印が中身の文字列から作られると、空のオプションが2つ並んだだけで
// vuedraggable が別の行を動かす（実測: 5行が7行になり、画面と保存される値がずれる）。
// 目印の作り方は src/utils/optionRows.ts で試験できるが、画面がそれを使っているかは
// 画面を読まないと分からないので、ここで結びつきを押さえる。

const root = fileURLToPath(new URL("../../", import.meta.url));
const pageFile = "src/app/admin/Restaurants/MenuItemPage.vue";

type RootNode = NonNullable<
  NonNullable<ReturnType<typeof parse>["descriptor"]["template"]>["ast"]
>;
type TemplateChild = RootNode["children"][number];
type ElementNode = Extract<TemplateChild, { tag: string; props: unknown[] }>;

const isElement = (node: TemplateChild): node is ElementNode =>
  "tag" in node && "props" in node;

const draggablesIn = (node: TemplateChild): ElementNode[] => {
  if (!isElement(node)) {
    return [];
  }
  const own = node.tag === "draggable" ? [node] : [];
  return [...own, ...node.children.flatMap(draggablesIn)];
};

const draggablesOf = (source: string): ElementNode[] => {
  const ast = parse(source).descriptor.template?.ast;
  return ast ? ast.children.flatMap(draggablesIn) : [];
};

// :item-key="..." の中身。動的な引数（:[name]=）や v-bind="obj" は名前が読めないので
// 対象外になり、undefined が返る＝落ちる。
const itemKeyExpression = (node: ElementNode): string | undefined => {
  const bind = node.props.find(
    (prop) =>
      "modifiers" in prop &&
      prop.name === "bind" &&
      prop.arg !== undefined &&
      "content" in prop.arg &&
      prop.arg.content === "item-key",
  );
  return bind && "exp" in bind && bind.exp && "content" in bind.exp
    ? bind.exp.content
    : undefined;
};

// `const <name> = (row) => row.<何か>` の <何か>。形が変わったら undefined を返して落とす。
const returnedPropertyOf = (
  source: string,
  name: string,
): string | undefined => {
  const descriptor = parse(source).descriptor;
  const script = descriptor.script ?? descriptor.scriptSetup;
  if (!script) {
    return undefined;
  }
  const file = ts.createSourceFile(
    "page.ts",
    script.content,
    ts.ScriptTarget.Latest,
    true,
  );
  const found: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      ts.isArrowFunction(node.initializer) &&
      ts.isPropertyAccessExpression(node.initializer.body)
    ) {
      found.push(node.initializer.body.name.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found.length === 1 ? found[0] : undefined;
};

describe("オプションの並べ替えの目印", () => {
  const source = readFileSync(join(root, pageFile), "utf-8");

  it("binds the draggable's item-key to optionRowKey", () => {
    const draggables = draggablesOf(source);
    assert.strictEqual(
      draggables.length,
      1,
      `${pageFile} の draggable がちょうど1つでない`,
    );
    assert.strictEqual(itemKeyExpression(draggables[0]), "optionRowKey");
  });

  it("makes optionRowKey read the transient id, never the option text", () => {
    assert.strictEqual(returnedPropertyOf(source, "optionRowKey"), "id");
  });
});

// 上の2つは「そうなっている」ことしか言わない。取り出す側が壊れると、何も見ていないのに
// 緑のままになる。だから壊れた形でちゃんと落ちることを、ここで両方向に留める。
const sfc = (template: string, script: string) =>
  `<template>${template}</template>\n<script lang="ts">${script}</script>\n`;

describe("この検査自体が空振りしないこと", () => {
  const goodScript = "const optionRowKey = (optionRow) => optionRow.id;";

  it("rejects a draggable keyed on the option text", () => {
    const [node] = draggablesOf(
      sfc(
        `<draggable :item-key="(optionRow) => optionRow.text" />`,
        goodScript,
      ),
    );
    assert.notStrictEqual(itemKeyExpression(node), "optionRowKey");
  });

  it("rejects a draggable with no item-key at all", () => {
    const [node] = draggablesOf(sfc(`<draggable />`, goodScript));
    assert.strictEqual(itemKeyExpression(node), undefined);
  });

  it("rejects an item-key hidden behind v-bind or a dynamic argument", () => {
    const [spread] = draggablesOf(
      sfc(`<draggable v-bind="props" />`, goodScript),
    );
    assert.strictEqual(itemKeyExpression(spread), undefined);
    const [dynamic] = draggablesOf(
      sfc(`<draggable :[name]="optionRowKey" />`, goodScript),
    );
    assert.strictEqual(itemKeyExpression(dynamic), undefined);
  });

  it("rejects a page with no draggable, so a removed one cannot pass silently", () => {
    assert.strictEqual(draggablesOf(sfc(`<div />`, goodScript)).length, 0);
  });

  it("rejects optionRowKey reading the text", () => {
    const broken = sfc(
      `<draggable :item-key="optionRowKey" />`,
      "const optionRowKey = (optionRow) => optionRow.text;",
    );
    assert.strictEqual(returnedPropertyOf(broken, "optionRowKey"), "text");
  });

  it("rejects a renamed or missing optionRowKey rather than passing vacuously", () => {
    const renamed = sfc(
      `<draggable :item-key="rowKey" />`,
      "const rowKey = (optionRow) => optionRow.id;",
    );
    assert.strictEqual(returnedPropertyOf(renamed, "optionRowKey"), undefined);
  });

  it("accepts the shape the page actually uses", () => {
    const good = sfc(`<draggable :item-key="optionRowKey" />`, goodScript);
    const [node] = draggablesOf(good);
    assert.strictEqual(itemKeyExpression(node), "optionRowKey");
    assert.strictEqual(returnedPropertyOf(good, "optionRowKey"), "id");
  });
});
