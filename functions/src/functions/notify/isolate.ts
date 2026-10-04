// 通知の経路を互いから切り離す。依存を持たないので単体で試験できる。
//
// **なぜ要るか**: 通知を呼ぶのは、注文の確定や Stripe の capture が済んだ「あと」。
// そこで投げると、処理は通っているのに呼び手にはエラーが返る。客には失敗に見えて
// 二重注文になり、店には何も届かない。
//
// **順番は変えない**。いまの実装が順に送っているので、並列にすると送信の順序が変わる。

export type IsolatedTask = {
  name: string;
  run: () => Promise<void>;
};

export type IsolatedResult = {
  done: string[];
  failed: string[];
};

export const runIsolated = async (
  tasks: IsolatedTask[],
  onError: (name: string, error: unknown) => void,
): Promise<IsolatedResult> =>
  tasks.reduce<Promise<IsolatedResult>>(
    async (previous, task) => {
      const result = await previous;
      try {
        await task.run();
        return { ...result, done: [...result.done, task.name] };
      } catch (error) {
        // 報告する側が落ちても鎖は切らない。「決して reject しない」が約束なので。
        try {
          onError(task.name, error);
        } catch (reporterError) {
          console.error(
            "runIsolated: the error reporter itself threw",
            reporterError,
          );
        }
        return { ...result, failed: [...result.failed, task.name] };
      }
    },
    Promise.resolve({ done: [], failed: [] }),
  );
