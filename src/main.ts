// core
import { createApp } from "vue";

import router from "@/lib/router";
import store from "@/lib/store";

// plugins
import i18n from "@/lib/vue-i18n";

// library
import Oruga from "@oruga-ui/oruga-next";
import { bulmaConfig } from "@oruga-ui/theme-bulma";
import VueSocialSharing from "vue-social-sharing";
// import { createMetaManager, plugin as metaPlugin } from "vue-meta";
import VueQrcode from "@chenfengyuan/vue-qrcode";
import VueGoogleMaps from "@fawmi/vue-google-maps";

// sentry
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

// components
import App from "@/components/App.vue";

// config
import { sentryDsn, GAPIKey } from "@/config/project";

// css
import "@/assets/css/tailwind.css";
import "@/assets/css/main.css";
import "@oruga-ui/theme-bulma/dist/bulma.css";

const app = createApp(App as any); // TODO fix

// components
app.component(VueQrcode.name ?? "", VueQrcode);

app.use(VueGoogleMaps, {
  load: {
    key: GAPIKey,
  },
});

app.use(VueSocialSharing);
app.use(Oruga, bulmaConfig);

//const metaManager = createMetaManager();
//app.use(metaManager);
//app.use(metaPlugin);

app.use(store);
app.use(router);
app.use(i18n);

if (import.meta.env.PROD) {
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
