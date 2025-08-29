<template>
  <div>
    <div class="mx-6 mt-1 flex justify-between">
      <div class="w-4/5">
        <div class="font-bold text-black">
          {{ item.itemName }}
        </div>
        <div v-if="isSoldOutToday" class="text-xs text-red-600">
          {{ $t("sitemenu.soldOutToday") }}
        </div>
        <div class="mt-1" v-for="(option, k) in options" :key="k">
          <div v-if="option.length === 1">
            <div v-if="selectedOptions[k]">
              <span class="text-sm text-black"
                >{{ $t("sitemenu.options") }}:
              </span>
              <span class="text-sm font-bold text-gray-500">
                {{ option[0] }}</span
              >
            </div>
          </div>
          <div v-else-if="option.length > 1">
            <span class="text-sm text-black">
              {{ $t("sitemenu.options") }}:</span
            >
            <span class="text-sm font-bold text-gray-500">
              {{ option[selectedOptions[k]] }}</span
            >
          </div>
        </div>
      </div>
      <div
        class="h-16 w-16 rounded-lg border-gray-100 bg-white shadow-none lg:h-24 lg:w-24"
      >
        <img
          :src="image"
          class="h-full w-full rounded-sm object-cover lg:h-full lg:w-full"
          @error="smallImageErrorHandler"
        />
      </div>
    </div>
    <div class="mx-6 mt-2 flex justify-between">
      <div class="mt-2 text-black">
        <Price
          :shopInfo="{ inclusiveTax: true }"
          :menu="{ price: subTotalWithTax }"
        />
      </div>
      <div class="flex justify-end">
        <span
          @click="decrease()"
          class="inline-flex h-9 w-16 cursor-pointer items-center justify-center rounded-full bg-red-700/10"
        >
          <i class="material-icons text-lg text-red-700">remove</i>
        </span>
        <div
          class="text-op-teal mx-5 mt-0.5 flex-1 text-center text-xl font-bold"
        >
          {{ quantity }}
        </div>
        <span
          @click="increase()"
          class="bg-op-teal/10 inline-flex h-9 w-16 cursor-pointer items-center justify-center rounded-full"
        >
          <i class="material-icons text-op-teal text-lg">add</i>
        </span>
      </div>
    </div>
    <hr class="mx-6 my-3 border border-solid border-black/5" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import {
  itemOptionCheckbox2options,
  getPriceWithTax,
  smallImageErrorHandler,
  useRestaurantId,
} from "@/utils/utils";
import * as analyticsUtil from "@/lib/firebase/analytics";

import Price from "@/components/Price.vue";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { MenuData } from "@/models/menu";
import { AnalyticsMenuData } from "@/lib/firebase/analytics";
import { useGeneralStore } from "../../../store";

import moment from "moment-timezone";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    item: {
      type: Object as PropType<MenuData>,
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
    const generalStore = useGeneralStore();

    const restaurantId = useRestaurantId();
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
      analyticsUtil.sendAddToCart(
        props.item as AnalyticsMenuData,
        props.shopInfo,
        restaurantId.value,
        1,
      );
    };
    const decrease = () => {
      ctx.emit("decrease");
      analyticsUtil.sendRemoveFromCart(
        props.item as AnalyticsMenuData,
        props.shopInfo,
        restaurantId.value,
        1,
      );
    };
    const isSoldOutToday = computed(() => {
      const today = moment(generalStore.date).format("YYYY-MM-DD");
      return props.item.soldOutToday === today;
    });
    return {
      image,
      options,
      subTotalWithTax,
      increase,
      decrease,
      smallImageErrorHandler,
      isSoldOutToday,
    };
  },
});
</script>
