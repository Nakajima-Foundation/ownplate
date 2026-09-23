import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { createRouter, createMemoryHistory } from "vue-router";

import i18n from "../../src/lib/vue-i18n.ts";

// useI18n と useRoute は setup の中でしか呼べない（外から呼ぶと
// "Must be called at the top of a setup function" で落ちる）。画面を組まずに setup だけを
// 走らせるため、最小の component を一度だけ server rendering して、その中で関数を呼ぶ。
//
// i18n は画面が使うものをそのまま読み込む。試験用に組み直すと、文言の差し替えや
// 通貨の設定が実物と違っていても気づけない。
const blank = { render: () => h("div") };

const routes = [
  { path: "/r/:restaurantId", component: blank },
  { path: "/liff/:liffIndexId", component: blank },
  { path: "/liff/:liffIndexId/r/:restaurantId", component: blank },
  { path: "/:pathMatch(.*)*", component: blank },
];

export const runInSetup = async <T>(
  fn: () => T,
  path: string = "/",
): Promise<T> => {
  const router = createRouter({ history: createMemoryHistory(), routes });
  await router.push(path);
  await router.isReady();

  // 配列で受ける。undefined を返す関数と「setup が走らなかった」を取り違えないため。
  const captured: T[] = [];
  const app = createSSRApp({
    setup() {
      captured.push(fn());
      return () => h("div");
    },
  });
  app.use(i18n);
  app.use(router);
  await renderToString(app);
  if (captured.length === 0) {
    throw new Error("setup が走らなかった");
  }
  return captured[0];
};

// legacy: false の i18n では locale は ref だが、型は文字列だと宣言している。
// 実体を確かめてから触る。
const isStringRef = (value: unknown): value is { value: string } =>
  typeof value === "object" && value !== null && "value" in value;

// 言語を切り替えて走らせ、必ず元に戻す。i18n は一つを使い回すので、戻し忘れると
// 後続の試験が別の言語で走る。
export const runInLocale = async <T>(
  locale: string,
  fn: () => T,
  path: string = "/",
): Promise<T> => {
  const current = i18n.global.locale;
  if (!isStringRef(current)) {
    throw new Error("locale が ref ではない");
  }
  const previous = current.value;
  current.value = locale;
  try {
    return await runInSetup(fn, path);
  } finally {
    current.value = previous;
  }
};
