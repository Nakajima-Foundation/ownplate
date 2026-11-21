// 戻りの URL に state が無く Cookie も切れていると、両方 undefined で一致してしまう。
// 一致とみなすのは、送り出したときの値が残っていて、それと同じ文字列が返ってきたときだけ。
export const isReturnedOAuthState = (
  returnedState: unknown,
  savedState: unknown,
): boolean =>
  typeof returnedState === "string" &&
  typeof savedState === "string" &&
  savedState.length > 0 &&
  returnedState === savedState;
