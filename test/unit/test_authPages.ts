import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "vue/compiler-sfc";

const root = fileURLToPath(new URL("../../", import.meta.url));

type RootNode = NonNullable<
  NonNullable<ReturnType<typeof parse>["descriptor"]["template"]>["ast"]
>;
type TemplateChild = RootNode["children"][number];
type ElementNode = Extract<TemplateChild, { tag: string; props: unknown[] }>;

const isElement = (node: TemplateChild): node is ElementNode =>
  "tag" in node && "props" in node;

const formsIn = (node: TemplateChild): ElementNode[] => {
  if (!isElement(node)) {
    return [];
  }
  const own = node.tag === "form" ? [node] : [];
  return [...own, ...node.children.flatMap(formsIn)];
};

// サインインの form に novalidate が要る。無いと type="email" のブラウザ検証が送信の唯一の
// 入口になり、その文法に合わないアドレスで登録された既存のアカウントが締め出される。
describe("サインインの form", () => {
  it("carries novalidate, so the browser's email grammar cannot lock anyone out", () => {
    const source = readFileSync(join(root, "src/app/auth/SignInPage.vue"), "utf-8");
    const ast = parse(source).descriptor.template?.ast;
    const forms = ast ? ast.children.flatMap(formsIn) : [];
    assert.strictEqual(forms.length, 1, "サインインの form がちょうど1つでない");
    assert.ok(
      forms[0].props.some((p) => p.name === "novalidate"),
      "novalidate が無い",
    );
  });
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pick = (value: unknown, key: string): unknown =>
  isRecord(value) ? value[key] : undefined;

const errorCodesOf = (data: unknown): Record<string, unknown> | undefined => {
  const codes = pick(pick(pick(data, "admin"), "error"), "code");
  return isRecord(codes) ? codes : undefined;
};

// エラーのキーは "admin.error.code." + error.code と組み立てるので、i18n の lint は
// どのキーが使われるかを知らない。訳が1言語でも抜けると、その言語だけ生のキーが出る。
describe("サインインのエラーの訳", () => {
  const langDir = join(root, "src/lang");
  const locales = readdirSync(langDir).filter((name) => name.endsWith(".ts"));

  it("exists for auth/missing-password in every locale that translates error codes", async () => {
    const results = await Promise.all(
      locales.map(async (name) => {
        const data: unknown = (await import(join(langDir, name))).default;
        return { name, codes: errorCodesOf(data) };
      }),
    );
    // 訳の表を持たない言語（未完成の雛形）は対象外。固定の一覧にしないのは、言語が増減するため。
    const translating = results.filter((r) => r.codes !== undefined);
    assert.ok(translating.length > 0, "訳の表を持つ言語が1つも無い（検査の前提が崩れている）");
    const missing = translating
      .filter((r) => {
        const text = r.codes?.["auth/missing-password"];
        return typeof text !== "string" || text === "";
      })
      .map((r) => r.name);
    assert.deepStrictEqual(missing, []);
  });
});
