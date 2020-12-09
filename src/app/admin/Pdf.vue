<template>
  <div>
    <button @click="download">Download menu example</button><br/>
    <button @click="download2">Download logo</button><br/>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import pdfMake from "pdfmake/build/pdfmake.js";

import {
  parsePhoneNumber,
  formatNational,
} from "~/plugins/phoneutil.js";


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
    const menuObj = this.array2obj((await restaurantRef.collection("menus").where("deletedFlag", "==", false).get()).docs.map(this.doc2data("")));
    
    const menus = (this.restaurantInfo.menuLists || []).reduce((tmp, itemKey) => {
      if (menuObj[itemKey]) {
        tmp.push(menuObj[itemKey]);
      }
      return tmp;
    }, []).slice(0, 6);
    
    this.menus = _.chunk(menus, 2);
  },
  computed: {
    // TODO: create method and move to utils. merge ShopInfo.vue
    // TODO: merge restaurantInfo and shopInfo
    parsedNumber() {
      const countryCode = this.restaurantInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.restaurantInfo.phoneNumber);
      } catch (error) {
        return null;
      }
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    nationalPhoneNumber() {
      const number = this.parsedNumber;
      if (number) {
        return formatNational(number);
      }
      return this.restaurantInfo.phoneNumber;
    },
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
      
      pdfMake.fonts = {
        GenShin: {
          normal: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          bold: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          italics: fontHost + 'GenShinGothic-Normal-Sub.ttf',
          bolditalics: fontHost + 'GenShinGothic-Normal-Sub.ttf'
        },
        NotoSans: {
          normal: fontHost + 'NotoSansCJKjp-Regular.ttf',
          bold: fontHost + 'NotoSansCJKjp-Bold.ttf',
          italics: fontHost + 'NotoSansCJKjp-Regular.ttf',
          bolditalics: fontHost + 'NotoSansCJKjp-Bold.ttf'
        },
      };
      
      const images = {
        headerLogo: location.protocol + "//" + location.host + '/Omochikaeri-Logo-Horizontal-Primary.png',
        coverImage: this.restaurantInfo.restCoverPhoto,
        logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
        menu: location.protocol + "//" + location.host + '/test.jpg', // TODO: Set default menu image
      };
      // TODO: fix Japanese kansuuji encoding issue
      const menuSize = 60;
      const content = [
        { image: "headerLogo",
          width: (A4width - A4MarginHorizontal) / 4,
          margin: [(A4width - A4MarginHorizontal) * 3 / 8, 10]
          
          // height: menuSize,
          // cover: { width:  A4width - A4MarginHorizontal, height: menuSize },
        },
        
        { image: "coverImage",
          width: A4width - A4MarginHorizontal,
          height: menuSize,
          cover: { width:  A4width - A4MarginHorizontal, height: menuSize },
        },
        {
          text: this.restaurantInfo.restaurantName,
          bold: true,
          style: 'title',
        },
        {
          width: (A4width - A4MarginHorizontal),
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
                text: " \n" + this.restaurantInfo.introduction + "\n \n", 
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
          text: this.convChar([
            [ "〒", this.restaurantInfo.zip, " ",
              this.restaurantInfo.state, this.restaurantInfo.city, this.restaurantInfo.streetAddress
            ].join(""),
            "電話 " + this.nationalPhoneNumber
          ].join("\n"),
                              
                             ),
          style: 'address',
          bold: true,
          
        },
        {
          layout: 'lightHorizontalLines', // optional
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: [ '*', 47, '*' ],
            
            body: [
              [
                {
                  text: "",
                  border: [false, false, false, false],
                fillColor: "#FCC03D", 
                },
                {
                  border: [false, false, false, false],
                  text:"",
                fillColor: "#FCC03D", 
                },
                {
                  border: [false, false, false, false],
                  text:"",
                fillColor: "#FCC03D", 
                },
              ],
              [{
                border: [false, false, false, false],
                text: this.convChar('ネットでオーダーできるテイクアウトサービスをはじめました！\nこちらのQRコード↓↓↓↓↓からご注文できます！'),
                alignment: 'center',
                fillColor: "#FCC03D",
                colSpan: 3,
                lineHeight: 1.3,
              }],
              [ {
                border: [false, false, false, false],
                text: '',
                fillColor: "#FCC03D", 
              },
                {
                  border: [false, false, false, false],
                  alignment: 'center', 
                  qr: this.shareUrl(),
                  fit: 75,
                },
                { 
                  border: [false, false, false, false],
                  text: '',
                  fillColor: "#FCC03D", 
                }
              ],
              [ { text: '',
                  border: [false, false, false, false],
                  fillColor: "#FCC03D",
                },
                { text: '',
                  border: [false, false, false, false],
                  fillColor: "#FCC03D"
                },
                  { text: '',
                    border: [false, false, false, false],
                    fillColor: "#FCC03D" 
                  },
              ]
            ]
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
                text: this.convChar(menu.itemName || "untitled"),
                fontSize: 10,
                margin: [0, 3]

              },
              {
                text:  "¥" + menu.price,
                fontSize: 8,
                color: "#555555",
              },
              {
                text:  this.convChar(menu.itemDescription.slice(0, 100)),
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
        styles: {
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
        },
        defaultStyle: {
          font: 'NotoSans',
          fontSize: 14,
        }
      };
      const pdfDoc = pdfMake.createPdf(docDefinition).download();
    },

    download2() {
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
        {
          text: this.shareUrl(), style: 'title',
        },
      ];
      const images = {
        coverImage: this.restaurantInfo.restCoverPhoto,
        logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
        menu: location.protocol + "//" + location.host + '/test.jpg', // TODO: Set default menu image
      };
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
