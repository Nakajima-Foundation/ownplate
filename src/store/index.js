import Vue from "vue";
import Vuex from "vuex";
import { stripe_regions } from "~/plugins/constant.js";

Vue.use(Vuex);

export const strict = false;

export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
  claims: undefined, // custom claims
  lang: undefined,
  date: new Date(),
  carts: {}, // for "Edit Order"
  server: {}, // server configuration
  orderEvent: 0,
  soundEnable: false, // after user touch/click event, this flag set true (for mobile browser)
  soundOn: false, // for restaurant admin config
  soundFile: "",
  isWindowActive: false, // active status of browser window
  dialog: null // for DialogBox
});

export const getters = {
  uid: (state) => {
    return state.user && state.user.uid;
  },
  uidAdmin: (state) => {
    return state.user && state.user.email && state.user.uid;
  },
  uidUser: (state) => {
    return state.user && state.user.phoneNumber && state.user.uid;
  },
  userWasInitialized: (state) => {
    // Check if state.user has been initialized (as the result of notication from Firebase)
    return state.user !== undefined;
  },
  name: (state) => {
    return state.user && state.user.name || "";
  },
  stripeRegion: (state) => {
    return stripe_regions[state.server.region || "US"];
  },
  isSuperAdmin: (state) => {
    return state.claims?.admin;
  },
  isNotSuperAdmin: (state) => {
    return !state.claims?.admin;
  }
};

export const mutations = {
  setActive(state, flag) {
    state.isWindowActive = flag;
  },
  setUser(state, user) {
    state.user = user;
  },
  updateDate(state) {
    state.date = new Date();
  },
  saveCart(state, payload) {
    console.log("saving cart", payload.id, payload.cart);
    state.carts = {};
    state.carts[payload.id] = payload.cart;
  },
  setServerConfig(state, config) {
    state.server = config;
    console.log("store:setServerConfig", state.server.region);
  },
  setLang(state, lang) {
    state.lang = lang;
  },
  setCustomClaims(state, claims) {
    // Note: we can't copy user using Object.assign here
    state.claims = claims;
  },
  pingOrderEvent(state) {
    state.orderEvent = (state.orderEvent) + 1;
  },
  soundEnable(state) {
    state.soundEnable = true;
  },
  setSoundOn(state, flag) {
    state.soundOn = flag;
  },
  setSoundFile(state, file) {
    state.soundFile = file;
  },
  resetDialog(state) {
    state.dialog = null;
  },
  setAlert(state, params) {
    state.dialog = { alert: params };
  },
  setErrorMessage(state, params) {
    state.dialog = { error: params };
  }
};

export const actions = {
};

//for User
export const store = new Vuex.Store({
});
