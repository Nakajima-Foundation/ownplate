import Vue from "vue";
import VueI18n from 'vue-i18n';

import Buefy from 'buefy';

import store from '@/store/index.js';
import routes from '@/routes'

import i18nData from "@/plugins/vue-i18n";

import mixins from "@/plugins/utils";
import userPermission from "@/plugins/userPermission";
  
require('@/assets/scss/main.scss');


import "./index.css";

import App from "./layouts/default.vue";

Vue.use(VueI18n);

const i18n = new VueI18n(i18nData);

Vue.mixin(mixins);
Vue.mixin(userPermission);
Vue.use(Buefy);

new Vue({
  router: routes,
  i18n: i18n,
  store,
  render: h => h(App)
}).$mount("#app");
