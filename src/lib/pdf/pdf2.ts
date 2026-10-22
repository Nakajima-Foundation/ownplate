import pdfMake from "pdfmake/build/pdfmake";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";

import { useNationalPhoneNumber } from "@/utils/utils";
import { buildOrderDocDefinition } from "./orderDocDefinition";
import {
  convMm2pt,
  defaultStyle,
  pageMargins,
  pageSize,
  styles,
} from "./pdfStyles";

import { OrderInfoData, OrderItemData } from "@/models/orderInfoData";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
const fontHost = location.protocol + "//" + location.host + "/fonts/";

const pdfFont = {
  NotoSans: {
    normal: fontHost + "NotoSansCJKjp-Regular.min.ttf",
    bold: fontHost + "NotoSansCJKjp-Bold.min.ttf",
  },
};
pdfMake.fonts = pdfFont;

export const orderDownloadData = () => {
  const content: Content[] = [
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

  const docDefinition: TDocumentDefinitions = {
    pageSize,

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins,

    content,
    images,
    styles,
    defaultStyle,
  };
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc;
};

export const orderPdfDownload = () => {
  const pdfDoc = orderDownloadData();
  return pdfDoc.download();
};
export const orderPrintData = (): Promise<string> => {
  const pdfDoc = orderDownloadData();
  return pdfDoc.getBase64();
};

export const testDownload = (): Promise<string> => {
  const content: Content[] = [
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

  const docDefinition: TDocumentDefinitions = {
    pageSize,

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins,

    content,
    images,
    styles,
    defaultStyle,
  };
  const pdfDoc: Promise<string> = pdfMake.createPdf(docDefinition).getBase64();
  return pdfDoc;
};

export const printOrderData = (
  restaurantInfo: RestaurantInfoData,
  orderInfo: OrderInfoData,
  orderItems: OrderItemData[],
) => {
  const { nationalPhoneNumber } = useNationalPhoneNumber(restaurantInfo);
  const docDefinition = buildOrderDocDefinition(
    restaurantInfo,
    orderInfo,
    orderItems,
    nationalPhoneNumber.value || "",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pdfMake.createPdf(docDefinition as any);
};
export const printOrder = (
  restaurantInfo: RestaurantInfoData,
  orderInfo: OrderInfoData,
  orderItems: OrderItemData[],
): Promise<string> => {
  const pdfDoc = printOrderData(restaurantInfo, orderInfo, orderItems);
  return pdfDoc.getBase64();
};
export const downloadOrderPdf = (
  restaurantInfo: RestaurantInfoData,
  orderInfo: OrderInfoData,
  orderItems: OrderItemData[],
) => {
  const pdfDoc = printOrderData(restaurantInfo, orderInfo, orderItems);
  pdfDoc.download();
};

export const data2UrlSchema = (data: string, size: string): string => {
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
