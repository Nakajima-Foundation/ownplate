import i18nEN from './lang/en.json';
import i18nES from './lang/es.json';
import i18nJA from './lang/ja.json';

export default {
  mode: "spa",
  srcDir: "src",
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/assets/favicon.ico"
      },
      {
        rel: "stylesheet",
        href: "https://use.fontawesome.com/releases/v5.2.0/css/all.css"
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    // { src: "~/plugins/localStorage.js", ssr: false },
    { src: "~/plugins/userPermission.js", ssr: false },
    // "~/plugins/mock.js"
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    "nuxt-buefy",
    "@nuxtjs/style-resources",
    "@nuxtjs/axios",
    'nuxt-i18n',
  ],
  i18n: {
    locales: ['en', 'es', 'ja'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages: {
        en: i18nEN,
        es: i18nES,
        ja: i18nJA,
      }
    }
  },
  styleResources: {
    scss: [
      "~/assets/scss/_mixins.scss",
      "~/assets/scss/_variables.scss"
      // "~/assets/web-grid-master/dist/web-grid.css"
      // "~/assets/iota/iota.scss"
    ]
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
    babel: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: { ie: 11, uglify: true },
            useBuiltIns: "usage"
          }
        ]
      ],
      plugins: [
        "@babel/transform-runtime",
        "@babel/plugin-syntax-dynamic-import"
      ]
    },
    vendor: ["babel-polyfill"]
  }
};
