// 送信中なら false を返す。そうでなければ送信中にして true を返す。
// 読み込み中の覆いはマウスしか止めないので、Enter の連打はハンドラの入口で止める。
// Vue の Ref<boolean> はこの形を満たすので、画面は自分の ref をそのまま渡せる。
export const beginSubmit = (flag: { value: boolean }): boolean => {
  if (flag.value) {
    return false;
  }
  flag.value = true;
  return true;
};
