// 読み込み直した直後にまた失敗したら、分割ファイルが本当に無い。読み込み直しを繰り返さない。
export const STALE_CHUNK_RELOAD_COOLDOWN_MS = 10 * 1000;

export const parseReloadedAt = (raw: string | null): number | null => {
  if (raw === null || raw.trim() === "") {
    return null;
  }
  const reloadedAt_ms = Number(raw);
  return Number.isFinite(reloadedAt_ms) ? reloadedAt_ms : null;
};

export const shouldReloadForStaleChunk = (
  reloadedAt_ms: number | null,
  now_ms: number,
): boolean => {
  if (reloadedAt_ms === null) {
    return true;
  }
  const elapsed_ms = now_ms - reloadedAt_ms;
  // 時計が戻ったときは、前回の記録を当てにしない。
  return elapsed_ms < 0 || elapsed_ms >= STALE_CHUNK_RELOAD_COOLDOWN_MS;
};

// "//host" や "/\host" は、ルーターは通してもブラウザは別オリジンとして開く。
// 同じオリジンに解決できるものだけを返す。
export const sameOriginReloadUrl = (
  fullPath: string,
  origin: string,
): string | null => {
  try {
    const reloadUrl = new URL(fullPath, origin);
    return reloadUrl.origin === origin ? reloadUrl.href : null;
  } catch {
    return null;
  }
};

export const STALE_CHUNK_RELOADED_AT_KEY = "staleChunkReloadedAt";

export type ReloadRecordStorage = Pick<Storage, "getItem" | "setItem">;

// 記録を読めない・書けないときは開き直さない。分割ファイルが本当に無いと、読み込み直しが止まらなくなる。
export const claimStaleChunkReload = (
  storage: ReloadRecordStorage,
  now_ms: number,
): boolean => {
  try {
    const reloadedAt_ms = parseReloadedAt(
      storage.getItem(STALE_CHUNK_RELOADED_AT_KEY),
    );
    if (!shouldReloadForStaleChunk(reloadedAt_ms, now_ms)) {
      return false;
    }
    storage.setItem(STALE_CHUNK_RELOADED_AT_KEY, String(now_ms));
    return true;
  } catch {
    return false;
  }
};
