const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {},
    screens: {
      xs: "375px",
      ...defaultTheme.screens,
    },
  },
  variants: {},
  plugins: [],
};
