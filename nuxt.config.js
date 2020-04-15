import i18nEN from './lang/en.json';
import i18nES from './lang/es.json';
import i18nJA from './lang/ja.json';
require('dotenv').config();

const { STRIPE_API_KEY, STRIPE_CLIENT_ID, STRIPE_AUTH_REDIRECT_URI, OwnPlateKey } = process.env;
console.log("OwnPlateKey=", OwnPlateKey);

// This mechanism allows us to specify release specific configurations.
const releaseConfigs = {
  alpha: {
    hidePayment: true
  }
};

export default {
  mode: "spa",
  srcDir: "src",
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    script: [
      { src: "https://js.stripe.com/v3/" }
    ],
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
        href: "/favicon.ico"
      },
      {
        rel: "icon",
        sizes: '16x16',
        type: "image/x-icon",
        href: "/favicon-16x16.png"
      },
      {
        rel: "icon",
        sizes: '32x32',
        type: "image/x-icon",
        href: "/favicon-32x32.png"
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "icon",
        sizes: '192x192',
        type: "image/png",
        href: "/android-chrome-192x192.png"
      },
      {
        rel: "icon",
        sizes: '512x512',
        type: "image/png",
        href: "/android-chrome-512x512.png"
      },
      {
        rel: "stylesheet",
        href: "https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css"
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
    '~plugins/buefy.js',
    // { src: "~/plugins/localStorage.js", ssr: false },
    { src: "~/plugins/userPermission.js", ssr: false },
    { src: "~/plugins/utils.js", ssr: false },
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
    //"nuxt-buefy",
    '@nuxtjs/dotenv',
    "@nuxtjs/style-resources",
    "@nuxtjs/axios",
    'nuxt-i18n',
    ['nuxt-gmaps', {
      key: process.env.GAPIKey,
    }],
  ],
  env: {
    STRIPE_API_KEY,
    STRIPE_CLIENT_ID,
    STRIPE_AUTH_REDIRECT_URI,
    gapikey: process.env.GAPIKey,
    releaseConfig: (OwnPlateKey && releaseConfigs[OwnPlateKey]) || {}
  },
  i18n: {
    locales: ['en', 'es', 'ja'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages: {
        en: i18nEN,
        es: i18nES,
        ja: i18nJA,
      },
      numberFormats: {
        en: {
          currency: {
            style: 'currency',
            currency: 'USD'
          }
        },
        ja: {
          currency: {
            style: 'currency',
            currency: 'JPY'
          }
        }
      }
    }
  },
  styleResources: {
    scss: [
      "~/assets/scss/main.scss",
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
    extend(config, ctx) { },
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
