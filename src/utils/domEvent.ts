// 入力欄の値を取り出す。`Event.target` は型の上では null になりうるが、入力欄に
// 結び付けた handler には必ず入っている。入っていなければ空欄として扱う。
//
// 受け取るのは `target` だけ。`Event` 全体を要求すると、試験から呼ぶのに偽装が要る。
export const inputValueOf = (event: { target: unknown }): string => {
  const target = event.target;
  if (typeof target !== "object" || target === null || !("value" in target)) {
    return "";
  }
  try {
    // getter のこともあるので一度だけ読む。二度読むと、守りで検めた値と
    // 返す値が食い違いうる。
    const value = target.value;
    return typeof value === "string" || typeof value === "number"
      ? String(value)
      : "";
  } catch {
    // 読めない欄は空欄と同じ扱いにする。ここで投げると、すべての入力欄の
    // handler がその例外を上げることになる。
    return "";
  }
};
