import { createStore } from "vuex";
import moment from "moment";
import { User } from "firebase/auth";

import { OrderInfoData } from "@/models/orderInfo";
import { MenuData } from "@/models/menu";

import {
  OrderDataType,
  CartItemsType,
  CartOptionType,
} from "@/models/cartType";

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
  carts: { [key: string]: Cart | null };
  orderObj: { [key: string]: OrderInfoData[] };
  dialog: null | Dialog;
  isLoading: boolean;
}
export const state = () => ({
  user: undefined, // undefined:not authorized, null:no user
  claims: undefined, // custom claims
  carts: {}, // for "Edit Order"
  orderObj: {},
  dialog: null, // for DialogBox
  // dialog: {alert: {}, error: {}}, // for DialogBox
  isLoading: false, // for full-page loading animation
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
  setLoading(_state: State, flag: boolean) {
    _state.isLoading = flag;
  },
  setUser(_state: State, user: User) {
    _state.user = user;
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
  setCustomClaims(_state: State, claims: Claims) {
    // Note: we can't copy user using Object.assign here
    _state.claims = claims;
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
};

export const actions = {};

export default createStore({
  state,
  getters,
  actions,
  mutations,
});
