module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended",
    "plugin:prettier/recommended"
  ],
  // *.vue ファイルを lint にかけるために必要
  plugins: ["vue"],
  // ここにカスタムルールを追加します。
  rules: {
    "vue/html-indent": ["error", 2],
    "no-console": "off", //console.log();OK
    "no-unused-vars": "off", //使っていない変数あってもOK
    "vue/html-self-closing": "off", //imgタグのようにタグが１つで完結してもOK
    "vue/max-attributes-per-line": "off",

    // https://qiita.com/mysticatea/items/9da94240f29ea516ae87#%E3%82%BB%E3%83%9F%E3%82%B3%E3%83%AD%E3%83%B3%E3%82%92%E7%9C%81%E7%95%A5%E3%81%99%E3%82%8B%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB
    semi: ["error", "always"],
    "semi-spacing": ["error", { after: true, before: false }],
    "semi-style": ["error", "last"],
    "no-extra-semi": "error",
    "no-unexpected-multiline": "error",
    "no-unreachable": "error",

    "prettier/prettier": [
      "error",
      {
        htmlWhitespaceSensitivity: "ignore" //aタグの羅列などで変な風にならないように追記
      }
    ]
  }
};
