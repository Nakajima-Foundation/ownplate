import { createApp } from "vue";
import { createI18n } from "vue-i18n";
// import Vue from "vue";
// import VueI18n from 'vue-i18n';

// import Buefy from 'buefy/src/index';
// import 'buefy/dist/buefy.css';

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
//app.use(Buefy);

app.mixin(mixins);
app.mixin(userPermission);

// app.use(Buefy);
/*
b-button
b-checkbox
b-datepicker
b-field
b-input
b-loading
b-modal
b-notification
b-radio
b-select
b-sidebar
*/
// app.component(Icon.name, Icon) 
app.component(Button.name, Button);
app.component(Input.name, Input);
app.component(Sidebar.name, Sidebar);
app.component(Loading.name, Loading);
app.component(Modal.name, Modal);

app.mount("#app");



