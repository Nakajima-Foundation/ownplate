import { createStore } from "vuex";

import { stripe_regions } from "@/config/constant";
import { User } from "firebase/auth";
import { OrderInfoData } from "@/models/orderInfo";
import moment from "moment";

export const strict = false;

interface Claims {
  admin: boolean;
  operator: boolean;
  parentUid?: string;
  liffId: string;
};

interface DialogAlertData {
  title: string;
  code: string;
  callback: () => void;
};
interface DialogErrorData {
  message: string,
  message2: string,
  code: string,
};
interface DialogTipsData {
  key: string,
};
interface Dialog {
  alert?: DialogAlertData;
  error?: DialogErrorData;
  tips?: DialogTipsData;
};

interface Server {
  region?: string;
};

interface Cart {
  id?: string;
  cart: any;
};

interface State {
  user: undefined | boolean | User

  claims: undefined | Claims;
  lang: undefined | string;
  date: Date;
  carts: {[key: string]: Cart | null };
  server: Server;
  orderEvent: number;
  orderObj: {[key: string]: OrderInfoData[] };
  soundEnable: boolean;
  soundOn: boolean;
  soundFile: string;
  isWindowActive: boolean;
  dialog: null | Dialog;
  isLoading: boolean;
  openTime: Date,
}
export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
  claims: undefined, // custom claims
  lang: undefined,
  date: new Date(),
  // date: new Date("2023-08-05T22:10:00+09:00"),
  carts: {}, // for "Edit Order"
  server: {}, // server configuration
  orderEvent: 0,
  orderObj: {},
  soundEnable: false, // after user touch/click event, this flag set true (for mobile browser)
  soundOn: false, // for restaurant admin config
  soundFile: "",
  isWindowActive: false, // active status of browser window
  dialog: null, // for DialogBox
  // dialog: {alert: {}, error: {}}, // for DialogBox
  isLoading: false, // for full-page loading animation
  openTime: new Date(),
});

export const getters = {
  uid: (state: State) => {
    return state.user && (state.user as User).uid;
  },
  uidAdmin: (state: State) => {
    return state.user && (state.user as User).email && (state.user as User).uid;
  },
  uidUser: (state: State) => {
    return state.user && (state.user as User).phoneNumber && (state.user as User).uid;
  },
  uidLiff: (state: State) => {
    return state.user && (state.claims as Claims).liffId && (state.user as User).uid;
  },
  liffId: (state: State) => {
    return state.user && state.claims?.liffId;
  },
  isAnonymous: (state: State) => {
    return state.user === undefined || state.user === null;
  },
  // TODO: remove
  stripeRegion: (state: State) => {
    return stripe_regions[state.server.region || "US"];
  },
  isSuperAdmin: (state: State) => {
    return state.claims?.admin;
  },
  isNotSuperAdmin: (state: State) => {
    return !state.claims?.admin;
  },
  isOperator: (state: State) => {
    return state.claims?.operator;
  },
  isNotOperator: (state: State) => {
    return !state.claims?.operator;
  },
  isAdmin: (state: State) => {
    return !!(state.user && (state.user as User).email && (state.user as User).uid);
  },
  isSubAccount: (state: State) => {
    return !!state.claims?.parentUid;
  },
  parentId: (state: State) => {
    return state.claims?.parentUid;
  },
};

export const mutations = {
  setActive(state: State, flag: boolean) {
    state.isWindowActive = flag;
  },
  setLoading(state: State, flag: boolean) {
    state.isLoading = flag;
  },
  setUser(state: State, user: User) {
    state.user = user;
  },
  updateDate(state: State) {
    state.date = new Date();
  },
  saveCart(state: State, payload: Cart) {
    console.log("saving cart", payload.id, payload.cart);
    // state.carts = {};
    state.carts[payload.id as string] = payload.cart;
  },
  resetCart(state: State, restaurantId: string) {
    console.log("reset cart", restaurantId);
    // state.carts = {};
    state.carts[restaurantId] = null;
  },
  setServerConfig(state: State, config: Server) {
    state.server = config;
    console.log("store:setServerConfig", state.server.region);
  },
  setLang(state: State, lang: string) {
    state.lang = lang;
  },
  setCustomClaims(state: State, claims: Claims) {
    // Note: we can't copy user using Object.assign here
    state.claims = claims;
  },
  pingOrderEvent(state: State) {
    state.orderEvent = state.orderEvent + 1;
  },
  setOrders(state: State, orders: OrderInfoData[]) {
    state.orderObj = orders.reduce((tmp: {[key: string]: OrderInfoData[] }, order: OrderInfoData) => {
      const day = moment(order.timePlaced.toDate()).format("YYYY-MM-DD");
      if (!tmp[day]) {
        tmp[day] = [];
      }
      tmp[day].push(order);
      return tmp;
    }, {});
  },
  soundEnable(state: State) {
    state.soundEnable = true;
  },
  setSoundOn(state: State, flag: boolean) {
    state.soundOn = flag;
  },
  setSoundFile(state: State, file: string) {
    state.soundFile = file;
  },
  resetDialog(state: State) {
    state.dialog = null;
  },
  setAlert(state: State, params: DialogAlertData) {
    state.dialog = { alert: params };
  },
  setErrorMessage(state: State, params: DialogErrorData) {
    state.dialog = { error: params };
  },
  setTips(state: State, params: DialogTipsData) {
    state.dialog = { tips: params };
  },
  resetOpenTime(state: State) {
    state.openTime = new Date();
  },
};

export const actions = {};

export default createStore({
  state,
  getters,
  actions,
  mutations,
});
