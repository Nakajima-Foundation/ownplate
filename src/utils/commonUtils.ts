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

// 印字してよい適格請求書発行事業者の登録番号、または null。
// "T" + 半角数字13桁と法律で決まっている。
//
// 形だけ見て実在は確かめられない（それは国税庁の公表サイトの話）が、形の違う番号を
// 請求書に印字すると、受け取った側が仕入税額控除に使えず、経費精算で弾かれて
// 初めて分かる。無いほうがまだ正直なので、形だけは弾く。
//
// 引数が unknown なのは、呼び出し側が Firestore の生データだから。RegExp.test() は
// 引数を文字列化するので、["T1234567890123"] のような値を素通しすると、
// 文字列を期待している印字側（escapePrinterString）がそこで落ちる。
export const printableInvoiceNumber = (value: unknown): string | null =>
  typeof value === "string" && /^T\d{13}$/.test(value) ? value : null;

// 入力欄の検証。印字の可否との違いは空の扱いだけで、こちらは空を通す。
// 免税事業者は番号を持たないので、必須にすると入力欄で詰まる。
// isEmpty は使わない。String(value) で比べるので、[] のような値が空として通る。
export const isValidInvoiceNumber = (value: unknown): boolean =>
  isNull(value) || value === "" || printableInvoiceNumber(value) !== null;

export type TaxCategory = { rate: number; revenue: number; tax: number };

export type OrderAccounting =
  | {
      food?: { revenue?: number; tax?: number };
      alcohol?: { revenue?: number; tax?: number };
    }
  | undefined;

// 税率ごとの区分。適格簡易請求書は区分の記載が要件。
//
// 率は引数で受ける。呼び出し側が渡すのは店舗の**現在**の設定なので、税率が変わると
// 過去の注文を再印字したときに率だけが今の値になる（金額は注文時のまま）。
// 注文時の率は保存されていないので、ここでは直せない。
//
// 売上が無い区分は出さない。0円の行はレシートを長くするだけで、
// 「その税率の取引があった」と誤読させる。
export const taxCategories = (
  accounting: OrderAccounting,
  foodTax: number,
  alcoholTax: number,
): TaxCategory[] =>
  [
    {
      rate: foodTax,
      revenue: accounting?.food?.revenue ?? 0,
      tax: accounting?.food?.tax ?? 0,
    },
    {
      rate: alcoholTax,
      revenue: accounting?.alcohol?.revenue ?? 0,
      tax: accounting?.alcohol?.tax ?? 0,
    },
  ].filter((category) => category.revenue > 0);

// 表示する税の行。レシートと PDF の両方がこれを使う。
//
// 区分が出せない古い注文（accounting を持たないもの）では、合計だけの1行に落とす。
// ここで空配列を返すと、呼ぶ側が「何も出さない」を選びうる。実際 PDF がそうなっていて、
// 古い注文の請求書から消費税の記載そのものが消えていた。
//
// どちらの行かは kind だけで決まる。率や売上の値で見分けると、データ側の値
// （foodTax が null で保存されている等）が「区分が出せなかった」を偽装できてしまい、
// 区分のある注文から 対象 の行が黙って消える。
export type TaxDisplayRow =
  | { kind: "category"; rate: number; revenue: number; tax: number }
  | { kind: "total"; tax: number };

export const taxDisplayRows = (
  accounting: OrderAccounting,
  foodTax: number,
  alcoholTax: number,
  totalTax: number,
): TaxDisplayRow[] => {
  const categories = taxCategories(accounting, foodTax, alcoholTax);
  return categories.length > 0
    ? categories.map((category): TaxDisplayRow => ({
        kind: "category",
        rate: category.rate,
        revenue: category.revenue,
        tax: category.tax,
      }))
    : [{ kind: "total", tax: totalTax }];
};
