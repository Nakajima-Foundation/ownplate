<template>
  <div>
    <button @click="download">Download example</button>

  </div>
</template>

<script>
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import logosvg from "!raw-loader!../../static/Omochikaeri-Logo-Stack-YellowBlack.svg";

export default {
  name: "pdf",

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
      console.log(logosvg);
      const docDefinition = {
        content: [
          { text: 'This is a header', style: 'title' },
          'No styling here, this is a standard paragraph',
          { text: 'こんにちは。これはPDFのサンプルです。日本語が入力可能かどうか確認しています。これが表示できればとても助かります。', margin: [0, 10] },
          { qr: 'https://nodejs.keicode.com/' , fit: '50' },
          { text: 'これはマージンを指定しています。', margin: [0, 10]},
          { text: '複数のスタイルを指定しています。', style: ['h1', 'style2'] },
          { image: 'menu', width: 150, },
          { svg: logosvg, width: 150 }
        ],
        images: {
          logo: location.protocol + "//" + location.host + '/OwnPlate-Logo-Stack-YellowBlack.png',
          menu: location.protocol + "//" + location.host + '/test.jpg',
        },
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
    }
  }
}
</script>
