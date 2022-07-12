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
  emits: ["closeCart"],
  components: {
    CartItem
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
    const image = (item) => {
      return (item?.images?.item?.resizedImages || {})["600"] || item.itemPhoto;
    };

    return {
      closeCart: () => {
        ctx.emit("closeCart");
      },
      image,
    };
  },
});
</script>
