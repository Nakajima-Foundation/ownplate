import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "vue/compiler-sfc";

// ↑↓ の守りがボタンの内側の <div> に付いていると、端の行に中身の無いボタンが残る。見えないが
// tab 順には居るので Enter で押せて、範囲の外を掴んだ配列に穴が空く。守りがどの要素に付いて
// いるかは画面を読まないと分からないので、ここで押さえる。
// optionMovedUp / optionMovedDown があるので穴は空かなくなったが、押せないことは別の守り。

const root = fileURLToPath(new URL("../../", import.meta.url));
const pageFile = "src/app/admin/Restaurants/MenuItemPage.vue";

type RootNode = NonNullable<
  NonNullable<ReturnType<typeof parse>["descriptor"]["template"]>["ast"]
>;
type TemplateChild = RootNode["children"][number];
type ElementNode = Extract<TemplateChild, { tag: string; props: unknown[] }>;

const isElement = (node: TemplateChild): node is ElementNode =>
  "tag" in node && "props" in node;

const buttonsIn = (node: TemplateChild): ElementNode[] => {
  if (!isElement(node)) {
    return [];
  }
  const own = node.tag === "button" ? [node] : [];
  return [...own, ...node.children.flatMap(buttonsIn)];
};

const buttonsOf = (source: string): ElementNode[] => {
  const ast = parse(source).descriptor.template?.ast;
  return ast ? ast.children.flatMap(buttonsIn) : [];
};

const clickExpression = (node: ElementNode): string | undefined => {
  const on = node.props.find(
    (prop) =>
      "modifiers" in prop &&
      prop.name === "on" &&
      prop.arg !== undefined &&
      "content" in prop.arg &&
      prop.arg.content === "click",
  );
  return on && "exp" in on && on.exp && "content" in on.exp
    ? on.exp.content
    : undefined;
};

// その要素自身に付いた v-if。子孫に付いたものは読まない — 読めてしまうと、直す前の形が
// 通ってしまう。
const ownIfExpression = (node: ElementNode): string | undefined => {
  const directive = node.props.find(
    (prop) => "modifiers" in prop && prop.name === "if",
  );
  return directive &&
    "exp" in directive &&
    directive.exp &&
    "content" in directive.exp
    ? directive.exp.content
    : undefined;
};

const buttonCalling = (
  source: string,
  handler: string,
): ElementNode | undefined =>
  buttonsOf(source).find((node) =>
    (clickExpression(node) ?? "").startsWith(`${handler}(`),
  );

describe("オプションの端の行の矢印", () => {
  const source = readFileSync(join(root, pageFile), "utf-8");

  it("puts the top-row guard on the up button itself", () => {
    const button = buttonCalling(source, "positionUp");
    assert.ok(button, `${pageFile} に positionUp を呼ぶボタンが無い`);
    assert.match(ownIfExpression(button) ?? "", /key\s*!==\s*0/);
  });

  it("puts the bottom-row guard on the down button itself", () => {
    const button = buttonCalling(source, "positionDown");
    assert.ok(button, `${pageFile} に positionDown を呼ぶボタンが無い`);
    assert.match(ownIfExpression(button) ?? "", /length\s*-\s*1/);
  });
});

// 上の2つは「そうなっている」ことしか言わない。取り出す側が壊れると、何も見ていないのに
// 緑のままになる。だから直す前の形でちゃんと落ちることを、ここで両方向に留める。
const sfc = (template: string) => `<template>${template}</template>\n`;

describe("この検査自体が空振りしないこと", () => {
  it("rejects the shape this fix replaced, with the guard on the inner div", () => {
    const button = buttonCalling(
      sfc(
        `<button @click="positionUp(key)"><div v-if="key !== 0">up</div></button>`,
      ),
      "positionUp",
    );
    assert.ok(button);
    assert.strictEqual(ownIfExpression(button), undefined);
  });

  it("rejects a button with no guard anywhere", () => {
    const button = buttonCalling(
      sfc(`<button @click="positionDown(key)">down</button>`),
      "positionDown",
    );
    assert.ok(button);
    assert.strictEqual(ownIfExpression(button), undefined);
  });

  // v-if さえ付いていれば通る、では守りにならない。端を見ている式であることまで要る。
  it("rejects a guard that does not look at the ends", () => {
    const button = buttonCalling(
      sfc(`<button v-if="isEditing" @click="positionUp(key)">up</button>`),
      "positionUp",
    );
    assert.ok(button);
    assert.doesNotMatch(ownIfExpression(button) ?? "", /key\s*!==\s*0/);
  });

  it("rejects a renamed or removed handler rather than passing vacuously", () => {
    assert.strictEqual(
      buttonCalling(
        sfc(`<button @click="moveUp(key)">up</button>`),
        "positionUp",
      ),
      undefined,
    );
    assert.strictEqual(buttonCalling(sfc(`<div />`), "positionUp"), undefined);
  });

  it("accepts the shape the page actually uses", () => {
    const button = buttonCalling(
      sfc(`<button v-if="key !== 0" @click="positionUp(key)">up</button>`),
      "positionUp",
    );
    assert.ok(button);
    assert.match(ownIfExpression(button) ?? "", /key\s*!==\s*0/);
  });
});
