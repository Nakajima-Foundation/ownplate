import { ownPlateConfig } from "./src/config/project";
import { regionalSettings } from "./src/plugins/constant";
import { defaultHeader } from "./src/plugins/header";

require('dotenv').config();
import { customRoutes } from './src/routes';

const hostName = ownPlateConfig.hostName;

const setComponent = (route, resolve) => {
  const r = { ...route };
  r.component = resolve(__dirname, "src/app/" + route.component);
  return r;
};

export default {
  mode: "spa",
  srcDir: "src",
  router: {
    extendRoutes(routes, resolve) {
      customRoutes.map(route => {
        const r = setComponent(route, resolve);
        if (r.children) {
          r.children = r.children.map((child) => {
            return setComponent(child, resolve);
          });
        }
        routes.push(r);
      });
    }
  },
  /*
   ** Headers of the page
   */
  head: defaultHeader,
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
  build: {
    quiet: false
  },
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
    extend(config, ctx) {
      config.devtool = 'eval-source-map';
    },
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
