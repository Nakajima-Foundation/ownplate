import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const strict = false;

export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
  clock: new Date()
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
  day: (state) => {
    return state.clock && state.clock.getDay()
  },
  time: (state) => {
    return state.clock && state.clock.getTime()
  },
  /*
  formattedDate: (state, style) => {
    return state.clock && this.$d(state.clock, style || "long");
  }
  */
};

export const mutations = {
  setUser(state, user) {
    state.user = user;
  },
  updateClock(state) {
    state.clock = new Date();
  }
};

export const actions = {
};

//for User
export const store = new Vuex.Store({
});
