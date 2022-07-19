<template>
  <div class="w-full fixed h-screen top-0 bg-black bg-opacity-50">
    <div class="w-full h-1/3" @click="closeCart"></div>
    <div class="w-full h-2/3 bg-white fixed z-10 overflow-x-scroll pb-24">
      <div class="flex justify-center mt-6 font-bold text-black">
        {{ shopInfo.restaurantName }}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 lg:mx-6">
        <div v-for="(counters, itemId) in orders" :key="itemId">
          <div v-for="(counter, key) in counters" :key="`${itemId}-${key}`">
            <CartItem
              :item="menuObj[itemId]"
              :shopInfo="shopInfo"
              :quantity="counter"
              :selectedOptions="selectedOptions[itemId][key]"
              @increase="increase(itemId, key)"
              @decrease="decrease(itemId, key)"
            />
            <hr />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

import CartItem from "./CartItem.vue";

export default defineComponent({
  emits: ["closeCart", "didOrderdChange"],
  components: {
    CartItem,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orders: {
      type: Object,
      required: true,
    },
    menuObj: {
      type: Object,
      required: true,
    },
    selectedOptions: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const setQuantities = (itemId, key, diff) => {
      const newQuantities = [...props.orders[itemId]];
      const newOP = [...props.selectedOptions[itemId]];
      newQuantities[key] = newQuantities[key] + diff;
      if (newQuantities[key] === 0 && newQuantities.length > 1) {
        newQuantities.splice(key, 1);
        newOP.splice(key, 1);
      }
      ctx.emit("didOrderdChange", {
        itemId: itemId,
        quantities: newQuantities,
        optionValues: newOP,
      });
    };
    const increase = (itemId, key) => {
      setQuantities(itemId, key, 1);
    };
    const decrease = (itemId, key) => {
      setQuantities(itemId, key, -1);
    };
    return {
      closeCart: () => {
        ctx.emit("closeCart");
      },
      increase,
      decrease,
    };
  },
});
</script>
