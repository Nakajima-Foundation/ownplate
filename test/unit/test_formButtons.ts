import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// form の中のボタンは、type を書かないと submit として振る舞う。t-button も素の button も
// type を持たないので、form に置くとクリックで form が送信される。これで
//   - 送信ボタンに @click も付けていると、1回のクリックで送信処理が2回走る
//   - キャンセルを押すと form が送信される（サインイン・アカウント作成・再設定メール）
//   - Enter を押すと「最初の submit ボタン」＝キャンセルが押されたことになり、画面を離れる
// が実際に起きていた。
//
// 許すのは次の形だけで、それ以外は報告する（安全な書き方でも、明示していなければ弾く）:
//   - 送信するもの（<t-submit> / type="submit"）は @click を持たない。入口は form の @submit だけ
//   - 送信しないボタンは type="button" を明示する

type Violation = { line: number; tag: string; reason: string };

export const formButtonViolations = (vueSource: string): Violation[] => {
  const violations: Violation[] = [];
  const tagPattern = /<(\/?)(form|t-button|t-submit|button)\b([^>]*)>/g;
  const lineOf = (index: number) =>
    vueSource.slice(0, index).split("\n").length;

  const walk = (depth: number, match: RegExpExecArray | null): void => {
    if (!match) {
      return;
    }
    const [, closing, tag, attrs] = match;
    const nextDepth =
      tag === "form" ? depth + (closing ? -1 : 1) : depth;
    if (tag !== "form" && !closing && depth > 0) {
      const type = attrs.match(/\btype\s*=\s*"([^"]*)"/)?.[1];
      const hasClick = /@click\b/.test(attrs);
      const submits = tag === "t-submit" || type === "submit" || !type;
      if (!type && tag !== "t-submit") {
        violations.push({
          line: lineOf(match.index),
          tag,
          reason: "type が無い（form の中では submit として振る舞う）",
        });
      } else if (submits && hasClick) {
        violations.push({
          line: lineOf(match.index),
          tag,
          reason: "送信するボタンに @click がある（form の @submit と二重に走る）",
        });
      }
    }
    walk(nextDepth, tagPattern.exec(vueSource));
  };

  walk(0, tagPattern.exec(vueSource));
  return violations;
};

describe("formButtonViolations — 判定そのもの", () => {
  // 捕まえるべき形。ここが赤くならないと、下の全体走査は何も守っていない。
  it("reports a button without a type inside a form", () => {
    const source = `<form @submit.prevent="go"><button @click="cancel">x</button></form>`;
    assert.strictEqual(formButtonViolations(source).length, 1);
  });

  it("reports a t-button without a type inside a form", () => {
    const source = `<form @submit.prevent="go"><t-button @click="cancel">x</t-button></form>`;
    assert.strictEqual(formButtonViolations(source).length, 1);
  });

  // 実際にあった二重送信の形。
  it("reports a submitter that also has @click", () => {
    [
      `<form @submit.prevent="go"><t-submit @click="go">x</t-submit></form>`,
      `<form @submit.prevent="go"><button type="submit" @click="go">x</button></form>`,
    ].forEach((source) => {
      assert.strictEqual(formButtonViolations(source).length, 1);
    });
  });

  // 通すべき形。ここが赤いと、正しい書き方まで弾いてしまう。
  it("accepts an explicit submitter and an explicit non-submitting button", () => {
    const source = `<form @submit.prevent="go">
      <button type="button" @click="cancel">x</button>
      <t-button type="button" @click="cancel">x</t-button>
      <t-submit>ok</t-submit>
      <button type="submit">ok</button>
    </form>`;
    assert.deepStrictEqual(formButtonViolations(source), []);
  });

  // form の外のボタンは送信しないので、type が無くても問題ない。
  it("ignores buttons outside any form", () => {
    const source = `<div><button @click="x">x</button><t-button @click="y">y</t-button></div>`;
    assert.deepStrictEqual(formButtonViolations(source), []);
  });

  it("stops looking once the form is closed", () => {
    const source = `<form @submit.prevent="go"><t-submit>ok</t-submit></form><button @click="x">x</button>`;
    assert.deepStrictEqual(formButtonViolations(source), []);
  });
});

// PhoneLogin は対象外。invisible reCAPTCHA が id="signInButton"（キャンセルボタン）に
// 紐づいていて、ボタンの type を変えると SMS 認証の挙動が変わりうる。reCAPTCHA 付きの
// 電話認証は手元で再現できないので、実機で確かめてから別に直す。
const excluded = new Set(["src/app/auth/PhoneLogin.vue"]);

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
    const found = vueFiles(join(root, "src"))
      .map((path) => relative(root, path))
      .filter((path) => !excluded.has(path))
      .flatMap((path) =>
        formButtonViolations(readFileSync(join(root, path), "utf-8")).map(
          (v) => `${path}:${v.line} <${v.tag}> ${v.reason}`,
        ),
      );
    assert.deepStrictEqual(found, []);
  });

  // 対象外の一覧が実在するファイルを指していること。消えたファイルを除外し続けると、
  // その名前で新しく作られたページが黙って検査から外れる。
  it("excludes only files that exist", () => {
    excluded.forEach((path) => {
      assert.ok(statSync(join(root, path)).isFile(), `${path} が無い`);
    });
  });
});
