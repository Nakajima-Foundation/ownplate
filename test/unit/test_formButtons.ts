import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "@vue/compiler-sfc";

// form の中のボタンは、type を書かないと submit として振る舞う。t-button も素の button も
// type を持たないので、form に置くとクリックで form が送信される。これで
//   - 送信ボタンに click も付けていると、1回のクリックで送信処理が2回走る
//   - キャンセルを押すと form が送信される（サインイン・アカウント作成・再設定メール・SMS 送信）
//   - Enter を押すと「最初の submit ボタン」＝キャンセルが押されたことになり、画面を離れる
// が実際に起きていた。
//
// 許すのは次の形だけで、それ以外は報告する（安全な書き方でも、明示していなければ弾く）:
//   - 送信するもの（<t-submit> / type="submit"）は click を持たない。入口は form の submit だけ
//   - 送信しないボタンは type="button" を明示する
//   - 束縛の対象がテンプレートから読めること。v-bind="attrs" のようなまとめ渡しや
//     :[name] のような動的な引数は、実行時に type や click を差し込めるので報告する。
//     安全に使っている場合も弾く。書き方を列挙して塞ぐと、次の書き方が必ず漏れるため
//   - <input type="submit"> / <input type="image"> も送信するので、同じく click を持たない
//   - <component :is> は何が描画されるか読めないので報告する
//
// 見えないもの: t-button / t-submit 以外の自作部品が内部で <button> を描画している場合。
// テンプレートだけでは部品の中身まで追えない。form の中で使う部品を増やしたら、この検査が
// その部品を知らないことに注意する。
//
// テンプレートは正規表現でなく Vue のコンパイラで読む。@click と v-on:click、複数行の要素、
// 修飾子付きの @click.prevent、:type のような束縛を、Vue と同じように区別するため。

type Violation = { line: number; tag: string; reason: string };

type TemplateNode = {
  type: number;
  tag?: string;
  props?: TemplateProp[];
  children?: TemplateNode[];
  loc: { start: { line: number } };
};

type TemplateProp = {
  type: number;
  name: string;
  value?: { content: string };
  arg?: { content: string; isStatic: boolean };
};

const elementType = 1;
const attributeType = 6;
const buttonTags = new Set(["button", "t-button", "t-submit"]);
const submitInputTypes = new Set(["submit", "image"]);

const isTemplateNode = (value: unknown): value is TemplateNode =>
  typeof value === "object" && value !== null && "type" in value && "loc" in value;

const isDirective = (prop: TemplateProp, name: string, arg: string) =>
  prop.type !== attributeType && prop.name === name && prop.arg?.content === arg;

// 何を束縛するかがテンプレートから読めない v-bind / v-on。引数無し（まとめ渡し）か、
// 引数が式（:[name]）のもの。
const isOpaqueBinding = (prop: TemplateProp) =>
  prop.type !== attributeType &&
  (prop.name === "bind" || prop.name === "on") &&
  (!prop.arg || !prop.arg.isStatic);

// 静的な type="…" の値。:type のように束縛されていれば、実行時の値は分からない。
const staticType = (props: TemplateProp[]) =>
  props.find((p) => p.type === attributeType && p.name === "type")?.value?.content;

const hasClick = (props: TemplateProp[]) =>
  props.some((p) => isDirective(p, "on", "click"));

const checkButton = (node: TemplateNode): Violation | null => {
  const props = node.props ?? [];
  const tag = node.tag ?? "";
  const line = node.loc.start.line;
  if (props.some(isOpaqueBinding)) {
    return { line, tag, reason: "束縛の対象が読めない（type や click を実行時に差し込める）" };
  }
  if (props.some((p) => isDirective(p, "bind", "type"))) {
    return { line, tag, reason: "type が束縛されている（実行時の値を検査できない）" };
  }
  const type = staticType(props);
  if (!type && tag !== "t-submit") {
    return { line, tag, reason: "type が無い（form の中では submit として振る舞う）" };
  }
  const submits = tag === "t-submit" || type === "submit";
  if (submits && hasClick(props)) {
    return { line, tag, reason: "送信するボタンに click がある（form の submit と二重に走る）" };
  }
  return null;
};

// type が submit になりうる input。束縛されていれば実行時に submit になりうる。
const checkInput = (node: TemplateNode): Violation | null => {
  const props = node.props ?? [];
  const line = node.loc.start.line;
  const bound =
    props.some(isOpaqueBinding) || props.some((p) => isDirective(p, "bind", "type"));
  if (bound) {
    return { line, tag: "input", reason: "type が読めない（submit になりうる）" };
  }
  const type = staticType(props);
  if (type && submitInputTypes.has(type) && hasClick(props)) {
    return { line, tag: "input", reason: "送信する input に click がある（form の submit と二重に走る）" };
  }
  return null;
};

const checkControl = (node: TemplateNode): Violation | null => {
  const tag = node.tag ?? "";
  if (tag === "component") {
    const reason = "描画される要素が読めない（:is で button になりうる）";
    return { line: node.loc.start.line, tag, reason };
  }
  if (tag === "input") {
    return checkInput(node);
  }
  return buttonTags.has(tag) ? checkButton(node) : null;
};

const collect = (node: TemplateNode, insideForm: boolean): Violation[] => {
  const isElement = node.type === elementType;
  const inForm = insideForm || (isElement && node.tag === "form");
  const own =
    isElement && insideForm
      ? [checkControl(node)].filter((v): v is Violation => v !== null)
      : [];
  const children = (node.children ?? []).flatMap((child) =>
    collect(child, inForm),
  );
  return [...own, ...children];
};

export const formButtonViolations = (vueSource: string): Violation[] => {
  const ast: unknown = parse(vueSource).descriptor.template?.ast;
  return isTemplateNode(ast) ? collect(ast, false) : [];
};

const wrap = (inner: string) => `<template>${inner}</template>`;

describe("formButtonViolations — 捕まえるべき形", () => {
  // ここが赤くならないと、下の全体走査は何も守っていない。
  it("reports a button without a type inside a form", () => {
    [
      `<form @submit.prevent="go"><button @click="cancel">x</button></form>`,
      `<form @submit.prevent="go"><t-button @click="cancel">x</t-button></form>`,
    ].forEach((source) => {
      assert.strictEqual(formButtonViolations(wrap(source)).length, 1, source);
    });
  });

  // 実際にあった二重送信の形。Vue には click の書き方が複数ある。
  it("reports a submitter with a click handler, however it is spelled", () => {
    [
      `<form @submit.prevent="go"><t-submit @click="go">x</t-submit></form>`,
      `<form @submit.prevent="go"><button type="submit" @click="go">x</button></form>`,
      `<form @submit.prevent="go"><button type="submit" v-on:click="go">x</button></form>`,
      `<form @submit.prevent="go"><t-submit @click.prevent="go">x</t-submit></form>`,
    ].forEach((source) => {
      assert.strictEqual(formButtonViolations(wrap(source)).length, 1, source);
    });
  });

  // 束縛された type は実行時に何になるか分からない。明示されていないのと同じ扱い。
  it("reports a bound type, which cannot be checked", () => {
    [
      `<form @submit.prevent="go"><button :type="kind">x</button></form>`,
      `<form @submit.prevent="go"><t-button v-bind:type="kind">x</t-button></form>`,
    ].forEach((source) => {
      assert.strictEqual(formButtonViolations(wrap(source)).length, 1, source);
    });
  });

  // まとめ渡しと動的な引数。どちらも実行時に type や click を差し込める。
  it("reports a binding whose target cannot be read from the template", () => {
    [
      `<form @submit.prevent="go"><button type="button" v-bind="attrs">x</button></form>`,
      `<form @submit.prevent="go"><t-submit v-on="listeners">x</t-submit></form>`,
      `<form @submit.prevent="go"><button type="button" :[name]="value">x</button></form>`,
      `<form @submit.prevent="go"><t-submit @[event]="handler">x</t-submit></form>`,
    ].forEach((source) => {
      assert.strictEqual(formButtonViolations(wrap(source)).length, 1, source);
    });
  });

  // 安全な使い方でも弾く。type="button" に v-on のまとめ渡しを付けても送信はしないが、
  // 書き方ごとに安全かを判定し始めると、判定できない書き方が必ず残る。
  it("rejects an opaque binding even where it would be harmless", () => {
    const source = wrap(
      `<form @submit.prevent="go"><button type="button" v-on="listeners">x</button></form>`,
    );
    assert.strictEqual(formButtonViolations(source).length, 1);
  });

  // button 以外にも form を送信するものがある。
  it("reports other things that submit a form", () => {
    [
      `<form @submit.prevent="go"><input type="submit" @click="go" /></form>`,
      `<form @submit.prevent="go"><input type="image" v-on:click="go" /></form>`,
      `<form @submit.prevent="go"><input :type="kind" /></form>`,
      `<form @submit.prevent="go"><input type="text" v-bind="attrs" /></form>`,
      `<form @submit.prevent="go"><component :is="'button'" @click="go">x</component></form>`,
    ].forEach((source) => {
      assert.strictEqual(formButtonViolations(wrap(source)).length, 1, source);
    });
  });

  // 正規表現では読み違えやすい形。属性が複数行にまたがる、入れ子の中にある。
  it("reads elements the way Vue does, across lines and inside nested markup", () => {
    const source = wrap(`<form @submit.prevent="go">
      <div><template v-if="ok"><span>
        <button
          class="x"
          @click="cancel"
        >x</button>
      </span></template></div>
    </form>`);
    assert.strictEqual(formButtonViolations(source).length, 1);
  });
});

describe("formButtonViolations — 通すべき形", () => {
  // ここが赤いと、正しい書き方まで弾いてしまう。
  it("accepts an explicit submitter and an explicit non-submitting button", () => {
    const source = wrap(`<form @submit.prevent="go">
      <button type="button" @click="cancel">x</button>
      <t-button type="button" v-on:click="cancel">x</t-button>
      <t-submit>ok</t-submit>
      <button type="submit">ok</button>
    </form>`);
    assert.deepStrictEqual(formButtonViolations(source), []);
  });

  // 引数が静的な束縛は type も click も設定できないので、そのまま通す。
  it("accepts bindings whose target is static and harmless", () => {
    const source = wrap(`<form @submit.prevent="go">
      <button type="button" :class="c" :disabled="d" @mouseover="hover" @click="cancel">x</button>
      <t-submit :isDisabled="busy" :class="c">ok</t-submit>
    </form>`);
    assert.deepStrictEqual(formButtonViolations(source), []);
  });

  // 送信しない入力欄はそのまま通す。
  it("accepts ordinary inputs and a submit input without a click", () => {
    const source = wrap(`<form @submit.prevent="go">
      <input type="email" v-model="email" :class="c" />
      <input type="password" v-model="password" @keyup="check" />
      <input type="tel" v-model="tel" />
      <input type="submit" value="ok" />
    </form>`);
    assert.deepStrictEqual(formButtonViolations(source), []);
  });

  // form の外のボタンは送信しないので、type が無くても問題ない。
  it("ignores buttons outside any form", () => {
    const source = wrap(
      `<div><button @click="x">x</button><t-button @click="y">y</t-button></div>`,
    );
    assert.deepStrictEqual(formButtonViolations(source), []);
  });

  it("stops looking once the form is closed", () => {
    const source = wrap(
      `<form @submit.prevent="go"><t-submit>ok</t-submit></form><button @click="x">x</button>`,
    );
    assert.deepStrictEqual(formButtonViolations(source), []);
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
  const root = new URL("../../", import.meta.url).pathname;

  it("has no button that silently submits or submits twice", () => {
    const found = vueFiles(join(root, "src")).flatMap((path) =>
      formButtonViolations(readFileSync(path, "utf-8")).map(
        (v) => `${relative(root, path)}:${v.line} <${v.tag}> ${v.reason}`,
      ),
    );
    assert.deepStrictEqual(found, []);
  });
});
