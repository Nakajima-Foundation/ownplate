import type { Router } from "vue-router";
import {
  parseReloadedAt,
  shouldReloadForStaleChunk,
} from "../utils/staleChunkReload";

const RELOADED_AT_KEY = "staleChunkReloadedAt";

const readReloadedAt = (): number | null => {
  try {
    return parseReloadedAt(window.sessionStorage.getItem(RELOADED_AT_KEY));
  } catch {
    return null;
  }
};

const writeReloadedAt = (now_ms: number): boolean => {
  try {
    window.sessionStorage.setItem(RELOADED_AT_KEY, String(now_ms));
    return true;
  } catch {
    return false;
  }
};

// デプロイで消えた分割ファイルを古い画面が読みに行ったら、移動先を新しいビルドで開き直す。
// エラー文はブラウザごとに違うので、Vite が渡すエラーオブジェクトそのもので見分ける。
export const reloadOnStaleChunk = (router: Router) => {
  const staleChunkErrors = new WeakSet<object>();
  window.addEventListener("vite:preloadError", (event) => {
    if (typeof event.payload === "object" && event.payload !== null) {
      staleChunkErrors.add(event.payload);
    }
  });
  router.onError((error: unknown, to) => {
    if (typeof error !== "object" || error === null) {
      return;
    }
    if (!staleChunkErrors.has(error)) {
      return;
    }
    const now_ms = Date.now();
    if (!shouldReloadForStaleChunk(readReloadedAt(), now_ms)) {
      return;
    }
    // 記録できないと、分割ファイルが本当に無いときに読み込み直しが止まらない。
    if (!writeReloadedAt(now_ms)) {
      return;
    }
    window.location.assign(to.fullPath);
  });
};
