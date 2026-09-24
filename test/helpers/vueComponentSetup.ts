import { parse } from "@vue/compiler-sfc";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { calls, resetCalls, type FirestoreCall } from "./firestoreStub.ts";
import { runInSetup } from "./vueSetup.ts";

// 画面の `setup()` を、**描かずに**呼ぶ。
//
// 管理画面の多くは setup の冒頭で権限を見て、通らなければそこで返す。その守りが
// 効いていることは「Firestore を一度も触らない」という形でしか現れないので、
// 呼んだ回数を数えられるところまで持っていく必要がある。
//
// `.vue` は node から読めないが、これらのファイルは `<script setup>` ではなく
// `defineComponent({ setup })` なので、script ブロックを取り出せば素の module になる。
// 取り出したものの import だけを差し替えて走らせる。template には触っていない。

const HELPERS = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HELPERS, "../..");
const CACHE = resolve(ROOT, "test/.setup-cache");

const FIRESTORE_STUB = resolve(HELPERS, "firestoreStub.ts");
const MODULE_STUB = resolve(HELPERS, "moduleStubs.ts");

// 差し替えるのは「外の世界に触るもの」と「node が解決できないもの」だけ。
// それ以外は絶対パスに直すだけで、本物がそのまま走る。
const rewriteSpecifier = (spec: string, from: string): string => {
  if (spec === "firebase/firestore") {
    return FIRESTORE_STUB;
  }
  if (spec.endsWith(".vue") || spec.startsWith("@/lib/firebase/")) {
    return MODULE_STUB;
  }
  if (spec.startsWith("@/")) {
    return resolve(ROOT, "src", spec.slice(2));
  }
  if (spec.startsWith(".")) {
    return resolve(from, spec);
  }
  return spec;
};

const extractScript = (componentPath: string): string => {
  const absolute = resolve(ROOT, componentPath);
  const { descriptor } = parse(readFileSync(absolute, "utf8"));
  if (!descriptor.script) {
    throw new Error(
      `${componentPath} に <script> ブロックが無い（<script setup> はこの道具では扱えない）`,
    );
  }
  const from = dirname(absolute);
  return descriptor.script.content.replace(
    /from\s+"([^"]+)"/g,
    (_whole, spec: string) => `from "${rewriteSpecifier(spec, from)}"`,
  );
};

type SetupComponent = {
  setup?: (props: Record<string, unknown>, context: unknown) => unknown;
};

const isSetupComponent = (value: unknown): value is SetupComponent =>
  typeof value === "object" && value !== null && "setup" in value;

// setup が受け取る2つ目の引数。ここで使われるものだけを持たせる。
const setupContext = () => ({
  emit: () => {},
  attrs: {},
  slots: {},
  expose: () => {},
});

// setup が返すのは template へ渡す束縛の入れ物。中身の型は画面ごとに違うので、
// ここでは「名前つきの値の集まり」までしか言わない。読む側が確かめる。
const isBindings = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export type SetupResult = {
  bindings: Record<string, unknown>;
  calls: FirestoreCall[];
};

export const callComponentSetup = async (options: {
  /** repo の根からの `.vue` の道筋 */
  component: string;
  props: Record<string, unknown>;
  /** setup が経路を見るとき用。既定は店舗ページ */
  route?: string;
}): Promise<SetupResult> => {
  mkdirSync(CACHE, { recursive: true });
  const cached = resolve(
    CACHE,
    options.component.replace(/[/\\]/g, "__").replace(/\.vue$/, ".ts"),
  );
  writeFileSync(cached, extractScript(options.component));

  const loaded: unknown = (await import(cached)).default;
  if (!isSetupComponent(loaded) || typeof loaded.setup !== "function") {
    throw new Error(`${options.component} の既定の輸出に setup が無い`);
  }
  const setup = loaded.setup;

  resetCalls();
  const bindings: unknown = await runInSetup(
    () => setup(options.props, setupContext()),
    options.route ?? "/r/curry-shop",
  );
  // setup の中で始まった取得の then が走るのを待つ。
  await new Promise((done) => setTimeout(done, 0));

  if (!isBindings(bindings)) {
    throw new Error(`${options.component} の setup が束縛を返していない`);
  }
  return { bindings, calls: [...calls] };
};
