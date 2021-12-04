import { createApp } from "vue";
import { createI18n } from "vue-i18n";
// import Vue from "vue";
// import VueI18n from 'vue-i18n';

// import Buefy from 'buefy/src/index';
// import 'buefy/dist/buefy.css';
import VueGoogleMaps from '@fawmi/vue-google-maps';
import VueQrcode from "@chenfengyuan/vue-qrcode";

import store from '@/store/index.js';
import routes from '@/routes';

import i18nData from "@/plugins/vue-i18n";

import mixins from "@/plugins/utils";
import userPermission from "@/plugins/userPermission";

// for buefy compatibility
import Button from "@/components/buefy/components/button/Button.vue";                   
import Checkbox from "@/components/buefy/components/checkbox/Checkbox.vue";               
import CheckboxButton from "@/components/buefy/components/checkbox/CheckboxButton.vue";         
import Datepicker from "@/components/buefy/components/datepicker/Datepicker.vue";           
import Field from "@/components/buefy/components/field/Field.vue";                     
import Input from "@/components/buefy/components/input/Input.vue";
import Loading from "@/components/buefy/components/loading/Loading.vue";
import Modal from "@/components/buefy/components/modal/Modal.vue";
import Notification from "@/components/buefy/components/notification/Notification.vue";
import Radio from "@/components/buefy/components/radio/Radio.vue";
import Select from "@/components/buefy/components/select/Select.vue";
import Sidebar from "@/components/buefy/components/sidebar/Sidebar.vue";

require('@/assets/scss/main.scss');


import "./index.css";

import App from "./layouts/default.vue";

const i18n = createI18n(i18nData);

const app = createApp(App);
app.use(store);
app.use(routes);
app.use(i18n);

app.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GAPIKey,
  },
});
app.mixin(mixins);
app.mixin(userPermission);

app.component(Button.name, Button);
app.component(Checkbox.name, Checkbox);
app.component(CheckboxButton.name, CheckboxButton);
app.component(Datepicker.name, Datepicker);
app.component(Field.name, Field);
app.component(Input.name, Input);
app.component(Loading.name, Loading);
app.component(Modal.name, Modal);
app.component(Notification.name, Notification);
app.component(Radio.name, Radio);
app.component(Select.name, Select);
app.component(Sidebar.name, Sidebar);

if (VueQrcode.name) {
  app.component(VueQrcode.name, VueQrcode);
}

app.mount("#app");



