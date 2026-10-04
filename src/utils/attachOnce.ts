// 受け口を一度だけ張るための小さな掛け金。
//
// **なぜ要るか**: FCM の `onMessage` も `onRegistered` も、呼ぶたびに受け口を足す。
// 二度張ると、通知が1件の push に対して2つ出る。画面ごとに張る作りだと、
// 同じ画面を開き直したり、別の導線から同じ関数を通ったりで簡単に二度呼ばれる。
export const attachOnce = () => {
  let attached = false;
  return (attach: () => void): boolean => {
    if (attached) {
      return false;
    }
    attached = true;
    attach();
    return true;
  };
};
