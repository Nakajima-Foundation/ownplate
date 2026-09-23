import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "vue/compiler-sfc";

// ↑↓ の守りがボタンの内側の <div> に付いていると、端の行に中身の無いボタンが残る。見えないが
// tab 順には居るので Enter で押せて、範囲の外を掴んだ配列に穴が空く。守りがどの要素に付いて
// いるかは画面を読まないと分からないので、ここで押さえる。
//
// 式は丸ごと一致で見る。含まれる字面だけを見ると `key !== 0 || key === 0` のような、
// token は合っているのに端を弾かない式が通る。書き換えの自由は落ちるが、通る形を1つに
// 決めるほうが、駄目な形を数え上げるより確か。

const root = fileURLToPath(new URL("../../", import.meta.url));
const pageFile = "src/app/admin/Restaurants/MenuItemPage.vue";

const guardOfUpButton = "key !== 0";
const guardOfDownButton = "key !== menuInfo.itemOptionCheckbox.length - 1";

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

// その要素自身に付いた v-if。子孫に付いたものは読まない — 読めてしまうと、直す前の形が通る。
const ownIfExpression = (node: ElementNode): string | undefined => {
  const directive = node.props.find(
    (prop) => "modifiers" in prop && prop.name === "if",
  );
  return directive &&
    "exp" in directive &&
    directive.exp &&
    "content" in directive.exp
    ? directive.exp.content.replace(/\s+/g, " ").trim()
    : undefined;
};

const buttonsCalling = (source: string, handler: string): ElementNode[] =>
  buttonsOf(source).filter((node) =>
    (clickExpression(node) ?? "").startsWith(`${handler}(`),
  );

// 呼び手が1つであることまで見る。2つ目を守り無しで足されたら、find では見えない。
const guardOfSoleButtonCalling = (
  source: string,
  handler: string,
): string | undefined => {
  const buttons = buttonsCalling(source, handler);
  return buttons.length === 1 ? ownIfExpression(buttons[0]) : undefined;
};

describe("オプションの端の行の矢印", () => {
  const source = readFileSync(join(root, pageFile), "utf-8");

  it("guards the up button itself against the top row", () => {
    assert.strictEqual(
      guardOfSoleButtonCalling(source, "positionUp"),
      guardOfUpButton,
    );
  });

  it("guards the down button itself against the bottom row", () => {
    assert.strictEqual(
      guardOfSoleButtonCalling(source, "positionDown"),
      guardOfDownButton,
    );
  });
});

// 上の2つは「そうなっている」ことしか言わない。取り出す側が壊れると、何も見ていないのに
// 緑のままになる。だから通ってはいけない形でちゃんと落ちることを、ここで両方向に留める。
const sfc = (template: string) => `<template>${template}</template>\n`;

describe("この検査自体が空振りしないこと", () => {
  const upButton = (attributes: string) =>
    sfc(`<button ${attributes} @click="positionUp(key)">up</button>`);

  it("rejects the shape this fix replaced, with the guard on the inner div", () => {
    const page = sfc(
      `<button @click="positionUp(key)"><div v-if="key !== 0">up</div></button>`,
    );
    assert.notStrictEqual(
      guardOfSoleButtonCalling(page, "positionUp"),
      guardOfUpButton,
    );
  });

  it("rejects a button with no guard anywhere", () => {
    assert.strictEqual(
      guardOfSoleButtonCalling(upButton(""), "positionUp"),
      undefined,
    );
  });

  // 字面だけ見ていると通ってしまう形。どちらも端の行でボタンが出る。
  it("rejects a guard that is inverted or widened to always render", () => {
    assert.notStrictEqual(
      guardOfSoleButtonCalling(
        upButton(`v-if="key !== 0 || key === 0"`),
        "positionUp",
      ),
      guardOfUpButton,
    );
    assert.notStrictEqual(
      guardOfSoleButtonCalling(upButton(`v-if="key === 0"`), "positionUp"),
      guardOfUpButton,
    );
    const invertedDown = sfc(
      `<button v-if="key === menuInfo.itemOptionCheckbox.length - 1" @click="positionDown(key)">down</button>`,
    );
    assert.notStrictEqual(
      guardOfSoleButtonCalling(invertedDown, "positionDown"),
      guardOfDownButton,
    );
  });

  it("rejects a guard that looks at something other than the row's position", () => {
    assert.notStrictEqual(
      guardOfSoleButtonCalling(upButton(`v-if="isEditing"`), "positionUp"),
      guardOfUpButton,
    );
  });

  // 2つ目のボタンを守り無しで足されても、1つ目が正しければ気づけない、を防ぐ。
  it("rejects a second unguarded button calling the same handler", () => {
    const page = sfc(
      `<button v-if="key !== 0" @click="positionUp(key)">up</button>` +
        `<button @click="positionUp(key)">up again</button>`,
    );
    assert.strictEqual(guardOfSoleButtonCalling(page, "positionUp"), undefined);
  });

  it("rejects a renamed or removed handler rather than passing vacuously", () => {
    const renamed = sfc(
      `<button v-if="key !== 0" @click="moveUp(key)">up</button>`,
    );
    assert.strictEqual(
      guardOfSoleButtonCalling(renamed, "positionUp"),
      undefined,
    );
    assert.strictEqual(
      guardOfSoleButtonCalling(sfc(`<div />`), "positionUp"),
      undefined,
    );
  });

  it("accepts the shape the page actually uses, however it is wrapped", () => {
    assert.strictEqual(
      guardOfSoleButtonCalling(upButton(`v-if="key !== 0"`), "positionUp"),
      guardOfUpButton,
    );
    const wrapped = sfc(
      `<div><span><button\n  v-if="key !== 0"\n  @click="positionUp(key)"\n>up</button></span></div>`,
    );
    assert.strictEqual(
      guardOfSoleButtonCalling(wrapped, "positionUp"),
      guardOfUpButton,
    );
  });
});
