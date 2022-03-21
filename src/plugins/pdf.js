import pdfMake from "pdfmake/build/pdfmake.js";
import _ from 'lodash';


import {
  parsePhoneNumber,
  formatNational,
} from "~/plugins/phoneutil.js";

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

//
const styles = {
  title: {
    bold: true,
    font: 'NotoSans',
    fontSize: 24,
    alignment: 'center',
    margin: [0, 14],
  },
  description: {
    font: 'NotoSans',
    fontSize: 10,
  },
  address: {
    lineHeight: 1.5,
    font: 'NotoSans',
    fontSize: 12,
    color: "#0097a7",
    alignment: 'center',
    margin: [0, 7],
  },
  phone: {
    font: 'NotoSans',
    fontSize: 12,
    color: "#0097a7",
    alignment: 'center',
    margin: [0, 5],
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

export const menuDownload = (restaurantInfo, menuObj, nationalPhoneNumber, shareUrl) => {
  pdfMake.fonts = pdfFont;
  
  const menus = _.chunk((restaurantInfo.menuLists || []).reduce((tmp, itemKey) => {
    if (menuObj[itemKey]) {
      tmp.push(menuObj[itemKey]);
    }
    return tmp;
  }, []).slice(0, 6), 2);
  
  const images = {
    headerLogo: location.protocol + "//" + location.host + '/Omochikaeri-Logo-Horizontal-Primary.png',
    coverImage: restaurantInfo.restCoverPhoto ||  location.protocol + "//" + location.host + '/OwnPlate-Logo-Horizontal-YellowBlack.png',
    logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
    menu: location.protocol + "//" + location.host + '/no_image.jpg',
  };

  
  const linkbodys = ["注文: " + shareUrl];
  if (restaurantInfo.url) {
    linkbodys.push("ホームページ:" + restaurantInfo.url);
  }
  const qrCodeBody = [
    [
      tableOrangeElement,
      tableOrangeElement,
      tableOrangeElement,
    ],
    [{
      border: [false, false, false, false],
      text: convChar('ネットでオーダーできるテイクアウトサービスをはじめました！\nこちらのQRコード↓↓↓↓↓からご注文できます！'),
      alignment: 'center',
      fillColor: "#FCC03D",
      colSpan: 3,
      lineHeight: 1.3,
    }],
    [
      tableOrangeElement,
      {
        border: [false, false, false, false],
        alignment: 'center', 
        qr: shareUrl,
        eccLevel: "H",
        fit: 75,
      },
      tableOrangeElement,
    ],
    [{
      border: [false, false, false, false],
      text: linkbodys.join("\n"),
      fontSize: 8,
      alignment: 'center',
      fillColor: "#FCC03D",
      colSpan: 3,
      lineHeight: 1.3,
    }],
    [
      tableOrangeElement,
      tableOrangeElement,
      tableOrangeElement,
    ],
  ];    
  
  const content = [
    { image: "headerLogo",
      width: (A4ContentWidth) / 4,
      margin: [(A4ContentWidth) * 3 / 8, 10]
    },
    { image: "coverImage",
      width: A4ContentWidth,
      height: menuSize,
      cover: { width:  A4ContentWidth, height: menuSize },
    },
    {
      text: restaurantInfo.restaurantName,
      bold: true,
      style: 'title',
    },
    {
      width: (A4ContentWidth),
      table: {
        widths: [5, '*', 5],
        body: [
          [{
            text: " ",
            border: [false, false, false, false],
            fillColor: "#eeeeee",
          },
           {
             border: [false, false, false, false],
             text: " \n" + convChar(restaurantInfo.introduction) + "\n \n", 
             fillColor: "#eeeeee",
             lineHeight: 1.5,
           },
           {
             text: "",
             border: [false, false, false, false],
             fillColor: "#eeeeee",
           }]
        ]
      },
      style: 'description',
    },
    {
      text: convChar([
        [ "〒", restaurantInfo.zip, " ",
          restaurantInfo.state, restaurantInfo.city, restaurantInfo.streetAddress
        ].join(""),
        "電話 " + nationalPhoneNumber
      ].join("\n"),
                          
                         ),
      style: 'address',
      bold: true,
      
    },
    {
      layout: 'lightHorizontalLines', // optional
      table: {
        headerRows: 0,
        widths: [ '*', 55, '*' ],
        body: qrCodeBody
      },
      style: 'centerMenu',
    },
  ];
  content.push({
    text: "\n★★★ メニューの例 ★★★\n\n",
    alignment: 'center',
    margin: [10, 0],
  });

  const menu2colum = (menu, image, key1, key2) => {
    return [
      {
        
        width: '35%',
        stack: [
          {
            bold: true,
            text: convChar(menu.itemName || "untitled"),
            fontSize: 10,
            margin: [0, 3]

          },
          {
            text:  "¥" + menu.price,
            fontSize: 8,
            color: "#555555",
          },
          {
            text:  convChar(menu.itemDescription.slice(0, 100)),
            lineHeight: 1.3,
            fontSize: 6,
            margin: [0, 5]
          },

        ]
      },
      {
        width: '15%',
        stack: [
          { image: image ? "menu_" + key1 + "_" + key2 : 'menu',
            width: menuSize, height: menuSize,
            cover: { width: menuSize, height: menuSize },
            margin: [5, 5, 5, 5]
          },
        ]
      }
    ];
  };
  menus.forEach((menuPair, key) => {
    const columns = [];
    menuPair.forEach((m, key2) => {
      const image1 = (m?.images?.item?.resizedImages||{})["600"] || menuPair[key2].itemPhoto;

      if (image1) {
        images["menu_" + key + "_" + key2] = image1;
      }
      menu2colum(m, image1, key, key2).forEach(elem => {
        columns.push(elem);
      });
    });

    content.push(
      {
        columns,
        columnGap: 10,
        width: "50%",
        height: 200,
      }
    );
  });

  
  const docDefinition = {
    pageSize: "A4",
    content,
    images,
    styles,
    defaultStyle: {
      font: 'NotoSans',
      fontSize: 14,
    },
  };
  return pdfMake.createPdf(docDefinition).download();
};

