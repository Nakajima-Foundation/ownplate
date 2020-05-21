import i18nEN from './lang/en.json';
import i18nES from './lang/es.json';
import i18nJA from './lang/ja.json';
import { ownPlateConfig } from "./src/config/project";
import { regionalSettings } from "./src/plugins/constant";

require('dotenv').config();
import { customRoutes } from './src/routes';

const hostName = regionalSettings[ownPlateConfig.region].hostName;

export default {
  mode: "spa",
  srcDir: "src",
  router: {
    extendRoutes(routes, resolve) {
      customRoutes.map(route => {
        const r = { ...route };
        r.component = resolve(__dirname, "src/app/" + route.component);
        routes.push(r);
      });
    }
  },
  /*
   ** Headers of the page
   */
  head: {
    title: ownPlateConfig.siteName || process.env.npm_package_name,
    script: [
      { src: "https://js.stripe.com/v3/" }
    ],
    meta: [
      { hid: 'og:image', property: 'og:image', content: 'https://' + hostName + '/OGP-Facebook.png' },
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: ownPlateConfig.siteDescription || process.env.npm_package_description || ""
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
      },
			{
	rel: "stylesheet",
    href: "https://fonts.googleapis.com/icon?family=Material+Icons",
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
    '~plugins/social.js',
    '~plugins/croppa.js',
    '~plugins/clipboard2.js',
    '~plugins/qrcode.js',
    // { src: "~/plugins/localStorage.js", ssr: false },
    { src: "~/plugins/userPermission.js", ssr: false },
    { src: "~/plugins/utils.js", ssr: false },
    // "~/plugins/mock.js"
    '~plugins/vue-i18n.js',
    '~plugins/sentry.js'
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
    ['nuxt-gmaps', {
      key: process.env.GAPIKey,
    }],
  ],
  env: {
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_CLIENT_ID: process.env.STRIPE_CLIENT_ID,
    gapikey: process.env.GAPIKey,
    CIRCLE_SHA1: process.env.CIRCLE_SHA1,
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
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-proposal-optional-chaining"
      ]
    },
    vendor: ["babel-polyfill"]
  }
};
