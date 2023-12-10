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
  },
  productionSourceMap: false,
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
    module: {
      rules: [
        {
          test: /\.md$/i,
          loader: "raw-loader",
        },
      ],
    },
  }
};
