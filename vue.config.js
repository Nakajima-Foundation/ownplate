const path = require("path");
const vueSrc = "./src";
module.exports = {
  runtimeCompiler: true,
  css: {
    requireModuleExtension: true
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, vueSrc),
        "~": path.resolve(__dirname, vueSrc)
      },
      extensions: ['.js', '.vue', '.json']
    }
  }
};
