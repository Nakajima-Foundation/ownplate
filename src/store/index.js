import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

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
