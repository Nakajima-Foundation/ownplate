<template>
  <div>
    <div class="flex justify-between gap-3 mt-6 mx-6">
      <div>
        <div class="font-bold text-black">
          {{ item.itemName }}
        </div>
        <div class="mt-1" v-for="(option, k) in options" :key="k">
          <div v-if="option.length === 1">
            <div v-if="selectedOptions[k]">
              <span class="text-sm text-brack"
                >{{ $t("sitemenu.options") }}:
              </span>
              <span class="text-sm font-bold text-gray-500">
                {{ option[0] }}</span
              >
            </div>
          </div>
          <div v-else-if="option.length > 1">
            <span class="text-sm text-brack">
              {{ $t("sitemenu.options") }}:</span
            >
            <span class="text-sm font-bold text-gray-500">
              {{ option[selectedOptions[k]] }}</span
            >
          </div>
        </div>
      </div>
      <div
        class="w-12 h-12 lg:w-24 lg:h-24 bg-white border-gray-100 rounded-lg shadow-none"
      >
        <img
          :src="image"
          class="w-12 h-12 lg:w-24 lg:h-24 rounded object-cover"
        />
      </div>
    </div>
    <div class="flex justify-between mt-2 mx-6">
      <!-- ToDo: Price-->
      <div class="mt-2 text-sm text-black">
        <Price
          :shopInfo="{ inclusiveTax: true }"
          :menu="{ price: subTotalWithTax }"
          />
      </div>
      <div class="flex justify-end">
        <span
          @click="decrease()"
          class="inline-flex justify-center items-center h-9 w-16 rounded-full bg-red-700 bg-opacity-10"
        >
          <i class="material-icons text-lg text-red-700">remove</i>
        </span>
        <div
          class="mx-5 mt-0.5 flex-1 text-center font-bold text-xl text-op-teal"
        >
          {{ quantity }}
        </div>
        <span
          @click="increase()"
          class="inline-flex justify-center items-center h-9 w-16 rounded-full bg-op-teal bg-opacity-10"
        >
          <i class="material-icons text-lg text-op-teal">add</i>
        </span>
      </div>
    </div>
    <hr class="border border-solid border-black border-opacity-5 mx-6 mt-4" />
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { itemOptionCheckbox2options, getPriceWithTax } from "@/utils/utils";
import * as analyticsUtil from "@/lib/firebase/analytics";

import Price from "@/components/Price";

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
    price: {
      type: Number,
      required: true,
    },
    selectedOptions: {
      type: Array,
      required: true,
    },
  },
  components: {
    Price,
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
    const subTotalWithTax = computed(() => {
      return getPriceWithTax(props.price, props.item, props.shopInfo);
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
      subTotalWithTax,
      increase,
      decrease,
    };
  },
});
</script>
