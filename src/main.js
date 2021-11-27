import Vue from "vue";
import VueI18n from 'vue-i18n';

import store from '@/store/index.js';
import routes from '@/routes'

import i18nData from "@/plugins/vue-i18n";
import mixins from "@/plugins/utils";

// import App from '@/components/App';
// import App from "./components/App.vue";
import App from "./layouts/default.vue";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'ja',
  messages: i18nData,
});

Vue.mixin(mixins);


new Vue({
  router: routes,
  i18n: i18n,
  store,
  render: h => h(App)
}).$mount("#app");
