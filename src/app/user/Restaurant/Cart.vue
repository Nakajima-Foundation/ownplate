<template>
  <div class="fixed top-0 z-30 h-screen w-full bg-black/50">
    <div class="h-1/5 w-full" @click="closeCart"></div>
    <div class="fixed h-4/5 w-full overflow-x-scroll bg-white pb-32">
      <div class="mt-2 mb-4">
        <div class="flex justify-center font-bold text-black">
          {{ shopInfo.restaurantName }}
        </div>

        <!-- lunch or dinner -->
        <div class="flex justify-center" v-if="shopInfo.enableLunchDinner">
          <div class="text-base font-bold text-red-600">
            <span v-if="lunchOrDinner === 'lunch'">
              {{ $t("order.thisIsLunchOrder") }}
            </span>
            <span v-else>
              {{ $t("order.thisIsDinnerOrder") }}
            </span>
          </div>
        </div>
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
          </div>
        </template>
      </div>

      <div v-if="promotions && promotions.length > 0">
        <div
          class="mx-6 mt-1 mb-3 max-w-xl items-center rounded-lg border-green-600 bg-green-600/10 p-2 text-center font-bold text-green-600 sm:mx-auto"
        >
          <div class="text-xs">
            <PromotionMessage6 :promotion="promotions[0]" />
          </div>
          <div v-for="(promotion, k) in promotions" :key="k">
            <div class="mt-0.5 flex items-end justify-center">
              <div class="text-sm">
                <PromotionMessage4 :promotion="promotion" />
              </div>
              <div class="-mb-1 text-lg">
                <PromotionMessage2 :promotion="promotion" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="possiblePromotions && possiblePromotions.length > 0">
        <div
          v-for="(p, k) in [possiblePromotions[0]]"
          class="mx-6 flex max-w-xl justify-center text-sm font-bold sm:mx-auto"
          :key="k"
        >
          <PromotionMessage3 :promotion="p" :totalPrice="totalPrice" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import CartItem from "@/app/user/Restaurant/CartItem.vue";

import PromotionMessage2 from "@/app/user/Restaurant/PromotionMessage2.vue";
import PromotionMessage3 from "@/app/user/Restaurant/PromotionMessage3.vue";
import PromotionMessage4 from "@/app/user/Restaurant/PromotionMessage4.vue";
import PromotionMessage6 from "@/app/user/Restaurant/PromotionMessage6.vue";

export default defineComponent({
  emits: ["closeCart", "didOrderdChange"],
  components: {
    CartItem,
    PromotionMessage2,
    PromotionMessage3,
    PromotionMessage4,
    PromotionMessage6,
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
    promotions: {
      type: Array,
      required: false,
    },
    possiblePromotions: {
      type: Array,
      required: false,
    },
    selectedOptions: {
      type: Object,
      required: true,
    },
    totalPrice: {
      type: Object,
      required: true,
    },
    lunchOrDinner: {
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
