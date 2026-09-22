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

// オプションは "サイズ,S(+100),M(+200)" のように、1つの組を1つの文字列に詰めて保存する。
// 追加料金は選択肢の名前の中に "(+100)" の形で書かれ、全角の ＋ ー − も使われる。
export const optionPriceRegex = /\(((\+|-|＋|ー|−)[0-9.]+)\)/;

export const convOptionPrice = (priceStr: string): number =>
  Number(priceStr.replace(/ー|−/g, "-").replace(/＋/g, "+"));

// 空や欠けた選択肢でも落ちない。注文は選んだオプションを**位置**で保存するので、店舗が
// あとから組を減らすと、既存の注文から存在しない選択肢を引くことが実際に起きる。投げると
// 店主には「internal」としか出ない。
export const optionPrice = (option: string | null | undefined): number => {
  const match = (option ?? "").match(optionPriceRegex);
  return match ? convOptionPrice(match[1]) : 0;
};

// 位置で指された組の選択肢。組が無いときは [""] を返す。
//
// 空配列ではない。呼び出し側は length === 1 を「入／切のひとつ」と読んで opt[0] の金額を
// 足すので、空配列だと opt[0] が undefined になって同じ落ち方に戻る。[""] なら 0 円として
// 通る。組が消えているのは「選ばれていない」と同じ扱いにするのが、いちばん害が小さい。
export const optionChoicesAt = (
  itemOptionCheckbox: string[] | null | undefined,
  index: number,
): string[] => ((itemOptionCheckbox ?? [])[index] ?? "").split(",");

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

// 合計に乗るのに税率区分には入っていない金額。行として出さないと、合計の出どころが
// 読めない書類になる。EC 送料と割引は、いままでどちらの書類にも行が無かった。
//
// 金額には触れない。これらには消費税が計算されていないが、課税し直すと外税の店舗では
// 顧客の請求額が変わる。ここでやるのは記載だけ。
//
// 配達料金と心づけを含めないのは、既に（0のときも）出ているものを変えないため。
// 0 の行を出さないのは、いま行が無いので 0円 の行が増えると紙が伸びるから。
export type ExtraCharge = { kind: "shipping" | "discount"; amount: number };

// Firestore の生データなので数値とは限らない。文字列のまま比較すると "5" > 0 が真になり、
// 金額の行に文字列がそのまま出る。
const numericAmount = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const extraCharges = (order: {
  shippingCost?: unknown;
  discountPrice?: unknown;
}): ExtraCharge[] => {
  const charges: ExtraCharge[] = [
    { kind: "shipping", amount: numericAmount(order.shippingCost) },
    { kind: "discount", amount: numericAmount(order.discountPrice) },
  ];
  return charges.filter((charge) => charge.amount > 0);
};

// 内税か外税か。レシートと PDF の両方がこれを使う。
//
// 注文時の値を優先する。金額は注文時の設定で計算されて凍結されているので、店舗の
// 現在値を見ると、店舗が後から切り替えたときに金額と食い違う札を貼ることになる。
// 古い注文は inclusiveTax を持たない（accounting と同じ場所で書かれるため）ので、
// そのときだけ店舗の設定に落とす。
//
// ?? であって || ではない。注文が「外税」で保存されている場合、|| だと false が
// 偽と見なされて店舗の設定に落ちてしまう。
export const isInclusiveTax = (
  order: { inclusiveTax?: boolean },
  restaurant: { inclusiveTax?: boolean },
): boolean => order.inclusiveTax ?? restaurant.inclusiveTax ?? false;

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
