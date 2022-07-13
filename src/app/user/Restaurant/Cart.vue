<template>
  <div class="w-full fixed h-screen top-0 bg-black bg-opacity-20">
    <div class="w-full h-1/2" @click="closeCart"></div>
    <div class="w-full h-1/2 bg-white fixed z-10 overflow-x-scroll pb-24">
      <div>
        {{ shopInfo.restaurantName }}
      </div>
      <div>
        <div v-for="(counters, itemId) in orders" :key="itemId">
          <div v-for="(counter, key) in counters" :key="`${itemId}-${key}`">
            <CartItem
              :item="menuObj[itemId]"
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
      console.log(itemId, newQuantities);
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
