import { createStore } from "vuex";
import { User } from "firebase/auth";

interface Claims {
  admin: boolean;
  operator: boolean;
  parentUid?: string;
  liffId: string;
}

interface DialogAlertData {
  title: string;
  code: string;
  callback: () => void;
}
interface Dialog {
  alert?: DialogAlertData;
}

interface State {
  user: undefined | boolean | User;

  claims: undefined | Claims;
  dialog: null | Dialog;
}
export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
  claims: undefined, // custom claims
  dialog: null, // for DialogBox
});

export const getters = {
  uid: (_state: State) => {
    return _state.user && (_state.user as User).uid;
  },
  uidAdmin: (_state: State) => {
    return (
      _state.user && (_state.user as User).email && (_state.user as User).uid
    );
  },
  uidUser: (_state: State) => {
    return (
      _state.user &&
      (_state.user as User).phoneNumber &&
      (_state.user as User).uid
    );
  },
  uidLiff: (_state: State) => {
    return (
      _state.user &&
      (_state.claims as Claims).liffId &&
      (_state.user as User).uid
    );
  },
  liffId: (_state: State) => {
    return _state.user && _state.claims?.liffId;
  },
  isAnonymous: (_state: State) => {
    return _state.user === undefined || _state.user === null;
  },
  isSuperAdmin: (_state: State) => {
    return _state.claims?.admin;
  },
  isNotSuperAdmin: (_state: State) => {
    return !_state.claims?.admin;
  },
  isOperator: (_state: State) => {
    return _state.claims?.operator;
  },
  isNotOperator: (_state: State) => {
    return !_state.claims?.operator;
  },
  isAdmin: (_state: State) => {
    return !!(
      _state.user &&
      (_state.user as User).email &&
      (_state.user as User).uid
    );
  },
  isSubAccount: (_state: State) => {
    return !!_state.claims?.parentUid;
  },
  parentId: (_state: State) => {
    return _state.claims?.parentUid;
  },
};

export const mutations = {
  setUser(_state: State, user: User) {
    _state.user = user;
  },
  setCustomClaims(_state: State, claims: Claims) {
    // Note: we can't copy user using Object.assign here
    _state.claims = claims;
  },
  resetDialog(_state: State) {
    _state.dialog = null;
  },
  setAlert(_state: State, params: DialogAlertData) {
    _state.dialog = { alert: params };
  },
};

export const actions = {};

export default createStore({
  state,
  getters,
  actions,
  mutations,
});
