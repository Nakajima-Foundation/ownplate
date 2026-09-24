import type { Router } from "vue-router";
import {
  parseReloadedAt,
  sameOriginReloadUrl,
  shouldReloadForStaleChunk,
} from "../utils/staleChunkReload";

const RELOADED_AT_KEY = "staleChunkReloadedAt";

// 記録を読めない・書けないときは開き直さない。分割ファイルが本当に無いと、読み込み直しが止まらなくなる。
const claimReload = (now_ms: number): boolean => {
  try {
    const reloadedAt_ms = parseReloadedAt(
      window.sessionStorage.getItem(RELOADED_AT_KEY),
    );
    if (!shouldReloadForStaleChunk(reloadedAt_ms, now_ms)) {
      return false;
    }
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
    const reloadUrl = sameOriginReloadUrl(to.fullPath, window.location.origin);
    if (reloadUrl === null || !claimReload(Date.now())) {
      return;
    }
    window.location.assign(reloadUrl);
  });
};
