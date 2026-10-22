import moment from "moment";

import type { OrderInfoData, OrderItemData } from "../../models/orderInfoData";
import type { RestaurantInfoData } from "../../models/RestaurantInfo";
import {
  extraCharges,
  isInclusiveTax,
  isReducedTaxRate,
  optionPrice,
  printableInvoiceNumber,
  taxDisplayRows,
} from "../../utils/commonUtils.ts";
import {
  orderDocumentDate,
  orderDocumentDateLabel,
} from "../../utils/orderDocumentDate.ts";
import { roundPrice } from "../../utils/price.ts";
import { formatOption, nameOfOrder } from "../../utils/strings.ts";
import { extraChargeText, priceString } from "./pdfText.ts";
import { defaultStyle, pageMargins, pageSize, styles } from "./pdfStyles.ts";

export const displayOption = (options: string[]) => {
  return options
    .filter((choice: string) => choice)
    .map((choice: string) => {
      return formatOption(choice, (price: number) =>
        Number(price).toLocaleString(),
      );
    })
    .join(", ");
};

// 請求書 PDF の中身。pdfmake には渡さず、渡す手前のデータだけを作る。
//
// pdfmake を読み込む側（pdf2.ts）は location を見るので node から読めない。
// 組み立てをそちらに置くと、印字の判断がひとつも単体テストできない。実際それで
// 古い注文の消費税の行が丸ごと消えていたのを、誰も捕まえられなかった。
//
// 電話番号は呼び出し側から渡す。整形が vue の composable なので、ここで呼ぶと
// このファイルが vue と firebase に依存する。
export const buildOrderDocDefinition = (
  restaurantInfo: RestaurantInfoData,
  orderInfo: OrderInfoData,
  orderItems: OrderItemData[],
  nationalPhoneNumber: string,
) => {
  const content = [];

  // 店名
  content.push({
    text: restaurantInfo.restaurantName,
    fontSize: 12,
    margin: [2, 0],
  });
  // 登録番号。印字の可否はレシートと同じ関数で決める（未設定でも形が不正でも出さない）。
  // 発行元は店舗なので店名のすぐ下に置く。プラットフォームの行を挟むと
  // おもちかえり.com の番号に読める。
  const printableInvoice = printableInvoiceNumber(restaurantInfo.invoiceNumber);
  if (printableInvoice) {
    content.push({
      text: [
        { text: "登録番号：", fontSize: 6 },
        { text: printableInvoice, fontSize: 6 },
      ],
      margin: [2, 0],
    });
  }

  // おもちかえり.com 番号
  content.push({
    border: [false, false, false, false],
    text: "おもちかえり.com ",
    margin: [2, 4, 2, 0],
  });
  // 電話番号
  content.push({
    text: [
      {
        text: "TEL: ",
        fontSize: 6,
      },
      {
        text: nationalPhoneNumber,
        fontSize: 6,
      },
    ],
    margin: [2, 0],
  });
  content.push({
    text: nameOfOrder(orderInfo),
    fontSize: 12,
    bold: true,
    margin: [2, 0, 2, 4],
  });
  content.push({
    text: [
      {
        text: "受渡方法: ",
        fontSize: 6,
      },
      {
        text: orderInfo.isDelivery ? "デリバリー" : "テイクアウト",
        fontSize: 6,
        bold: true,
      },
    ],
    margin: [2, 0],
  });

  // 日付。受付前にキャンセルされた注文は timeEstimated を持たないが、取引年月日の無い
  // 書類を出すわけにはいかないので、希望受渡時刻に落とす（どちらも受渡の時刻）。
  const documentDate = orderDocumentDate(orderInfo);
  if (documentDate) {
    content.push({
      text: [
        {
          text: orderDocumentDateLabel(documentDate),
          fontSize: 6,
        },
        {
          text: moment(documentDate.at).format("YYYY/MM/DD HH:mm"),
          fontSize: 6,
          bold: true,
        },
      ],
      margin: [2, 0],
    });
  }
  // 名前
  content.push({
    text: (orderInfo.name || "--") + "様",
    fontSize: 10,
    alignment: "center",
    margin: [2, 6, 2, 6],
  });

  // オーダー内容
  orderItems.forEach((orderItem: OrderItemData) => {
    content.push({
      text:
        orderItem.item.itemName +
        (isReducedTaxRate(orderItem.item) ? " ※ " : ""),
      margin: [2, 0],
    });
    const options = orderItem.options
      ? Array.isArray(orderItem.options)
        ? orderItem.options
        : [orderItem.options]
      : [];
    const price = options.reduce((p, option: string) => {
      return p + roundPrice(optionPrice(option));
    }, orderItem.item.price || 0);

    const option = displayOption(options);
    if (option !== "") {
      content.push({
        text: "\u200B\t(opt: " + option + ")",
        margin: [2, 0],
        fontSize: 6,
      });
    }
    content.push({
      text: ["@" + price, " x " + String(orderItem.count)],
      margin: [16, 0],
    });
  });
  if (orderInfo.tip) {
    content.push({
      text: ["心づけ(税込): " + priceString(orderInfo.tip || 0)],
      margin: [2, 0],
      alignment: "right",
    });
  }
  if (orderInfo.isDelivery) {
    content.push({
      text: ["配送料(税込): " + priceString(orderInfo.deliveryFee || 0)],
      margin: [2, 0],
      alignment: "right",
    });
  }
  // 税率区分の外にある金額。行として出さないと合計の出どころが読めない。
  // 税込と書かないのは、これらに消費税が計算されていないから。
  extraCharges(orderInfo).forEach((charge) => {
    content.push({
      text: [extraChargeText(charge)],
      margin: [2, 0],
      alignment: "right",
    });
  });
  // 決済
  // 合計金額
  content.push({
    text: "合計: " + priceString(orderInfo.totalCharge),
    fontSize: 10,
    bold: true,
    margin: [2, 3],
    alignment: "right",
  });
  // 税率ごとの合計金額。区分の計算はレシートと同じ関数（commonUtils）で行う。
  //
  // accounting を持たない古い注文では区分が出せない。そのときに何も出さないと、
  // 消費税の記載そのものが請求書から消える。レシート側と同じく合計だけ出す。
  const taxLabel = isInclusiveTax(orderInfo, restaurantInfo)
    ? "内税額: "
    : "外税額: ";
  const taxTexts = taxDisplayRows(
    orderInfo?.accounting,
    restaurantInfo.foodTax,
    restaurantInfo.alcoholTax,
    orderInfo.tax || 0,
  ).map((row) =>
    row.kind === "total"
      ? taxLabel + priceString(row.tax)
      : [
          `${row.rate}%対象: ` + priceString(row.revenue),
          "(" + taxLabel + priceString(row.tax) + ")",
        ].join("\n"),
  );
  taxTexts.forEach((text) => {
    content.push({ text, margin: [2, 0], alignment: "right" });
  });
  if (orderItems.some((orderItem) => isReducedTaxRate(orderItem.item))) {
    content.push({
      text: "※軽減税率対象",
      fontSize: 6,
      margin: [2, 1],
    });
  }

  const hasStripe = !!orderInfo?.payment?.stripe;
  content.push({
    text: "支払方法: " + (hasStripe ? "カード決済" : "現地払い"),
    fontSize: 8,
    margin: [2, 2],
  });

  return {
    pageSize,
    pageMargins,

    content,
    styles,
    defaultStyle,
  };
};
