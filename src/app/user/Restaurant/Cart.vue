<template>
  <div class="w-full fixed h-screen top-0 bg-black bg-opacity-20">
    <div class="w-full h-1/2" @click="closeCart"></div>
    <div class="w-full h-1/2 bg-white fixed z-10 overflow-x-scroll">
      <div>
        {{ shopInfo.restaurantName }}
      </div>
      <div>
        <div v-for="(counters, itemId) in orders" :key="itemId">
          <div v-for="(counter, key) in counters" :key="`${itemId}-${key}`">
            {{ menuObj[itemId].itemName }}
            <img :src="image(menuObj[itemId])" class="w-12" />
            {{ counter }}

            <hr />
          </div>
        </div>
        メニュー ボタン
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  emits: ["closeCart"],
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
