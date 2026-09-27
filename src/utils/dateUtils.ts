// Firestore から読んだ時刻は Timestamp。臨時休業日は店舗設定の読み込み（Wrapper.vue）で
// Date に直している。どちらが来ても Date にする。firebase に依存しないよう、形で受ける。
export const asDate = (value: Date | { toDate: () => Date }): Date =>
  value instanceof Date ? value : value.toDate();
