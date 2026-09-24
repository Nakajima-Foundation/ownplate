const hasValue = (target: unknown): target is { value: string | number } =>
  typeof target === "object" &&
  target !== null &&
  "value" in target &&
  (typeof target.value === "string" || typeof target.value === "number");

// 入力欄の値を取り出す。`Event.target` は型の上では null になりうるが、入力欄に
// 結び付けた handler には必ず入っている。入っていなければ空欄として扱う。
export const inputValueOf = (event: Event): string =>
  hasValue(event.target) ? String(event.target.value) : "";
