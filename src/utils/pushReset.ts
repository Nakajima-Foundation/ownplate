// Firebase 非依存にして、失敗経路をブラウザ無しで単体テストできるようにしている。

export type RegistrationReset = {
  // この端末の push 購読を捨てる。再試行が新しい endpoint で登録されるようにするため。
  dropSubscription: () => Promise<unknown>;
  // installation id を回す。register() がキャッシュから即答するのを止める唯一の手段。
  rotateInstallation: () => Promise<unknown>;
  onFailure: (reason: unknown) => void;
};

// 2つのリセットは独立していて、呼び出し側は「両方が試されること」を必要とする。
// 直列に繋ぐと、購読削除が失敗した端末（＝すでに push 状態が壊れている端末）で
// 回転がスキップされ、register() がキャッシュ経路に入って登録が死んだままになる。
//
// 決して reject しない。片方だけ成功しても登録を試す価値は残るし、失敗しても
// 呼び出し側に「とにかく試す」以上の選択肢が無いため。
export const resetRegistrationState = async (
  reset: RegistrationReset,
): Promise<void> => {
  // then 経由で起動する。promise を返す前に同期的に throw する実装があると、
  // そのままでは allSettled の外に抜けて、もう片方まで巻き込んで落ちる。
  const outcomes = await Promise.allSettled(
    [reset.dropSubscription, reset.rotateInstallation].map((step) =>
      Promise.resolve().then(step),
    ),
  );
  outcomes.forEach((outcome) => {
    if (outcome.status === "rejected") {
      reset.onFailure(outcome.reason);
    }
  });
};

// 後始末を待つが、待ちすぎない。片付けが遅いせいで本来の操作（サインアウト）が
// 止まるのを防ぐ。reject は握りつぶす — 呼び出し側に「とにかく先へ進む」以外の
// 選択肢が無いのは resetRegistrationState と同じ。
//
// schedule を引数で受けるのは、テストで実時間を待たないため。
export const settleWithin = async (
  work: Promise<unknown>,
  timeout_ms: number,
  schedule: (callback: () => void, ms: number) => unknown,
): Promise<void> => {
  await Promise.race([
    work.then(
      () => undefined,
      () => undefined,
    ),
    new Promise<void>((resolve) => schedule(() => resolve(), timeout_ms)),
  ]);
};
