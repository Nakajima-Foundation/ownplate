import type { Router } from "vue-router";
import {
  claimStaleChunkReload,
  sameOriginReloadUrl,
} from "../utils/staleChunkReload";

// sessionStorage は、無効にされた環境では読むだけで投げる。
const claimReload = (): boolean => {
  try {
    return claimStaleChunkReload(window.sessionStorage, Date.now());
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
    if (reloadUrl === null || !claimReload()) {
      return;
    }
    window.location.assign(reloadUrl);
  });
};
