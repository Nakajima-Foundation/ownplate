import { DocumentData } from "firebase-admin/firestore";
import moment from "moment-timezone";

import { nameOfOrder, timezone } from "../../lib/utils";
import type { MenuData } from "../../models/menu";
import { ExtraCharge, TaxDisplayRow, extraCharges, isInclusiveTax, isReducedTaxRate, printableInvoiceNumber, taxDisplayRows } from "../../utils/commonUtils";

// レシート本文の組み立てのうち、文字列とデータだけで決まる部分。
// receiptline も Firestore も触らないので、ブラウザもプリンタも無しでテストできる。

// 税の行。区分が出せない注文は、合計だけの1行になる（taxDisplayRows が決める）。
export const taxLines = (rows: TaxDisplayRow[], taxPayment: string): string =>
  rows
    .flatMap((row) => (row.kind === "total" ? [`消費税（${taxPayment}） | ¥${row.tax}`] : [`${row.rate}%対象 | ¥${row.revenue}`, `消費税（${taxPayment}） | ¥${row.tax}`]))
    .join("\n");

// 税率区分の外にある金額の行。合計の出どころが読めるように出す。
export const extraChargeLines = (charges: ExtraCharge[]): string[] =>
  charges.map((charge) => (charge.kind === "shipping" ? `送料 | ¥${charge.amount}` : `割引 | -¥${charge.amount}`));

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
  // 未設定でも形が不正でも印字しない。画面側の検証はブラウザにしか無く、
  // Firestore を直接書けば不正な値が入る。不正な番号が載ったレシートは、受け取った側が
  // 仕入税額控除に使えず、経費精算で弾かれて初めて分かる。無いほうがまだ正直。
  //
  // escapePrinterString は、いまの形（T + 半角数字13桁）では通す文字が無いので効かない。
  // 形を緩めたときに receiptline の記法（{} や |）が素通りしないための備えとして残す。
  const printable = printableInvoiceNumber(restaurantData.invoiceNumber);
  const invoiceLine = printable ? `登録番号：${escapePrinterString(printable)}` : "";
  const taxPayment = isInclusiveTax(orderData, restaurantData) ? "内税" : "外税";

  // 区分の決定は commonUtils の taxDisplayRows。PDF 側と同じ関数を通す。
  const taxText = taxLines(taxDisplayRows(orderData.accounting, restaurantData.foodTax, restaurantData.alcoholTax, orderData.tax || 0), taxPayment);

  // 区分の外にある金額のうち、いま行が無いものだけ足す。配達料金と心づけは 0 でも
  // 出ているので変えない（行を消すとほぼ全てのレシートの見た目が変わる）。
  const amountLines = [
    `小計 | ¥${orderData.total}`,
    taxText,
    `配達料金 | ¥${orderData.deliveryFee || 0} `,
    `心づけ (サービス料・消費税含む)| ¥${orderData.tip || 0}`,
    ...extraChargeLines(extraCharges(orderData)),
  ].join("\n");

  const onlinePay = orderData?.payment?.stripe ? "事前クレジット決済" : "現地払い";
  // 凡例が無いときに行だけ残すと、旧実装に無かった空行が1行増える。
  // レシートは紙なので、空行は見えるし紙を食う。
  const footer = [`支払方法："${onlinePay}"|`, ...(reducedTaxNote(hasReducedItem) ? [reducedTaxNote(hasReducedItem)] : [])].join("\n");
  // 登録番号は店名のすぐ下。発行元は店舗なので、プラットフォームの行を挟むと
  // おもちかえり.com の番号に読める。
  // footer と同じ理由で、行だけ残さない。番号を持たない店舗のレシートに空行が1行増える。
  const header = [`^^${escapePrinterString(restaurantData.restaurantName || "")}`, ...(invoiceLine ? [invoiceLine] : []), "おもちかえり.com"].join("\n");

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
${amountLines}
-
^^ 合計 | ^^^¥${orderData.totalCharge}
{w:auto; b:space}
${footer}


`;
  return text;
};
