<template>
  <div>
    {{ item.itemName }}
    <img :src="image" class="w-12" />
    num:{{ quantity }} <span @click="increase()">+</span>/<span
      @click="decrease()"
      >-</span
    >

    <div v-for="(option, k) in options" :key="k">
      <div v-if="option.length === 1">
        <div v-if="selectedOptions[k]">Option:{{ option[0] }}</div>
      </div>
      <div v-else-if="option.length > 1">
        Option:{{ option[selectedOptions[k]] }}
      </div>
    </div>
    <hr />
    <br />
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { itemOptionCheckbox2options } from "@/utils/utils";
import * as analyticsUtil from "@/lib/firebase/analytics";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    selectedOptions: {
      type: Array,
      required: true,
    },
  },
  emits: ["increase", "decrease"],
  setup(props, ctx) {
    const restaurantId = ctx.root.$route.params.restaurantId;
    const image = computed(() => {
      return (
        (props.item?.images?.item?.resizedImages || {})["600"] ||
        props.item.itemPhoto
      );
    });
    const options = computed(() => {
      return itemOptionCheckbox2options(props.item.itemOptionCheckbox);
    });
    const increase = () => {
      ctx.emit("increase");
      analyticsUtil.sendAddToCart(props.item, props.shopInfo, restaurantId, 1);
    };
    const decrease = () => {
      ctx.emit("decrease");
      analyticsUtil.sendRemoveFromCart(
        props.item,
        props.shopInfo,
        restaurantId,
        1
      );
    };
    return {
      image,
      options,
      increase,
      decrease,
    };
  },
});
</script>
