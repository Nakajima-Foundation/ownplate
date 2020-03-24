import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
//for User
import user from "./user";
import admin from "./admin";

Vue.use(Vuex);

export const strict = false;

export const state = () => ({
  totalOrderCount: 0
});

export const getters = () => ({
  getTotalOrderCount: state => state.totalOrderCount
});

export const mutations = {
  setTotalOrderCount(state, payload) {
    state.totalOrderCount = payload.totalOrderCount;
  },
  increment(state) {
    state.totalOrderCount++;
  }
};

export const actions = {
  increment(context) {
    context.commit("increment");
  }
};

//for User
export const store = new Vuex.Store({
  modules: {
    user,
    admin,
  }
});
