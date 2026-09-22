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
  arg?: { content: string };
};

const elementType = 1;
const attributeType = 6;
const buttonTags = new Set(["button", "t-button", "t-submit"]);

const isTemplateNode = (value: unknown): value is TemplateNode =>
  typeof value === "object" && value !== null && "type" in value && "loc" in value;

const isDirective = (prop: TemplateProp, name: string, arg: string) =>
  prop.type !== attributeType && prop.name === name && prop.arg?.content === arg;

// 静的な type="…" の値。:type のように束縛されていれば、実行時の値は分からない。
const staticType = (props: TemplateProp[]) =>
  props.find((p) => p.type === attributeType && p.name === "type")?.value?.content;

const checkButton = (node: TemplateNode): Violation | null => {
  const props = node.props ?? [];
  const tag = node.tag ?? "";
  const line = node.loc.start.line;
  if (props.some((p) => isDirective(p, "bind", "type"))) {
    return { line, tag, reason: "type が束縛されている（実行時の値を検査できない）" };
  }
  const type = staticType(props);
  if (!type && tag !== "t-submit") {
    return { line, tag, reason: "type が無い（form の中では submit として振る舞う）" };
  }
  const submits = tag === "t-submit" || type === "submit";
  if (submits && props.some((p) => isDirective(p, "on", "click"))) {
    return { line, tag, reason: "送信するボタンに click がある（form の submit と二重に走る）" };
  }
  return null;
};

const collect = (node: TemplateNode, insideForm: boolean): Violation[] => {
  const isElement = node.type === elementType;
  const inForm = insideForm || (isElement && node.tag === "form");
  const own =
    isElement && insideForm && buttonTags.has(node.tag ?? "")
      ? [checkButton(node)].filter((v): v is Violation => v !== null)
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
