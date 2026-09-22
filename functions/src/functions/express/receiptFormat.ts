import { DocumentData } from "firebase-admin/firestore";
import moment from "moment-timezone";

import { nameOfOrder, timezone } from "../../lib/utils";
import type { MenuData } from "../../models/menu";
import { isReducedTaxRate, isValidInvoiceNumber } from "../../utils/commonUtils";

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
export const hasReducedTaxItem = (menuItems: { [menuId: string]: Partial<MenuData> }, orderedMenuIds: string[]): boolean =>
  orderedMenuIds.some((menuId) => isReducedTaxRate(menuItems[menuId]));

// 凡例。軽減税率の商品が無いレシートに出すと、何を指しているか分からない印だけが残る。
export const reducedTaxNote = (hasReducedItem: boolean): string => (hasReducedItem ? "※軽減税率対象" : "");

// 商品名に付ける軽減税率の印
export const itemMark = (item: Partial<MenuData> | undefined): string => (isReducedTaxRate(item) ? "※" : "");

const escapeOptionPrice = (text: string) => {
  const optionPriceRegex = /\(((\+|＋|ー|−)[0-9.]+)\)/g;
  return text.replace(optionPriceRegex, "");
};
export const escapePrinterString = (text: string) => {
  // {}+-|"`^,;:
  return text.replace(/[{}+\-|"`^,;:]+/g, "");
};

// receiptline に渡す手前のテキスト。ここまでが Firestore にもプリンタにも依存しない
// ので、ダミーの注文データを与えて単体テストできる。
// 実際の変換 (receiptline.transform) は apis.ts に残してある。
export const buildReceiptText = (restaurantData: DocumentData, orderData: DocumentData): string => {
  const orderNumber = nameOfOrder(orderData.number);

  const hasReducedItem = hasReducedTaxItem(orderData.menuItems, Object.keys(orderData.order));

  const messages: string[] = [];
  Object.keys(orderData.order).map((menuId) => {
    const menu = orderData.menuItems[menuId];
    const name = menu.itemName;
    return Object.keys(orderData.order[menuId]).map((key) => {
      const count = orderData.order[menuId][key];
      messages.push(`${escapePrinterString(name)}${itemMark(menu)} | x${count}`);

      try {
        if (orderData.options && orderData.options[menuId] && orderData.options[menuId][key]) {
          const opts = orderData.options[menuId][key].filter((o: unknown) => o);
          if (opts.length > 0) {
            opts.map((opt: string) => {
              if (opt) {
                messages.push("~~~*" + escapePrinterString(escapeOptionPrice(opt)) + "|");
              }
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
  const orders = messages.join("\n");
  const howToReceive = orderData.isDelivery ? "デリバリー" : "テイクアウト";
  const timeEstimated = moment(orderData.timePlaced.toDate()).tz(timezone).format("YYYY/MM/DD HH:mm");
  // 未設定の店舗（免税事業者など）では行ごと出さない。
  //
  // 形が不正なら印字もしない。画面側の検証はブラウザにしか無く、Firestore を直接
  // 書けば不正な値が入る。不正な番号が載ったレシートは、受け取った側が仕入税額控除に
  // 使えず、経費精算で弾かれて初めて分かる。無いほうがまだ正直。
  //
  // escapePrinterString を通すのは、ここだけが素通しだったため。receiptline は
  // {} を記法として読むので、含まれていると行ごと消える。
  const invoiceLine = isValidInvoiceNumber(restaurantData.invoiceNumber) && restaurantData.invoiceNumber ? `登録番号：${escapePrinterString(restaurantData.invoiceNumber)}` : "";
  const taxPayment = restaurantData.inclusiveTax ? "内税" : "外税";

  // 区分は receiptFormat.ts の純関数に切り出してある（単体テストあり）
  const taxText = taxLines(taxCategories(orderData.accounting, restaurantData.foodTax, restaurantData.alcoholTax), taxPayment, orderData.tax || 0);

  const onlinePay = orderData?.payment?.stripe ? "事前クレジット決済" : "現地払い";
  // 凡例が無いときに行だけ残すと、旧実装に無かった空行が1行増える。
  // レシートは紙なので、空行は見えるし紙を食う。
  const footer = [`支払方法："${onlinePay}"|`, ...(reducedTaxNote(hasReducedItem) ? [reducedTaxNote(hasReducedItem)] : [])].join("\n");
  // footer と同じ理由。行だけ残すと、番号を持たない店舗のレシートに空行が1行増える。
  const header = [`^^${escapePrinterString(restaurantData.restaurantName || "")}`, "おもちかえり.com", ...(invoiceLine ? [invoiceLine] : [])].join("\n");

  const text = `
${header}

^^^"${orderNumber}"

|受渡方法："${howToReceive}"
|受渡希望時間："${timeEstimated}"

${escapePrinterString(orderData.name || "")}さん|
{w:*,4;b:line}
${orders}
-
{w:16,16;a:right}
小計 | ¥${orderData.total}
${taxText}
配達料金 | ¥${orderData.deliveryFee || 0} 
心づけ (サービス料・消費税含む)| ¥${orderData.tip || 0}
-
^^ 合計 | ^^^¥${orderData.totalCharge}
{w:auto; b:space}
${footer}


`;
  return text;
};
