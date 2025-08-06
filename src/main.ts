// core
import { createApp } from "vue";

import router from "@/lib/router";
import store from "@/lib/store";

// plugins
import i18n from "@/lib/vue-i18n";

// library
import VueSocialSharing from "vue-social-sharing";
import { createHead } from "@unhead/vue/client";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import Button from "@/components/form/button.vue";
import Modal from "@/components/Modal.vue";

// sentry
import * as Sentry from "@sentry/vue";

// components
import App from "@/components/App.vue";

// config
import { sentryDsn } from "@/config/project";

// css
import "@/assets/css/main.css";

const app = createApp(App);

// components
app.component(VueQrcode.name ?? "", VueQrcode);
app.component("t-button", Button);
app.component("t-modal", Modal);

app.use(VueSocialSharing);

const head = createHead();
app.use(head);

app.use(store);
app.use(router);
app.use(i18n);

if (import.meta.env.PROD) {
  if (sentryDsn) {
    Sentry.init({
      app,
      dsn: sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration({ router }),
        Sentry.replayIntegration(),
      ],
      tracePropagationTargets: ["localhost"],
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    });
  }
}

app.mount("#app");
