// 書類に出す受渡の日時。
//
// timeEstimated は受付時にしか書かれない。受付前にキャンセルされた注文でも印刷できるので、
// これだけを見ると日付の無い書類が出る。取引年月日は適格簡易請求書の必須要素。
//
// timePlaced という名前は中身と合っていない。orderPlace が timeToPickup をそのまま入れて
// いるので、実体は注文者が希望した受渡時刻。どちらも受渡の時刻なので落とし先として正しい。
//
// どちらの時刻かは kind で決まる。希望時刻を「受渡時間」と書くと、店舗が確定した時刻に
// 見える。
export type OrderDocumentDate =
  { kind: "estimated"; at: Date } | { kind: "requested"; at: Date };

type TimestampLike = { toDate: () => Date };

const isTimestampLike = (value: unknown): value is TimestampLike =>
  typeof value === "object" &&
  value !== null &&
  "toDate" in value &&
  typeof value.toDate === "function";

export const orderDocumentDate = (order: {
  timeEstimated?: unknown;
  timePlaced?: unknown;
}): OrderDocumentDate | null => {
  if (isTimestampLike(order.timeEstimated)) {
    return { kind: "estimated", at: order.timeEstimated.toDate() };
  }
  if (isTimestampLike(order.timePlaced)) {
    return { kind: "requested", at: order.timePlaced.toDate() };
  }
  return null;
};

// 書類に出すラベル。希望時刻を「受渡時間」と書くと、店舗が確定した時刻に見える。
// レシートが同じ値に使っている語に合わせる。
//
// 描画側に置くと pdfmake ごと読み込むことになり、2つを入れ替えても何も赤くならない。
export const orderDocumentDateLabel = (date: OrderDocumentDate): string =>
  date.kind === "estimated" ? "受渡時間: " : "受渡希望時間: ";
