import { createStore } from "vuex";

import { stripe_regions } from "@/config/constant";
import { User } from "firebase/auth";
import { OrderInfoData } from "@/models/orderInfo";
import { MenuData } from "@/models/menu";

import {
  OrderDataType,
  CartItemsType,
  CartOptionType,
} from "@/models/cartType";

import moment from "moment";

export const strict = false;

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
interface DialogErrorData {
  message: string;
  message2: string;
  code: string;
}
interface DialogTipsData {
  key: string;
}
interface Dialog {
  alert?: DialogAlertData;
  error?: DialogErrorData;
  tips?: DialogTipsData;
}

interface Server {
  region?: string;
}

type Cart = {
  orders: OrderDataType;
  options: CartOptionType;
  cartItems: CartItemsType;
  menuCache: MenuData[];
  howtoreceive: string;
  lunchOrDinner: string;
};

interface State {
  user: undefined | boolean | User;

  claims: undefined | Claims;
  lang: undefined | string;
  date: Date;
  carts: { [key: string]: Cart | null };
  server: Server;
  orderEvent: number;
  orderObj: { [key: string]: OrderInfoData[] };
  soundEnable: boolean;
  soundOn: boolean;
  soundFile: string;
  isWindowActive: boolean;
  dialog: null | Dialog;
  isLoading: boolean;
  openTime: Date;
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
  uid: (_state: State) => {
    return _state.user && (_state.user as User).uid;
  },
  uidAdmin: (_state: State) => {
    return _state.user && (_state.user as User).email && (_state.user as User).uid;
  },
  uidUser: (_state: State) => {
    return (
      _state.user && (_state.user as User).phoneNumber && (_state.user as User).uid
    );
  },
  uidLiff: (_state: State) => {
    return (
      _state.user && (_state.claims as Claims).liffId && (_state.user as User).uid
    );
  },
  liffId: (_state: State) => {
    return _state.user && _state.claims?.liffId;
  },
  isAnonymous: (_state: State) => {
    return _state.user === undefined || _state.user === null;
  },
  // TODO: remove
  stripeRegion: (_state: State) => {
    return stripe_regions[_state.server.region || "US"];
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
  setActive(_state: State, flag: boolean) {
    _state.isWindowActive = flag;
  },
  setLoading(_state: State, flag: boolean) {
    _state.isLoading = flag;
  },
  setUser(_state: State, user: User) {
    _state.user = user;
  },
  updateDate(_state: State) {
    _state.date = new Date();
  },
  saveCart(_state: State, payload: { id: string; cart: Cart }) {
    console.log("saving cart", payload.id, payload.cart);
    // _state.carts = {};
    _state.carts[payload.id as string] = payload.cart;
  },
  resetCart(_state: State, restaurantId: string) {
    console.log("reset cart", restaurantId);
    // _state.carts = {};
    _state.carts[restaurantId] = null;
  },
  setServerConfig(_state: State, config: Server) {
    _state.server = config;
    console.log("store:setServerConfig", _state.server.region);
  },
  setLang(_state: State, lang: string) {
    _state.lang = lang;
  },
  setCustomClaims(_state: State, claims: Claims) {
    // Note: we can't copy user using Object.assign here
    _state.claims = claims;
  },
  pingOrderEvent(_state: State) {
    _state.orderEvent = _state.orderEvent + 1;
  },
  setOrders(_state: State, orders: OrderInfoData[]) {
    _state.orderObj = orders.reduce(
      (tmp: { [key: string]: OrderInfoData[] }, order: OrderInfoData) => {
        const day = moment(order.timePlaced.toDate()).format("YYYY-MM-DD");
        if (!tmp[day]) {
          tmp[day] = [];
        }
        tmp[day].push(order);
        return tmp;
      },
      {},
    );
  },
  soundEnable(_state: State) {
    _state.soundEnable = true;
  },
  setSoundOn(_state: State, flag: boolean) {
    _state.soundOn = flag;
  },
  setSoundFile(_state: State, file: string) {
    _state.soundFile = file;
  },
  resetDialog(_state: State) {
    _state.dialog = null;
  },
  setAlert(_state: State, params: DialogAlertData) {
    _state.dialog = { alert: params };
  },
  setErrorMessage(_state: State, params: DialogErrorData) {
    _state.dialog = { error: params };
  },
  setTips(_state: State, params: DialogTipsData) {
    _state.dialog = { tips: params };
  },
  resetOpenTime(_state: State) {
    _state.openTime = new Date();
  },
};

export const actions = {};

export default createStore({
  state,
  getters,
  actions,
  mutations,
});
