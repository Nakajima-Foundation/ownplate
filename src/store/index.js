import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const strict = false;

export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
  date: new Date(),
  carts: {} // for "Edit Order"
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
};

export const mutations = {
  setUser(state, user) {
    state.user = user;
  },
  updateDate(state) {
    state.date = new Date();
  },
  saveCart(state, payload) {
    console.log("saving cart", payload.id, payload.order);
    state.carts = {};
    state.carts[payload.id] = payload.order;
  }
};

export const actions = {
};

//for User
export const store = new Vuex.Store({
});
