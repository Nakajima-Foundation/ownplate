import Vue from 'vue';
import App from "./layouts/default.vue";

import i18n from "@/plugins/vue-i18n";

import mixin from "@/plugins/utils";
import userPermission from "@/plugins/userPermission";

import router from '@/routes'
import store from '@/store/index.js';

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import './assets/css/tailwind.css'

Vue.use(Buefy)
console.log(router);

Vue.mixin(mixin);
Vue.mixin(userPermission);

console.log(mixin);
const app = new Vue({
  router,
  store,
  render: h => h(App),
  i18n,
}).$mount('#app')

