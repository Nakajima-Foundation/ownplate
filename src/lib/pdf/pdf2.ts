import pdfMake from "pdfmake/build/pdfmake";
import moment from "moment";

import { nameOfOrder, formatOption, optionPrice } from "@/utils/strings";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";
import { convChar } from "@/lib/pdf/pdf";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
const fontHost = location.protocol + "//" + location.host + "/fonts/";

const pdfFont = {
  NotoSans: {
    normal: fontHost + "NotoSansCJKjp-Regular.min.ttf",
    bold: fontHost + "NotoSansCJKjp-Bold.min.ttf",
  },
};
pdfMake.fonts = pdfFont;

interface OrderItemData {
  item: any;
  count: number;
  id: string;
  options: [string];
  orderIndex: any;
}

const styles = {
  title: {
    font: "NotoSans",
    fontSize: 16,
    alignment: "center",
  },
  h1: {
    font: "NotoSans",
    fontSize: 18,
    bold: true,
  },
  style2: {
    alignment: "right",
    color: "blue",
  },
};
const defaultStyle = {
  font: "NotoSans",
  fontSize: 8,
};

const convMm2pt = (mm: number) => {
  return Math.round((mm / 0.35278) * 100) / 100;
};

// 2/3 * 54 = 18 * 2 = 36
const pageSize = { width: convMm2pt(54), height: "auto" };
const pageMargins = [0, 2, 0, 2];

export const orderDownloadData = () => {
  const content = [
    {
      text: "テイクアウト",
      style: "title",
    },
    {
      text: "注文日: 2064/10/20 10:12",
      margin: [0, 0],
    },
    {
      text: " 受け渡し: 2064/10/25 10:12",
      margin: [0, 0],
    },
    {
      text: "注文:",
      margin: [0, 0],
    },
    {
      text: "ラーメン 大盛り 1つ:あいうえおあいうえおあいうえおあいうえお",
      margin: [0, 0],
    },
    {
      text: "ラーメン 大盛り 1つ:",
      margin: [0, 0],
    },
    {
      text: "合計: 2000円",
      margin: [0, 0],
    },
    {
      text: "クレジット決済",
      margin: [0, 0],
    },
    {
      text: "デリバリー",
      margin: [0, 0],
    },
    {
      text: "注文:",
      margin: [0, 0],
    },
  ];
  const images = {};

  const docDefinition = {
    pageSize,

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins,

    content,
    images,
    styles,
    defaultStyle,
  } as any;
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc;
};

export const orderPdfDownload = () => {
  const pdfDoc = orderDownloadData();
  return pdfDoc.download();
};
export const orderPrintData = () => {
  const pdfDoc = orderDownloadData();
  // @ts-ignore
  return pdfDoc.getBase64(); // Promise<string>;
};

export const testDownload = () => {
  const content = [
    {
      image: "headerLogo",
      width: convMm2pt(40),
      margin: [10, 10],
    },
    {
      text: "テイクアウト",
      style: "title",
    },
    {
      text: "注文日: 2064/10/20 10:12",
      margin: [0, 0],
    },
    {
      text: " 受け渡し: 2064/10/25 10:12",
      margin: [0, 0],
    },
    {
      text: "注文:",
      margin: [0, 0],
    },
    {
      text: "ラーメン 大盛り 1つ:",
      margin: [0, 0],
    },
    {
      text: "チャーハン 大盛り 1つ:",
      margin: [0, 0],
    },
    {
      text: "合計: 2000円",
      margin: [0, 0],
    },
    {
      text: "クレジット決済",
      margin: [0, 0],
    },
    {
      text: "デリバリー",
      margin: [0, 0],
    },
    {
      text: "注文:",
      margin: [0, 0],
    },
  ];
  const images = {
    headerLogo:
      location.protocol + "//" + location.host + "/LP-Cover-Mobile-1-1.jpg",
  };

  const docDefinition = {
    pageSize,

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins,

    content,
    images,
    styles,
    defaultStyle,
  } as any;
  // @ts-ignore
  const pdfDoc = pdfMake.createPdf(docDefinition).getBase64();
  return pdfDoc;
};

const priceString = (price: number) => {
  return "¥" + Number(price).toLocaleString() + "";
};

export const printOrderData = (
  restaurantInfo: RestaurantInfoData,
  orderInfo: OrderInfoData,
  orderItems: OrderItemData[]
) => {
  const content = [];
  console.log(orderInfo, orderItems, restaurantInfo);
  // 店名
  content.push({
    text: restaurantInfo.restaurantName,
    fontSize: 12,
    margin: [2, 0],
  });

  // おもちかえり.com 番号
  content.push({
    width: convMm2pt(54),
    table: {
      widths: ["*"],
      body: [
        [{
          border: [false, false, false, false],
          text: "おもちかえり.com " + nameOfOrder(orderInfo),
          fontSize: 10,
          fillColor: "#eeeeee",
        }]
      ]
    }
  });
  content.push({
    text: "受渡方法: " + (orderInfo.isDelivery ? "デリバリー" : "テイクアウト"),
    fontSize: 6,
    margin: [2, 1],
  });
  
  // 日付
  if (orderInfo.timeEstimated) {
    content.push({
      fontSize: 6,
      text:
      "受渡時間: " +
        moment(orderInfo.timeEstimated.toDate()).format("YYYY/MM/DD HH:mm"),
      margin: [2, 0],
    });
  }
  // 名前
  content.push({
    text:
    (orderInfo.name || "--") + "さん",
    fontSize: 10,
    alignment: "center",
    margin: [2, 1],
  });

  // オーダー内容
  orderItems.forEach((orderItem: OrderItemData) => {
    content.push({
      text: [orderItem.item.itemName, " x " + String(orderItem.count)].join(""),
      margin: [convMm2pt(0.5), convMm2pt(0.3)],
    });
    console.log(orderItem);
    const option = displayOption(orderItem.options || []);
    if (option !== "") {
      content.push({
        text: "\u200B\topt: " + option,
        margin: [convMm2pt(0.5), convMm2pt(0.3)],
        fontSize: 6,
      });
    }
    console.log(orderItem);
  });
  // 決済
  // 小計
  content.push({
    text: [
      "小計: " + priceString(orderInfo.sub_total),
      "消費税" + (orderInfo.inclusiveTax ? "(内税)" : "(外税)") + ": " + priceString(orderInfo.tax),
    ].join("\n"),
    margin: [2, 0],
    alignment: "right",
  });
  if (orderInfo.isDelivery) {
    content.push({
      text: "配送料: " + priceString(orderInfo.deliveryFee || 0),
      margin: [2, 0],
      alignment: "right",
    });
  }
  // 合計金額
  content.push({
    text:
    "合計" + priceString(orderInfo.totalCharge),
    fontSize: 12,
    margin: [2, 2],
    alignment: "right",
  });
  // デリバリー or テイクアウト

  const docDefinition = {
    pageSize,
    pageMargins,

    content,
    styles,
    defaultStyle,
  } as any;
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc;
};
export const printOrder = (
  restaurantInfo: RestaurantInfoData,
  orderInfo: OrderInfoData,
  orderItems: OrderItemData[]
) => {
  const pdfDoc = printOrderData(restaurantInfo, orderInfo, orderItems);
  // @ts-ignore
  return pdfDoc.getBase64();
};
export const downloadOrderPdf = (
  restaurantInfo: RestaurantInfoData,
  orderInfo: OrderInfoData,
  orderItems: OrderItemData[]
) => {
  const pdfDoc = printOrderData(restaurantInfo, orderInfo, orderItems);
  pdfDoc.download();
};

export const data2UrlSchema = (data: string, size: string) => {
  const passprnt_uri =
    "starpassprnt://v1/print/nopreview?" +
    "back=" +
    encodeURIComponent(window.location.href) +
    "&pdf=" +
    encodeURIComponent(data) +
    "&size=" +
    size;
  return passprnt_uri;
};

export const displayOption = (options: string[]) => {
  return options
    .filter((choice: string) => choice)
    .map((choice: string) => {
      return formatOption(choice, (price: number) =>
        Number(price).toLocaleString()
      );
    })
    .join(", ");
};
