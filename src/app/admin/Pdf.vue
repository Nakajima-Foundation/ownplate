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

      const docDefinition = {
        content: [
          { text: '木島食堂', style: 'title' },
          {
            columns: [
              {
                // % width
                width: '30%',
                stack: [
                  { text: 'お勧め' },
                  { image: 'menu', width: 150, },

                ]
              },
              {
                // % width
                width: '20%',
                stack: [
                  { ul: [
                    'Option 1',
                    'Option 2',
                    'Option 3',
                    { text: 'Price 100 yen', bold: true },
                  ]}
                ]
              },
              {
                // % width
                width: '30%',
                stack: [
                  { text: 'Menu name' },
                  { image: 'menu', width: 150, },

                ]
              },
              {
                // % width
                width: '20%',
                stack: [
                  { ul: [
                    'Option 1',
                    'Option 2',
                    'Option 3',
                    { text: 'Price 100 yen', bold: true },
                  ]}
                ]
              }
            ],
            // optional space between columns
            columnGap: 10
          },
          { svg: logosvg, width: 150 },

          'No styling here, this is a standard paragraph',
          { text: 'こんにちは。これはPDFのサンプルです。日本語が入力可能かどうか確認しています。これが表示できればとても助かります。', margin: [0, 10] },
          { qr: 'https://nodejs.keicode.com/' , fit: '50' },
          { text: 'これはマージンを指定しています。', margin: [0, 10]},
          { text: '複数のスタイルを指定しています。', style: ['h1', 'style2'] },
          {
            // to treat a paragraph as a bulleted list, set an array of items under the ul key
            ul: [
              'Item 1',
              'Item 2',
              'Item 3',
              { text: 'Item 4', bold: true },
            ]
          },
          {
            layout: 'lightHorizontalLines', // optional
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: [ '*', 'auto', 100, '*' ],

              body: [
                [ 'First', 'Second', 'Third', 'The last one' ],
                [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
                [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
              ]
            }
          },
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
