export type OptionRow = {
  id: number;
  text: string;
};

// vuedraggable は行ごとに一意の目印を要求するが、オプションは店舗オーナーが打った文字列
// そのものなので、空のまま2つ追加するなどで簡単に重複する。並べ替えのあいだだけ通し番号を
// 振り、それを目印にする。
export const toOptionRows = (options: string[]): OptionRow[] =>
  options.map((text, index) => ({ id: index, text }));

export const toOptionTexts = (rows: OptionRow[]): string[] =>
  rows.map((row) => row.text);
