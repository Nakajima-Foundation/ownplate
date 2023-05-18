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
			
			<div v-if="promotions && promotions.length > 0"> 
			  <div class="border-green-600 text-green-600 text-center font-bold mt-1 mx-6 sm:mx-auto max-w-xl items-center mb-3 rounded-lg bg-green-600 bg-opacity-10 p-2">
				  <div class="text-xs">
            <PromotionMessage1 :promotion="promotions[0]" />
          </div>
          <div v-for="(promotion, k) in promotions" :key="k">
					  <div class="flex items-end justify-center mt-0.5">
					    <div class="text-sm">
						    <PromotionMessage4 :promotion="promotion" />
					    </div>
				      <div class="text-lg -mb-1">
                <PromotionMessage2 :promotion="promotion" />
              </div>
					  </div>
				  </div>
			  </div>
  	  </div>
		  <div v-if="possiblePromotions && possiblePromotions.length > 0" >
			  <div v-for="(p, k) in [possiblePromotions[0]]"  class="flex mx-6 sm:mx-auto max-w-xl justify-center font-bold text-sm" :key="p.id">
          <PromotionMessage3 :promotion="p" :totalPrice="totalPrice" />
			  </div>
			</div>

			<!--ToDo 1buy1対象商品がカート内ある時に注意書きを表示、毎週変更-->
			<div v-if="false">
				<div class="text-xs border-green-600 text-green-600 font-bold mt-1 mx-6 sm:mx-auto max-w-xl mb-3 rounded-lg bg-green-600 bg-opacity-10 py-2 px-4">
					{{ $t("mobileOrder.campaign.fixedMessageCart1") }}
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
import PromotionMessage3 from "@/app/user/Restaurant/PromotionMessage3.vue";
import PromotionMessage4 from "@/app/user/Restaurant/PromotionMessage4.vue";

export default defineComponent({
  emits: ["closeCart", "didOrderdChange"],
  components: {
    CartItem,
    PromotionMessage1,
    PromotionMessage2,
		PromotionMessage3,
		PromotionMessage4,
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
    disabledPickupTime: {
      type: Boolean,
      required: true,
    },
    lastOrder: {
      type: String,
      required: false,
    },
    totalPrice: {
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
