const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "op-teal": "#0097a7",
        "op-teal-disabled": "#7CC7D1",
        "ownplate-yellow": "#fbc02d",
      },
    },
    screens: {
      xs: "375px",
      ...defaultTheme.screens,
    },
  },
  variants: {},
};
