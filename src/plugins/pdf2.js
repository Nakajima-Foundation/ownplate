import pdfMake from "pdfmake/build/pdfmake.js";
import _ from 'lodash';


import {
  parsePhoneNumber,
  formatNational,
} from "~/plugins/phoneutil.js";

import logosvg from "!raw-loader!../static/pr/50mm-QR-Blank.svg";

const fontHost = location.protocol + "//" + location.host + "/fonts/";

// https://github.com/bpampuch/pdfmake/blob/7b5675d5b9d5d7b815bd721e00504b16560a6382/src/standardPageSizes.js
const A4width = 595.28;
const A4height = 841.89;

// https://github.com/bpampuch/pdfmake/issues/359
const A4MarginVertical = 120; // 60 * 2
const A4MarginHorizontal = 80; // 40 * 2

const A4ContentWidth = A4width - A4MarginHorizontal;

const pdfFont = {
  NotoSans: {
    normal: fontHost + 'NotoSansCJKjp-Regular.min.ttf',
    bold: fontHost + 'NotoSansCJKjp-Bold.min.ttf',
    italics: fontHost + 'NotoSansCJKjp-Regular.min.ttf',
    bolditalics: fontHost + 'NotoSansCJKjp-Bold.min.ttf'
  },
};

const tableOrangeElement = {
  text: "",
  border: [false, false, false, false],
  fillColor: "#FCC03D", 
};

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
const menuSize = 60;

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
  pdfMake.fonts = pdfFont;

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
    defaultStyle: {
      font: 'NotoSans',
      fontSize: 8,
    }
  };
  const pdfDoc = pdfMake.createPdf(docDefinition);
  return pdfDoc;
};

export const orderDownload = () => {
  const pdfDoc = orderDownloadData();
  return pdfDoc.download();
};
export const orderPrintData = () => {
  const pdfDoc = orderDownloadData();
  return pdfDoc.getBase64();
};


export const testDownload = (restaurantInfo) => {
  pdfMake.fonts = pdfFont;

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
    defaultStyle: {
      font: 'NotoSans',
      fontSize: 12,
    }
  };
  console.log(docDefinition);
  // const pdfDoc = pdfMake.createPdf(docDefinition).download();
  // return pdfDoc;
  const pdfDoc = pdfMake.createPdf(docDefinition).getBase64();
  return pdfDoc;
};

export const printOrder = (orderInfo) => {
  pdfMake.fonts = pdfFont;
  const docDefinition = {
    pageSize,
  };
  console.log(orderInfo);
  const pdfDoc = pdfMake.createPdf(docDefinition).download();
  return pdfDoc;

};
