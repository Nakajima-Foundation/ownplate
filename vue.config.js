const path = require("path");
const vueSrc = "./src";
module.exports = {
  runtimeCompiler: true,
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
        "~": path.resolve(__dirname, vueSrc)
      },
      extensions: ['.js', '.vue', '.json'],
      fallback: { "crypto": false }
    },
  }
};
