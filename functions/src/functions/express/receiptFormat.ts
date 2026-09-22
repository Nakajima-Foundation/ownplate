import { isReducedTaxRate } from "../../utils/commonUtils";

// レシート本文の組み立てのうち、文字列とデータだけで決まる部分。
// receiptline も Firestore も触らないので、ブラウザもプリンタも無しでテストできる。

export type TaxCategory = { rate: number; revenue: number; tax: number };

export type OrderAccounting =
  | {
      food?: { revenue?: number; tax?: number };
      alcohol?: { revenue?: number; tax?: number };
    }
  | undefined;

// 税率ごとの区分。適格簡易請求書は区分の記載が要件。
//
// 率は引数で受ける。ベタ書きすると、税率が変わったときに金額は正しいのに
// 率の表示だけ嘘になる。
//
// 売上が無い区分は出さない。0円の行はレシートを長くするだけで、
// 「その税率の取引があった」と誤読させる。
export const taxCategories = (accounting: OrderAccounting, foodTax: number, alcoholTax: number): TaxCategory[] =>
  [
    { rate: foodTax, revenue: accounting?.food?.revenue ?? 0, tax: accounting?.food?.tax ?? 0 },
    { rate: alcoholTax, revenue: accounting?.alcohol?.revenue ?? 0, tax: accounting?.alcohol?.tax ?? 0 },
  ].filter((category) => category.revenue > 0);

// 税の行。accounting を持たない古い注文は、これまでどおり合計だけを出す。
// 区分が出せないときに何も出さないと、消費税の記載そのものが消える。
export const taxLines = (categories: TaxCategory[], taxPayment: string, totalTax: number): string =>
  categories.length > 0
    ? categories.flatMap((category) => [`${category.rate}%対象 | ¥${category.revenue}`, `消費税（${taxPayment}） | ¥${category.tax}`]).join("\n")
    : `消費税（${taxPayment}） | ¥${totalTax}`;

// 軽減税率の商品が1つでもあるか。明細を組み立てながらフラグを立てるのではなく
// データから直接決める。組み立ての都合で印と凡例が食い違うのを防ぐ。
export const hasReducedTaxItem = (menuItems: { [menuId: string]: { tax?: string } }, orderedMenuIds: string[]): boolean =>
  orderedMenuIds.some((menuId) => isReducedTaxRate(menuItems[menuId]));

// 凡例。軽減税率の商品が無いレシートに出すと、何を指しているか分からない印だけが残る。
export const reducedTaxNote = (hasReducedItem: boolean): string => (hasReducedItem ? "※軽減税率対象" : "");

// 商品名に付ける軽減税率の印
export const itemMark = (item: { tax?: string } | undefined): string => (isReducedTaxRate(item) ? "※" : "");
