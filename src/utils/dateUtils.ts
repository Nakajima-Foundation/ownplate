// Firestore から読んだ時刻は Timestamp だが、画面が同じ属性を上書きして Date に
// していることがある（読む時点でどちらか決まらない。ownplate#1981）。どちらが来ても
// Date にする。firebase に依存しないよう、形で受ける。
export const asDate = (value: Date | { toDate: () => Date }): Date =>
  value instanceof Date ? value : value.toDate();
