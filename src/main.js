import Vue from 'vue';

import i18n from "@/plugins/vue-i18n";
import router from '@/routes';
import store from '@/store/index.js';


import App from "./layouts/default.vue";

import mixin from "@/plugins/utils";
import userPermission from "@/plugins/userPermission";

import "@/plugins/social.js";

// ~plugins/buefy
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

import './assets/css/tailwind.css';

// QR
// "~plugins/qrcode.js",
import VueQrcode from '@chenfengyuan/vue-qrcode';
Vue.component(VueQrcode.name, VueQrcode);

//  "~plugins/social.js",
import SocialSharing from "vue-social-sharing";
Vue.use(SocialSharing);

//  "~plugins/croppa.js",
import Croppa from "vue-croppa";
Vue.use(Croppa);

// "~plugins/clipboard2.js",
import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);


// "~plugins/sentry.js"
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

import { sentryDsn } from "@/config/project";

if (process.env.NODE_ENV !== "development") {
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [new VueIntegration({Vue, attachProps: true, logErrors: true})],
    });
  }
};



Vue.use(Buefy);
Vue.mixin(mixin);
Vue.mixin(userPermission);

const app = new Vue({
  router,
  store,
  render: h => h(App),
  i18n,
}).$mount('#app');
