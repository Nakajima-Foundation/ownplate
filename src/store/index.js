import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const strict = false;

export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
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
    return state.user !== undefined;
  }
};

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
