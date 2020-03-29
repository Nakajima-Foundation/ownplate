import { db, auth } from "~/plugins/firebase.js";

export default {
  state() {
    return {
      user: null,
      loading: true,
      error: null
    }
  },
  mutations: {
    SET_USER(state, payload) {
      state.user = payload;
    },
    SET_LOADING(state, payload) {
      state.loading = payload;
    },
    SET_ERROR(state, payload) {
      state.error = payload;
    },
    CLEAR_ERROR(state) {
      state.error = null;
    }
  },
  actions: {
    signUserUp({ commit }, payload) {
      commit("SET_LOADING", true);
        auth
        .createUserWithEmailAndPassword(payload.email, payload.password)
        .then(user => {
          commit("SET_LOADING", false);
          commit("CLEAR_ERROR");
          const newUser = {
            id: user.user.uid
          };
          commit("SET_USER", newUser);
        })
        .catch(error => {
          commit("SET_LOADING", false);
          commit("SET_ERROR", error);
          console.log(error);
        });
    },
    signUserIn({ commit }, payload) {
      commit("SET_LOADING", true);
        auth
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(user => {
          commit("SET_LOADING", false);
          commit("CLEAR_ERROR");
          const newUser = {
            id: user.user.uid
          };
          commit("SET_USER", newUser);
        })
        .catch(error => {
          commit("SET_LOADING", false);
          commit("SET_ERROR", error);
          console.log(error);
        });
    },
    autoSignIn({ commit }, payload) {
      commit("SET_USER", { id: payload.uid });
    },
    clearError({ commit }) {
      commit("CLEAR_ERROR");
    }
  },
  getters: {
    user(state) {
      return state.user;
    },
    loading(state) {
      return state.loading;
    },
    error(state) {
      return state.error;
    }
  }
};
