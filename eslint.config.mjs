import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";
import vueI18n from "@intlify/eslint-plugin-vue-i18n"


export default [
  {
    files: ["src/**/*.{vue,ts}"],
  },
  {
    ignores: ["dist", "build", "node_modules", "functions", "holidays", "patch", "tailwind.config.js", "batchCustomer", "postcss.config.js", "batch", "vue.config.js", "vue.config.js", "zipcodeJP", "vite.config.js", "eslint.config.mjs", "postcss.config.cjs"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  ...vueI18n.configs.recommended,
  {
    plugins: {
      "typescript-eslint": tseslint.plugin,
    },
    settings: {
      'vue-i18n': {
        localeDir: ".i18n-cache/*.{json}",
        messageSyntaxVersion: "^11.0.0",
      },
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        google: "readonly",
        Stripe: "readonly",
      },
    },
    rules: {
      //indent: ["error", 2],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^__",
          varsIgnorePattern: "^__",
          caughtErrorsIgnorePattern: "^__",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // warn
      "@typescript-eslint/no-unused-expressions": "off",
      // "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "no-unreachable": "error",
      "vue/no-unused-vars": "error",
      "vue/no-reserved-component-names": "error",
      "vue/multi-word-component-names": "off",
      "vue/v-bind-style": "error",
      "vue/require-default-prop": "off",
      "vue/require-prop-types": "error",
      "vue/no-mutating-props": "off", // warn
      "vue/no-undef-properties": "error",
      "no-undef": "error",

      "no-irregular-whitespace": "off", 
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-shadow": "error",
      "vue/attribute-hyphenation": "off",
      "vue/v-on-event-hyphenation": "off",
      "accessor-pairs": "error",
      "no-duplicate-imports": "error",
      
      // "no-type-assertion/no-type-assertion": "warn",
      "no-unreachable": "error",
      "no-console": "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

      "vue/require-explicit-emits": "error",
      "vue/no-unused-properties": "error",
      "no-eq-null": "error",
      "no-use-before-define": "error",
      "no-empty-function": "error",
      "no-negated-condition": "error",
      "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
      "no-useless-return": "error",
      "array-callback-return": "error",
      "require-await": "error",
      "eqeqeq": "error",
      "init-declarations": "error",
      "@intlify/vue-i18n/no-raw-text": [
        "off",
        {
          ignorePattern: "[\\-():<>/.]", 
        },
      ],
    },
  },
  eslintConfigPrettier,
];
