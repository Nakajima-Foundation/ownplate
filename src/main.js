import { createApp } from "vue";
import { createI18n } from "vue-i18n";
// import Vue from "vue";
// import VueI18n from 'vue-i18n';

import Buefy from 'buefy';

import store from '@/store/index.js';
import routes from '@/routes'

import i18nData from "@/plugins/vue-i18n";

import mixins from "@/plugins/utils";
import userPermission from "@/plugins/userPermission";
  
require('@/assets/scss/main.scss');


import "./index.css";

import App from "./layouts/default.vue";

const i18n = createI18n(i18nData);

const app = createApp(App);
app.use(store);
app.use(routes);
app.use(i18n);
app.mixin(mixins);
app.mixin(userPermission);
// app.use(Buefy);
app.mount("#app");



