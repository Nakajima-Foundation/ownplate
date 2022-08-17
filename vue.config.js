const path = require("path");
const vueSrc = "./src";
module.exports = {
  runtimeCompiler: true,
  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/index.html',
      filename: 'index.html',
    },
    ss: {
      entry: 'src/main.ts',
      template: 'public/top/ss.html',
      filename: 'ss.html',
    },
    mo: {
      entry: 'src/main.ts',
      template: 'public/top/mo.html',
      filename: 'mo.html',
    },
    motest: {
      entry: 'src/main.ts',
      template: 'public/top/motest.html',
      filename: 'motest.html',
    },
  },
  devServer: {
    port: 3000
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "./src/assets/scss/main.scss"'
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, vueSrc),
      },
      extensions: ['.js', '.vue', '.json'],
      fallback: { "crypto": false }
    },
  }
};
