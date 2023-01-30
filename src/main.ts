// core
import { createApp } from "vue";

import Vue from "vue";
import router from "@/lib/router";
import store from "@/lib/store/index";

// plugins
import mixin from "@/mixins/mixin";
import i18n from "@/plugins/vue-i18n";

// library
import Oruga from "@oruga-ui/oruga-next";
import { bulmaConfig } from "@oruga-ui/theme-bulma";

import Croppa from "vue-croppa";
import VueSocialSharing from "vue-social-sharing";
//import VueMeta from "vue-meta";
import { createMetaManager, plugin as metaPlugin } from 'vue-meta'

// import VueQrcode from "@chenfengyuan/vue-qrcode";
import VueQrcode from '@chenfengyuan/vue-qrcode';

// sentry
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

// import VueCompositionAPI from "vue";

// components
import App from "@/components/App.vue";
import VueGoogleMaps from '@fawmi/vue-google-maps'

// config
import { sentryDsn } from "@/config/project";
import { GAPIKey } from "@/config/project";

// css
import "@/assets/css/tailwind.css";
import "@/assets/css/main.css";

const app = createApp(App);

// components
app.component(VueQrcode.name, VueQrcode);

app.use(VueGoogleMaps, {
  load: {
    key: GAPIKey,
    // language: 'de',
  },
})

// mixin
app.mixin(mixin);

// Vue.use(VueCompositionAPI);
app.use(VueSocialSharing);
app.use(Croppa);
// app.use(VueMeta, {});
app.use(Oruga, bulmaConfig);

const metaManager = createMetaManager()
app.use(metaManager)
app.use(metaPlugin)

app.use(store);
app.use(router);
app.use(i18n);

if (process.env.NODE_ENV !== "development") {
  if (sentryDsn) {
    Sentry.init({
      app,
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


app.mount("#app");

/*
const app = new Vue({
  router,
  store,
  render: (h) => h(App),
  i18n,
}).$mount("#app");
*/
