export type OptionRow = {
  id: number;
  text: string;
};

// vuedraggable の目印は Vue が行を照合する鍵になるが、オプションは店舗オーナーが打った文字列
// そのものなので、空のまま2つ追加するなどで簡単に重複し、ドラッグのあと行が増える。並べ替えの
// あいだだけ通し番号を振り、それを目印にする。
export const toOptionRows = (options: string[]): OptionRow[] =>
  options.map((text, index) => ({ id: index, text }));

export const toOptionTexts = (rows: OptionRow[]): string[] =>
  rows.map((row) => row.text);

// プレビューに映すものが無いなら、開閉のトグル自体を出さない。新規商品の既定は [""] なので、
// 「オプションが設定されているか」は長さではなく中身で見る。
export const hasOptionsToPreview = (
  itemOptionCheckbox: string[] | null | undefined,
): boolean =>
  (itemOptionCheckbox ?? []).some((option) => (option ?? "").trim() !== "");
