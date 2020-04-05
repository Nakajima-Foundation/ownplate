import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const strict = false;

export const state = () => ({
  user: null
});

export const getters = () => ({
});

export const mutations = {
  setUser(state, user) {
    state.user = user;
  }
};

export const actions = {
};

//for User
export const store = new Vuex.Store({
});
