import pdfMake from "pdfmake/build/pdfmake.js";
import moment from "moment";
import { nameOfOrder } from "~/plugins/strings.js";
import { formatOption, optionPrice } from "~/plugins/strings.js";

import _ from 'lodash';

import {
  parsePhoneNumber,
  formatNational,
} from "~/plugins/phoneutil.js";

const fontHost = location.protocol + "//" + location.host + "/fonts/";

const pdfFont = {
  NotoSans: {
    normal: fontHost + 'NotoSansCJKjp-Regular.min.ttf',
    bold: fontHost + 'NotoSansCJKjp-Bold.min.ttf',
  },
};
pdfMake.fonts = pdfFont;

const styles = {
  title: {
    font: 'NotoSans',
    fontSize: 16,
    alignment: 'center',
  },
  h1: {
    font: 'NotoSans',
    fontSize: 18,
    bold: true
  },
  style2: {
    alignment: 'right',
    color: 'blue',
  }
};
const defaultStyle = {
  font: 'NotoSans',
  fontSize: 8,
};    

const convChar = (val) => {
  const regex = /[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g;
  
  const value = (val || "").replace(regex, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  })
        .replace(/[‐－―]/g, "-") 
        .replace(/[～〜]/g, "~")
        .replace(/−/g, "-")
        .replace(/　/g, " ");
  
  return value.normalize('NFKC');
};

const convMm2pt = (mm) => {
  return Math.round(mm / 0.35278 * 100) /100;
};

// 2/3 * 54 = 18 * 2 = 36
const pageSize = {width: convMm2pt(54), height: 'auto'};
const pageMargins = [ 0, 2, 0, 2 ];



export const orderDownloadData = () => {
  const content = [
    {
      text: "テイクアウト", style: 'title',
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
  const images = {
  };

  content.push({
    text: "hello",
  });
  const docDefinition = {
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
export const orderPrintData = () => {
  const pdfDoc = orderDownloadData();
  return pdfDoc.getBase64();
};

export const testDownload = () => {

  const content = [
    {
      image: "headerLogo",
      width: convMm2pt(40),
      margin: [ 10, 10 ],
    },
    {
      text: "テイクアウト", style: 'title',
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
    headerLogo: location.protocol + "//" + location.host + '/LP-Cover-Mobile-1-1.jpg',
  };

  content.push({
    text: "hello",
  });
  const docDefinition = {
    pageSize,

    // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
    pageMargins,

    content,
    images,
    styles,
    defaultStyle,
  };
  const pdfDoc = pdfMake.createPdf(docDefinition).getBase64();
  return pdfDoc;
};

export const printOrderData = (orderInfo, orderItems) => {
  const content = [];
  console.log(orderInfo, orderItems);
  // 番号, 合計金額, 名前
  content.push({
    text: nameOfOrder(orderInfo) + "   " + Number(orderInfo.totalCharge).toLocaleString() + "円   " + orderInfo.name ,
    fontSize: 12,
    margin: [2, 0],
  });
  // 日付
  content.push({
    text: "受渡: " + moment(orderInfo.timeEstimated.toDate()).format("YYYY/MM/DD HH:mm"),
    margin: [2, 0],
  });

  // オーダー内容
  orderItems.forEach((orderItem) => {
    console.log(orderItem);
    content.push({
      text: [orderItem.item.itemName, " x " + String(orderItem.count)].join(""),
      margin: [convMm2pt(0.5), convMm2pt(0.3)],
    });
    const option = displayOption(orderItem.options||[]);
    if (option !== "") {
      content.push({
        text: "opt: " + option,
        margin: [convMm2pt(0.5), convMm2pt(0.3)],
        fontSize: 6,
      });
    }
    console.log(orderItem);
  });
  // 決済
  // デリバリー or テイクアウト
  const docDefinition = {
    pageSize,
    pageMargins,

    content,
    styles,
    defaultStyle,
  };
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc;

};
export const printOrder = (orderInfo, orderItems) => {
  const pdfDoc = printOrderData(orderInfo, orderItems);
  return pdfDoc.getBase64();
};
export const downloadOrderPdf = (orderInfo, orderItems) => {
  const pdfDoc = printOrderData(orderInfo, orderItems);
  pdfDoc.download();
  
};


export const data2UrlSchema = (data, size) => {
  const passprnt_uri = "starpassprnt://v1/print/nopreview?" +
        "back=" + encodeURIComponent(window.location.href) +
        "&pdf=" + encodeURIComponent(data) + 
        "&size=" + size;
  return passprnt_uri;
};

export const displayOption = (options) => {
  return options
    .filter(choice => choice)
    .map(choice => {
      return formatOption(choice, price => Number(price).toLocaleString());
    }).join(", ");

};
