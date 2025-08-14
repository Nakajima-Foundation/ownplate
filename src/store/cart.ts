import { ref } from "vue";
import { defineStore } from "pinia";

import { MenuData } from "@/models/menu";

import {
  OrderDataType,
  CartItemsType,
  CartOptionType,
} from "@/models/cartType";

type Cart = {
  orders: OrderDataType;
  options: CartOptionType;
  cartItems: CartItemsType;
  menuCache: MenuData[];
  howtoreceive: string;
  lunchOrDinner: string;
};

export const useCartStore = defineStore("cartStore", () => {
  const carts = ref<{ [key: string]: Cart | null }>({});

  const saveCart = (payload: { id: string; cart: Cart }) => {
    console.log("saving cart", payload.id, payload.cart);
    const __carts = { ...carts.value };
    __carts[payload.id] = payload.cart;
    carts.value = __carts;
  };
  const resetCart = (restaurantId: string) => {
    console.log("reset cart", restaurantId);
    const { [restaurantId]: __, ...__carts } = { ...carts.value };
    carts.value = __carts;
  };

  return {
    carts,
    saveCart,
    resetCart,
  };
});
