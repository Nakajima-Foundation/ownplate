// core
import Vue from "vue";
import router from "@/router";
import store from "@/store/index";

// plugins
import mixin from "@/plugins/mixin";
import userPermission from "@/plugins/userPermission";
import i18n from "@/plugins/vue-i18n";

// library
import Buefy from "buefy";
import Croppa from "vue-croppa";
import SocialSharing from "vue-social-sharing";
import VueClipboard from "vue-clipboard2";
import VueMeta from "vue-meta";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import * as Sentry from "@sentry/browser";
import { Vue as VueIntegration } from "@sentry/integrations";

// components
import App from "@/components/App.vue";
import GMap from "@/components/gmaps/GMap.vue";
import GMapInfoWindow from "@/components/gmaps/GMapInfoWindow.vue";
import GMapMarker from "@/components/gmaps/GMapMarker.vue";

// config
import { sentryDsn } from "@/config/project";

// css
import "buefy/dist/buefy.css";
import "@/assets/css/tailwind.css";
// '@import "./src/assets/scss/main.scss"' in vue.config.js

// components
Vue.component(VueQrcode.name, VueQrcode);
Vue.component("GMap", GMap);
Vue.component("GMapInfoWindow", GMapInfoWindow);
Vue.component("GMapMarker", GMapMarker);
Vue.prototype.$GMaps = {
  apiKey: process.env.VUE_APP_GAPIKey,
  loaded: false,
};

// mixin
Vue.mixin(mixin);
Vue.mixin(userPermission);

Vue.use(SocialSharing);
Vue.use(Croppa);
Vue.use(VueClipboard);
Vue.use(VueMeta, {});
Vue.use(Buefy);

if (process.env.NODE_ENV !== "development") {
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        new VueIntegration({ Vue, attachProps: true, logErrors: true }),
      ],
    });
  }
}

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
  i18n,
}).$mount("#app");
