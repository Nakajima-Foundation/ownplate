import type { MenuData } from "../models/menu";

interface PostageInfo {
  freeThreshold: number;
  postageList: { [key: string]: number[] };
}

export const costCal = (
  postageInfo: Partial<PostageInfo> | null | undefined,
  prefectureId: number,
  total: number,
) => {
  const postageList = postageInfo?.postageList?.default || [];
  const freeThreshold = postageInfo?.freeThreshold || null;
  if (freeThreshold !== null) {
    if (total >= freeThreshold) {
      return 0;
    }
  }
  if (prefectureId && postageList.length > 0) {
    return Number(postageList[prefectureId - 1]);
  }
  return 0;
};

export const isNull = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

export const isEmpty = (value: unknown): boolean => {
  return value === null || value === undefined || String(value) === "";
};

// 軽減税率の対象か。税区分 `tax` が "alcohol" のものだけが標準税率で（酒・グッズなど）、
// それ以外は軽減税率が適用される飲食料品。
//
// 税区分が入っていない古いメニューは軽減税率として扱う。orderAccounting() が
// 「"alcohol" 以外は foodTax」で計算しているので、そこと食い違わせると
// 「8%で計算されているのに ※ が付かない」行ができる。
// 型だけの import。実行時には消えるので、このファイルは依存ゼロのまま
// （node --test から直接読めることが、ここに置いている理由）。
// 相対パスは src/ と functions/src/ の両方で同じ場所を指す。
export const isReducedTaxRate = (
  item: Partial<MenuData> | undefined,
): boolean => item?.tax !== "alcohol";

// 適格請求書発行事業者の登録番号。"T" + 13桁と法律で決まっている。
//
// 空は通す。免税事業者は番号を持たないので、必須にすると入力欄で詰まる。
// 形だけ見て実在は確かめられない（それは国税庁の公表サイトの話）が、形の違う番号を
// 請求書に印字すると、受け取った側が仕入税額控除に使えず、経費精算で弾かれて
// 初めて分かる。無いほうがまだ正直なので、形だけは弾く。
export const isValidInvoiceNumber = (value: string | undefined): boolean =>
  !value || /^T\d{13}$/.test(value);

// 印字してよい登録番号、または null。未設定でも形が不正でも null。
//
// isValidInvoiceNumber は「空も通す」ので、印字の可否を決めるには
// `isValidInvoiceNumber(x) && x` と二重に書く必要があった。片方を消すと
// 「登録番号：」だけの行が出る。名前が「印字してよいか」を言う関数に寄せて、
// 呼び出し側から判断を無くす。
export const printableInvoiceNumber = (
  value: string | undefined,
): string | null => (value && isValidInvoiceNumber(value) ? value : null);
