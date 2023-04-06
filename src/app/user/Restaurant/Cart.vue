<template>
  <div class="fixed top-0 h-screen w-full bg-black bg-opacity-50 z-30">
    <div class="h-1/5 w-full" @click="closeCart"></div>
    <div class="fixed h-4/5 w-full overflow-x-scroll bg-white pb-32">
      <div class="mt-6 mb-4 flex justify-center font-bold text-black">
        {{ shopInfo.restaurantName }}
      </div>
      <div
        v-if="disabledPickupTime"
        class="mx-6 mb-3 text-xs font-bold text-red-700"
      >
        {{ $tc("mobileOrder.shopInfo.pickupNote", 1, { lastOrder }) }}
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
			
			<div v-if="promotion">
			  <div class="border-green-600 text-green-600 text-center font-bold mt-1 mx-6 sm:mx-auto max-w-xl items-center mb-3 rounded-lg bg-green-600 bg-opacity-10 p-2">
				  <div class="text-xs">
            <PromotionMessage1 :promotion="promotion" />
          </div>
				  <div class="text-lg -mb-1">
            <PromotionMessage2 :promotion="promotion" />
          </div>
			  </div>
			  <!--ToDo 割引適用までの金額を表示する -->
			  <div class="flex mx-6 sm:mx-auto max-w-xl justify-center font-bold text-sm">
				  <div>あと<span class="text-green-600">¥625</span>で¥300値引き</div>
			  </div>
			</div>

    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

import CartItem from "@/app/user/Restaurant/CartItem.vue";

import PromotionMessage1 from "@/app/user/Restaurant/PromotionMessage1.vue";
import PromotionMessage2 from "@/app/user/Restaurant/PromotionMessage2.vue";

export default defineComponent({
  emits: ["closeCart", "didOrderdChange"],
  components: {
    CartItem,
    PromotionMessage1,
    PromotionMessage2,
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
    promotion: {
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
