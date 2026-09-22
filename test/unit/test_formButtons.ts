import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "vue/compiler-sfc";

// form の中で許す形だけを通し、他は報告する（安全な書き方でも、明示していなければ弾く）:
//   - 送信するもの（t-submit / type="submit" / input の submit・image）はリスナを持たない
//   - 送信しないボタンは type="button" か "reset"。type の値は HTML の3値だけ（大文字小文字は問わない）
//   - 束縛の対象が読めない v-bind / v-on、束縛された type、<component> は報告する
//   - 入力欄は Enter のキーリスナを持たない。form の submit と二重に走る
// 見えないもの（テンプレートを1つずつ読む限り追えない。いまの src には無い）:
//   自作部品が内部で <button> を描画する / 自作部品が <form> を描画しボタンが slot にある /
//   form の外のボタンが form="id" で紐づく / ハンドラの中で Enter を判定している

// AST の型は parse の戻り値から取る。手で書くと、コンパイラの形が変わっても気づけない。
type RootNode = NonNullable<
  NonNullable<ReturnType<typeof parse>["descriptor"]["template"]>["ast"]
>;
type TemplateChild = RootNode["children"][number];
type ElementNode = Extract<TemplateChild, { tag: string; props: unknown[] }>;
type Prop = ElementNode["props"][number];
type Directive = Extract<Prop, { modifiers: unknown }>;
type Violation = { line: number; tag: string; reason: string };

const buttonTags = new Set(["button", "t-button", "t-submit"]);
const buttonTypes = new Set(["button", "reset", "submit"]);
const submitInputTypes = new Set(["submit", "image"]);
const keyEvents = new Set(["keydown", "keyup", "keypress"]);

const isElement = (node: TemplateChild): node is ElementNode =>
  "tag" in node && "props" in node;

const isDirective = (prop: Prop): prop is Directive => "modifiers" in prop;

// 引数が静的なら名前、無い・動的なら null。
const staticArg = (directive: Directive): string | null => {
  const arg = directive.arg;
  return arg && "isStatic" in arg && arg.isStatic ? arg.content : null;
};

const isOpaque = (prop: Prop) =>
  isDirective(prop) &&
  (prop.name === "bind" || prop.name === "on") &&
  staticArg(prop) === null;

// click に限らず、リスナになりうるものすべて。:onClick も @Click も onclick="" もリスナ。
const isListener = (prop: Prop) =>
  isDirective(prop)
    ? prop.name === "on" || /^on/i.test(staticArg(prop) ?? "")
    : /^on/i.test(prop.name);

const staticType = (props: Prop[]) => {
  const attr = props.find((p) => !isDirective(p) && p.name === "type");
  return attr && !isDirective(attr)
    ? attr.value?.content.toLowerCase()
    : undefined;
};

const boundType = (props: Prop[]) =>
  props.some(
    (p) => isDirective(p) && p.name === "bind" && staticArg(p) === "type",
  );

const hasEnterKeyListener = (props: Prop[]) =>
  props.some(
    (p) =>
      isDirective(p) &&
      p.name === "on" &&
      keyEvents.has((staticArg(p) ?? "").toLowerCase()) &&
      p.modifiers.some((m) => m.content.toLowerCase() === "enter"),
  );

const violation = (node: ElementNode, reason: string): Violation => ({
  line: node.loc.start.line,
  tag: node.tag,
  reason,
});

const checkButton = (node: ElementNode): Violation | null => {
  const props = node.props;
  if (props.some(isOpaque) || boundType(props)) {
    return violation(node, "束縛の対象が読めない（type やリスナを実行時に差し込める）");
  }
  const type = node.tag === "t-submit" ? "submit" : staticType(props);
  if (type === undefined) {
    return violation(node, "type が無い（form の中では submit として振る舞う）");
  }
  if (!buttonTypes.has(type)) {
    return violation(node, "type の値が不正（ブラウザは submit として扱う）");
  }
  if (type === "submit" && props.some(isListener)) {
    return violation(node, "送信するボタンにリスナがある（form の submit と二重に走る）");
  }
  return null;
};

const checkInput = (node: ElementNode): Violation | null => {
  const props = node.props;
  if (props.some(isOpaque) || boundType(props)) {
    return violation(node, "type が読めない（submit になりうる）");
  }
  const type = staticType(props) ?? "";
  if (submitInputTypes.has(type) && props.some(isListener)) {
    return violation(node, "送信する input にリスナがある（form の submit と二重に走る）");
  }
  if (hasEnterKeyListener(props)) {
    return violation(node, "Enter のキーリスナがある（form の submit と二重に走る）");
  }
  return null;
};

const checkControl = (node: ElementNode): Violation | null => {
  if (node.tag === "component") {
    return violation(node, "描画される要素が読めない（:is で button になりうる）");
  }
  if (node.tag === "input") {
    return checkInput(node);
  }
  return buttonTags.has(node.tag) ? checkButton(node) : null;
};

const collect = (node: TemplateChild, insideForm: boolean): Violation[] => {
  if (!isElement(node)) {
    return [];
  }
  const inForm = insideForm || node.tag === "form";
  const own = insideForm ? [checkControl(node)] : [];
  const children = node.children.flatMap((child) => collect(child, inForm));
  return [...own.filter((v): v is Violation => v !== null), ...children];
};

export const formButtonViolations = (vueSource: string): Violation[] => {
  const ast = parse(vueSource).descriptor.template?.ast;
  return ast ? ast.children.flatMap((child) => collect(child, false)) : [];
};

const wrap = (inner: string) => `<template>${inner}</template>`;
const reports = (inner: string) => formButtonViolations(wrap(inner)).length;

describe("formButtonViolations — 捕まえるべき形", () => {
  // ここが赤くならないと、下の全体走査は何も守っていない。
  it("reports a button without a type inside a form", () => {
    [
      `<form @submit.prevent="go"><button @click="cancel">x</button></form>`,
      `<form @submit.prevent="go"><t-button @click="cancel">x</t-button></form>`,
    ].forEach((source) => assert.strictEqual(reports(source), 1, source));
  });

  // 実際にあった二重送信の形。Vue にはリスナの書き方が多いので、どれでも同じに扱う。
  it("reports a submitter carrying a listener, however it is spelled", () => {
    [
      `<form @submit.prevent="go"><t-submit @click="go">x</t-submit></form>`,
      `<form @submit.prevent="go"><button type="submit" v-on:click="go">x</button></form>`,
      `<form @submit.prevent="go"><t-submit @click.prevent="go">x</t-submit></form>`,
      `<form @submit.prevent="go"><t-submit @Click="go">x</t-submit></form>`,
      `<form @submit.prevent="go"><t-submit :onClick="go">x</t-submit></form>`,
      `<form @submit.prevent="go"><button type="submit" onclick="go()">x</button></form>`,
      `<form @submit.prevent="go"><t-submit @mousedown="go">x</t-submit></form>`,
    ].forEach((source) => assert.strictEqual(reports(source), 1, source));
  });

  it("reports a binding whose target cannot be read from the template", () => {
    [
      `<form @submit.prevent="go"><button :type="kind">x</button></form>`,
      `<form @submit.prevent="go"><t-button v-bind:type="kind">x</t-button></form>`,
      `<form @submit.prevent="go"><button type="button" v-bind="attrs">x</button></form>`,
      `<form @submit.prevent="go"><t-submit v-on="listeners">x</t-submit></form>`,
      `<form @submit.prevent="go"><button type="button" :[name]="value">x</button></form>`,
      `<form @submit.prevent="go"><t-submit @[event]="handler">x</t-submit></form>`,
    ].forEach((source) => assert.strictEqual(reports(source), 1, source));
  });

  // 安全な使い方でも弾く。書き方ごとに安全かを判定すると、判定できない書き方が必ず残る。
  it("rejects an opaque binding even where it would be harmless", () => {
    const source = `<form @submit.prevent="go"><button type="button" v-on="listeners">x</button></form>`;
    assert.strictEqual(reports(source), 1);
  });

  // HTML の type は大文字小文字を区別しない。不正な値や空はブラウザが submit として扱う。
  it("treats a type the way the browser does", () => {
    [
      `<form @submit.prevent="go"><button type="Submit" @click="go">x</button></form>`,
      `<form @submit.prevent="go"><input type="IMAGE" @click="go" /></form>`,
      `<form @submit.prevent="go"><button type="foo" @click="cancel">x</button></form>`,
      `<form @submit.prevent="go"><button type="" @click="cancel">x</button></form>`,
      `<form @submit.prevent="go"><t-button type="sumbit">x</t-button></form>`,
    ].forEach((source) => assert.strictEqual(reports(source), 1, source));
  });

  it("reports other things that submit a form, or submit it twice", () => {
    [
      `<form @submit.prevent="go"><input type="submit" @click="go" /></form>`,
      `<form @submit.prevent="go"><input :type="kind" /></form>`,
      `<form @submit.prevent="go"><input type="text" v-bind="attrs" /></form>`,
      `<form @submit.prevent="go"><input type="text" @keyup.enter="go" /></form>`,
      `<form @submit.prevent="go"><input type="text" @keydown.Enter="go" /></form>`,
      `<form @submit.prevent="go"><component :is="'button'" @click="go">x</component></form>`,
    ].forEach((source) => assert.strictEqual(reports(source), 1, source));
  });

  // 正規表現では読み違えやすい形。属性が複数行にまたがる、入れ子の中にある。
  it("reads elements the way Vue does, across lines and inside nested markup", () => {
    const source = `<form @submit.prevent="go">
      <div><template v-if="ok"><span>
        <button
          class="x"
          @click="cancel"
        >x</button>
      </span></template></div>
    </form>`;
    assert.strictEqual(reports(source), 1);
  });
});

describe("formButtonViolations — 通すべき形", () => {
  // ここが赤いと、正しい書き方まで弾いてしまう。
  it("accepts an explicit submitter and explicit non-submitting buttons", () => {
    const source = `<form @submit.prevent="go">
      <button type="button" @click="cancel">x</button>
      <t-button type="button" v-on:click="cancel">x</t-button>
      <button type="reset">clear</button>
      <t-submit :isDisabled="busy" :class="c">ok</t-submit>
      <button type="submit">ok</button>
    </form>`;
    assert.strictEqual(reports(source), 0);
  });

  it("accepts the valid types in any case", () => {
    const source = `<form @submit.prevent="go">
      <button type="BUTTON" @click="cancel">x</button>
      <t-button type="Button" @click="cancel">x</t-button>
      <button type="Submit">ok</button>
    </form>`;
    assert.strictEqual(reports(source), 0);
  });

  // 引数が静的でリスナでない束縛は、type もリスナも持ち込めないので通す。
  it("accepts ordinary inputs and harmless static bindings", () => {
    const source = `<form @submit.prevent="go">
      <input type="email" v-model="email" :class="c" />
      <input type="password" v-model="password" @keyup="check" @blur="touch" />
      <input type="tel" v-model="tel" />
      <input type="submit" value="ok" />
      <button type="button" :class="c" :disabled="d" @mouseover="hover">x</button>
    </form>`;
    assert.strictEqual(reports(source), 0);
  });

  it("ignores buttons outside any form", () => {
    const source = `<div><button @click="x">x</button><t-button @click="y">y</t-button></div>`;
    assert.strictEqual(reports(source), 0);
  });

  it("stops looking once the form is closed", () => {
    const source = `<form @submit.prevent="go"><t-submit>ok</t-submit></form><button @click="x">x</button>`;
    assert.strictEqual(reports(source), 0);
  });

  it("returns nothing for a component without a template", () => {
    assert.deepStrictEqual(
      formButtonViolations(`<script>export default {}</script>`),
      [],
    );
  });
});

const vueFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return vueFiles(path);
    }
    return path.endsWith(".vue") ? [path] : [];
  });

describe("form の中のボタン — アプリ全体", () => {
  // URL の pathname は %20 のような符号化を残すので、空白を含むパスで読めなくなる。
  const root = fileURLToPath(new URL("../../", import.meta.url));

  it("has no control that silently submits or submits twice", () => {
    const found = vueFiles(join(root, "src")).flatMap((path) =>
      formButtonViolations(readFileSync(path, "utf-8")).map(
        (v) => `${relative(root, path)}:${v.line} <${v.tag}> ${v.reason}`,
      ),
    );
    assert.deepStrictEqual(found, []);
  });
});
