<template>
  <div>
    <button @click="download">Download menu example</button><br/>
    <button @click="download2">Download logo</button><br/>

  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import logosvg from "!raw-loader!../../static/pr/50mm-QR-Blank.svg";

import _ from 'lodash';

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
    const menus = (await restaurantRef.collection("menus").where("deletedFlag", "==", false).get()).docs.map((a) => a.data());
    console.log(this.restaurantInfo);
    console.log(this.menus);

    this.menus = _.chunk(menus, 2);
    console.log(this.menus);
  },
  methods: {
    download() {
      pdfMake.vfs = pdfFonts.pdfMake.vfs;

      const host = location.protocol + "//" + location.host + "/fonts/";
      pdfMake.fonts = {
        GenShin: {
          normal: host + 'GenShinGothic-Normal-Sub.ttf',
          bold: host + 'GenShinGothic-Normal-Sub.ttf',
          italics: host + 'GenShinGothic-Normal-Sub.ttf',
          bolditalics: host + 'GenShinGothic-Normal-Sub.ttf'
        }
      };

      const content = [
        { text: this.restaurantInfo.restaurantName, style: 'title' },
      ];
      const images = {
        logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
        menu: location.protocol + "//" + location.host + '/test.jpg', // TODO: Set default menu image
      };
      // TODO: fix Japanese kansuuji encoding issue

      const menu2colum = (menu, image, key1, key2) => {
        return [
          {
            width: '30%',
            stack: [
              { text: menu.itemName || "untitled" },
              { image: image ? "menu_" + key1 + "_" + key2 : 'menu', width: 150, },

            ]
          },
          {
            width: '20%',
            stack: [
              { text:  menu.itemDescription },
              { text:  menu.price + "円", bold: true },
            ]
          }
        ];
      };
      this.menus.forEach((menu, key) => {
        const columns = [];
        menu.forEach((m, key2) => {
          const image1 = (m?.images?.item?.resizedImages||{})["600"] || menu[key2].itemPhoto;

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

      content.push({ svg: logosvg, width: 150 });
      content.push({ text: 'こんにちは。これはPDFのサンプルです。日本語が入力可能かどうか確認しています。これが表示できればとても助かります。', margin: [0, 10] });
      content.push({ qr: 'https://nodejs.keicode.com/' , fit: '50' });

      const docDefinition = {
        content,
        images,
        styles: {
          title: {
            font: 'GenShin',
            fontSize: 24,
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
      pdfMake.vfs = pdfFonts.pdfMake.vfs;

      const host = location.protocol + "//" + location.host + "/fonts/";
      pdfMake.fonts = {
        GenShin: {
          normal: host + 'GenShinGothic-Normal-Sub.ttf',
          bold: host + 'GenShinGothic-Normal-Sub.ttf',
          italics: host + 'GenShinGothic-Normal-Sub.ttf',
          bolditalics: host + 'GenShinGothic-Normal-Sub.ttf'
        }
      };

      const content = [
        { text: this.restaurantInfo.restaurantName, style: 'title' },
        { text: this.shareUrl(), style: 'title' },
      ];
      const images = {
        logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
        menu: location.protocol + "//" + location.host + '/test.jpg', // TODO: Set default menu image
      };
      // TODO: fix Japanese kansuuji encoding issue

      content.push({ svg: logosvg,
                     width: 251,
                     absolutePosition: {
                       x: 60,
                       y: 130
                     }
                   });
      content.push({
        qr: this.shareUrl(),
        fit: 75,
        absolutePosition: {
          x: 148,
          y: 266
        }
      });

      const docDefinition = {
        content,
        images,
        styles: {
          title: {
            font: 'GenShin',
            fontSize: 24,
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
      console.log(docDefinition);
      const pdfDoc = pdfMake.createPdf(docDefinition).download();
    }

  }
}
</script>
