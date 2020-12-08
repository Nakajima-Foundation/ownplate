<template>
  <div>
    <button @click="download">Download menu example</button><br/>
    <button @click="download2">Download logo</button><br/>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import pdfMake from "pdfmake/build/pdfmake.js";
// import pdfFonts from "pdfmake/build/vfs_fonts.js";
import pdfFonts from "../../vfs_fonts.js";

import logosvg from "!raw-loader!../../static/pr/50mm-QR-Blank.svg";

import _ from 'lodash';

const fontHost = location.protocol + "//" + location.host + "/fonts/";

// https://github.com/bpampuch/pdfmake/blob/7b5675d5b9d5d7b815bd721e00504b16560a6382/src/standardPageSizes.js
const A4width = 595.28;
const A4height = 841.89;

// https://github.com/bpampuch/pdfmake/issues/359
const A4MarginVertical = 120; // 60 * 2
const A4MarginHorizontal = 80; // 40 * 2

export default {
  name: "pdf",
  data() {
    return {
      restaurantInfo: {},
      menus: null,
    };
  },
  async created() {
    const restaurantRef = db.doc(`restaurants/${this.restaurantId()}`);
    this.restaurantInfo = (await restaurantRef.get()).data();
    const menus = (await restaurantRef.collection("menus").where("deletedFlag", "==", false).get()).docs.map((a) => a.data()).slice(0, 6);
    this.menus = _.chunk(menus, 2);
  },
  methods: {
    convChar(val) {
      const regex = /[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g;

      const value = val
            .replace(regex, function (s) {
              return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
            })
            .replace(/[‐－―]/g, "-") // ハイフンなど
            .replace(/[～〜]/g, "~") // チルダ
            .replace(/−/g, "-")
            .replace(/　/g, " "); // スペース
      
      return value;
    },

    download() {
      pdfMake.vfs = pdfFonts.vfs;

      pdfMake.fonts = {
        GenShin: {
          normal: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          bold: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          italics: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          bolditalics: fontHost + 'GenShinGothic-Normal-Sub.ttf'
        }
      };

      const images = {
        coverImage: this.restaurantInfo.restCoverPhoto,
        logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
        menu: location.protocol + "//" + location.host + '/test.jpg', // TODO: Set default menu image
      };
      // TODO: fix Japanese kansuuji encoding issue
      const menuSize = 130;
      const content = [
        { image: "coverImage",
          width: A4width - A4MarginHorizontal,
          height: menuSize,
          cover: { width:  A4width - A4MarginHorizontal, height: menuSize },
        },
        { text: this.restaurantInfo.restaurantName, style: 'title',
          absolutePosition: {
            y: 80,
          },
        },
      ];

      const menu2colum = (menu, image, key1, key2) => {
        return [
          {
            width: '30%',
            stack: [
              { text: this.convChar("title:" + (menu.itemName || "untitled")) },
              { image: image ? "menu_" + key1 + "_" + key2 : 'menu',
                width: menuSize, height: menuSize,
                cover: { width:menuSize, height:menuSize }
              },

            ]
          },
          {
            width: '20%',
            stack: [
              { text:  this.convChar(menu.itemDescription) },
              { text:  menu.price + "円", bold: true },
            ]
          }
        ];
      };
      this.menus.forEach((menuPair, key) => {
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
            columnGap: 10
          }

        );
      });

      
      content.push({
        columns: [ 
          {
            width: '35%',
            svg: logosvg,
            width: menuSize,
            margin: [10, 10]
          },
          {
            width: '65%',
            stack: [
              {
                text: this.convChar('ネットでオーダーできるテイクアウトサービスをはじめました！こちらのQRコードからご注文できます！'), margin: [20, 0],
              },
              {
                text: this.convChar([this.restaurantInfo.state, this.restaurantInfo.city, this.restaurantInfo.streetAddress].join("")), margin: [20, 0]
              },
              {
                text: [this.restaurantInfo.phoneNumber].join(""), margin: [20, 0]
              }
            ]
          }
        ]
      });
      content.push();

      const docDefinition = {
        pageSize: "A4",
        content,
        images,
        styles: {
          title: {
            font: 'GenShin',
            fontSize: 24,
            alignment: 'center',
          },
          h1: {
            font: 'GenShin',
            fontSize: 18,
            bold: true
          },
          style2: {
            alignment: 'right',
            color: 'blue',
          }
        },
        defaultStyle: {
          font: 'GenShin',
          fontSize: 14,
        }
      };
      const pdfDoc = pdfMake.createPdf(docDefinition).download();
    },

    download2() {
      pdfMake.vfs = pdfFonts.vfs;

      pdfMake.fonts = {
        GenShin: {
          normal: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          bold: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          italics: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          bolditalics: fontHost + 'GenShinGothic-Normal-Sub.ttf'
        }
      };

      const content = [
        { image: "coverImage",
          width: A4width - A4MarginHorizontal,
          height: menuSize,
          cover: { width:  A4width - A4MarginHorizontal, height: menuSize },
        },
        {
          text: this.restaurantInfo.restaurantName, style: 'title',
          absolutePosition: {
            y: 80,
          },
        },
        // end of header
        
        { text: "aaa"},
        {
          text: this.shareUrl(), style: 'title',
        },
      ];
      const images = {
        coverImage: this.restaurantInfo.restCoverPhoto,
        logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
        menu: location.protocol + "//" + location.host + '/test.jpg', // TODO: Set default menu image
      };
      console.log(this.restaurantInfo);
      console.log(images);
      // TODO: fix Japanese kansuuji encoding issue

      content.push({ svg: logosvg,
                     width: 251,
                     absolutePosition: {
                       x: 60,
                       y: 230
                     }
                   });
      content.push({
        qr: this.shareUrl(),
        fit: 75,
        absolutePosition: {
          x: 148,
          y: 366
        }
      });
      content.push({
        text: "hello",
      });
      const docDefinition = {
        pageSize: "A4",
        content,
        images,
        styles: {
          title: {
            font: 'GenShin',
            fontSize: 24,
            alignment: 'center',
          },
          h1: {
            font: 'GenShin',
            fontSize: 18,
            bold: true
          },
          style2: {
            alignment: 'right',
            color: 'blue',
          }
        },
        defaultStyle: {
          font: 'GenShin',
          fontSize: 14,
        }
      };
      const pdfDoc = pdfMake.createPdf(docDefinition).download();
    },
  }
}
</script>
