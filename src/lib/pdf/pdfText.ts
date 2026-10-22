import type { ExtraCharge } from "../../utils/commonUtils";

// PDF に載せる文字列のうち、pdfmake に触らない部分。
//
// pdf2.ts は pdfmake を top-level import し、読み込み時に location を見るので node から
// 読めない。文字列の組み立てをあちらに置くと単体テストできず、実際に消費税の行が
// 丸ごと消えていたのを誰も捕まえられなかった。

export const priceString = (price: number) => {
  return "¥" + Number(price).toLocaleString() + "";
};

// 税率区分の外にある金額の行。割引は合計から引かれるので符号を付ける。
// 「税込」とは書かない。これらに消費税は計算されていない。
export const extraChargeText = (charge: ExtraCharge): string =>
  charge.kind === "shipping"
    ? "送料: " + priceString(charge.amount)
    : "割引: -" + priceString(charge.amount);
