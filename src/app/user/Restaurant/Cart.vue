<template>
  <div class="fixed top-0 h-screen w-full bg-black bg-opacity-50">
    <div class="h-1/5 w-full" @click="closeCart"></div>
    <div class="fixed z-10 h-4/5 w-full overflow-x-scroll bg-white pb-32">
      <div class="mt-6 mb-4 flex justify-center font-bold text-black">
        {{ shopInfo.restaurantName }}
      </div>
      <div
        v-if="disabledPickupTime"
        class="mx-6 mb-3 text-xs font-bold text-red-700"
      >
        {{ $t("mobileOrder.shopInfo.pickupNote", { lastOrder }, 1) }}
      </div>
      <div class="justify-items-auto grid grid-cols-1 lg:grid-cols-2">
        <template v-for="(counters, itemId) in orders">
          <div v-for="(counter, key) in counters" :key="`${itemId}-${key}`">
            <CartItem
              :item="menuObj[itemId]"
              :shopInfo="shopInfo"
              :quantity="counter"
              :selectedOptions="selectedOptions[itemId][key]"
              :price="prices[itemId][key]"
              @increase="increase(itemId, key)"
              @decrease="decrease(itemId, key)"
            />
            <hr />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import CartItem from "@/app/user/Restaurant/CartItem.vue";

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
    prices: {
      type: Object,
      required: true,
    },
    selectedOptions: {
      type: Object,
      required: true,
    },
    disabledPickupTime: {
      type: Boolean,
      required: true,
    },
    lastOrder: {
      type: String,
      required: false,
    },
  },
  setup(props, ctx) {
    const setQuantities = (itemId: string, key: number, diff: number) => {
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
    const increase = (itemId: string, key: number) => {
      setQuantities(itemId, key, 1);
    };
    const decrease = (itemId: string, key: number) => {
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
