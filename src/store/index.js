import Vue from "vue";
import Vuex from "vuex";
import { stripe_regions } from "~/plugins/constant.js"

Vue.use(Vuex);

export const strict = false;

export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
  lang: undefined,
  date: new Date(),
  carts: {}, // for "Edit Order"
  server: {} // server configuration
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
    return state.user && state.user.credentials && state.user.credentials.admin
  },
  isNotSuperAdmin: (state) => {
    return state.user && state.user.credentials && !state.user.credentials.admin
  }
};

export const mutations = {
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
  setCredentials(state, credentials) {
    state.user = Object.assign({}, state.user, { credentials });
    console.log("store:setCredentials", credentials.admin);
  }
};

export const actions = {
};

//for User
export const store = new Vuex.Store({
});
