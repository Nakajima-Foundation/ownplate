import Vue from "vue";

// import App from '@/components/App';
// import App from "./components/App.vue";
import App from "./layouts/default.vue";

new Vue({
  //  router,
  //  i18n: i18n,
  //  store,
  render: h => h(App)
}).$mount("#app");
