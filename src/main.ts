// core
import Vue from "vue";
import router from "@/lib/router";
import store from "@/lib/store/index";

// plugins
import mixin from "@/mixins/mixin";
import userPermission from "@/mixins/userPermissionMixin";
import i18n from "@/plugins/vue-i18n";

// library
import Buefy from "buefy";
import Croppa from "vue-croppa";
import SocialSharing from "vue-social-sharing";
import VueClipboard from "vue-clipboard2";
import VueMeta from "vue-meta";
import VueQrcode from "@chenfengyuan/vue-qrcode";

// sentry
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

import VueCompositionAPI from "@vue/composition-api";

// components
import App from "@/components/App.vue";
import GMap from "@/components/gmaps/GMap.vue";
import GMapInfoWindow from "@/components/gmaps/GMapInfoWindow.vue";
import GMapMarker from "@/components/gmaps/GMapMarker.vue";

// config
import { sentryDsn } from "@/config/project";
import { GAPIKey } from "@/config/project";

// css
// import "buefy/dist/buefy.css";
import "@/assets/css/tailwind.css";
// '@import "./src/assets/scss/main.scss"' in vue.config.js

// components
Vue.component(VueQrcode.name, VueQrcode);
Vue.component("GMap", GMap);
Vue.component("GMapInfoWindow", GMapInfoWindow);
Vue.component("GMapMarker", GMapMarker);

Vue.prototype.$GMaps = {
  apiKey: GAPIKey,
  loaded: false,
};

// mixin
Vue.mixin(mixin);
Vue.mixin(userPermission);

Vue.use(VueCompositionAPI);
Vue.use(SocialSharing);
Vue.use(Croppa);
Vue.use(VueClipboard);
Vue.use(VueMeta, {});
Vue.use(Buefy);

if (process.env.NODE_ENV !== "development") {
  if (sentryDsn) {
    Sentry.init({
      Vue,
      dsn: sentryDsn,
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
          tracingOrigins: ["localhost"],
        }),
      ],
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
  }
}

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
  i18n,
}).$mount("#app");
