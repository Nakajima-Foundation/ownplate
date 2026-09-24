<template>
  <div>
    <!-- not yet -->
    <div class="rounded-lg bg-red-700/10 p-4 text-center">
      <div class="text-base font-bold text-red-700">
        {{ $t(message) }}
      </div>
    </div>
    <!-- delivery or takeout -->
    <div
      class="mt-4 rounded-lg bg-red-700/10 p-4 text-center"
      v-if="shopInfo.enableDelivery"
    >
      <div class="text-base font-bold text-red-700">
        <span v-if="orderInfo.isDelivery">
          {{ $t("order.thisIsDeliveryOrder") }}
        </span>
        <span v-else>
          {{ $t("order.thisIsTakeoutOrder") }}
        </span>
      </div>
    </div>

    <!-- lunch or dinner -->
    <div
      class="mt-4 rounded-lg bg-red-700/10 p-4 text-center"
      v-if="shopInfo.enableLunchDinner"
    >
      <div class="text-base font-bold text-red-700">
        <span v-if="orderInfo.lunchOrDinner === 'lunch'">
          {{ $t("order.thisIsLunchOrder") }}
        </span>
        <span v-else>
          {{ $t("order.thisIsDinnerOrder") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { RestaurantInfoData } from "@/models/RestaurantInfo";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    orderInfo: {
      type: Object,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
});
</script>
