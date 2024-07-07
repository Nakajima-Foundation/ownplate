import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from 'eslint-plugin-vue';
import vueParser from "vue-eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    files: ["src/**/*.{vue,ts}"],
  },
  {
    ignores: ['dist', 'build', 'node_modules', 'functions', 'holidays', 'patch', 'tailwind.config.js', "batchCustomer", "postcss.config.js", "batch", "vue.config.js", "vue.config.js", "zipcodeJP", "vite.config.js", "eslint.config.mjs"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    rules: {
      //indent: ["error", 2],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^__",
          varsIgnorePattern: "^__",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // warn
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "no-unreachable": "error",
      "vue/no-unused-vars": "error",
      "vue/no-reserved-component-names": "error",
      "vue/multi-word-component-names": "off",
      "vue/v-bind-style": "error",
      "vue/no-unused-properties": "error",
      "vue/require-default-prop": "off",
      "vue/require-prop-types": "error",
      "vue/no-mutating-props": "off", // warn
      "vue/no-unused-properties": "off", // warn
      "no-undef": "off", // warn

      "no-irregular-whitespace": "off", 
      "@typescript-eslint/ban-ts-comment": "warn", 
      "vue/attribute-hyphenation": "off",
      "vue/v-on-event-hyphenation": "off",
      "accessor-pairs": "error",
      
      // "no-type-assertion/no-type-assertion": "warn",
      "no-unreachable": "error",
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
      
    },
  },
  eslintConfigPrettier,
];
