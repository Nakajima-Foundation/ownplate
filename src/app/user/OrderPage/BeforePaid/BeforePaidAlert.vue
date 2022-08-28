<template>
  <div>
    <div class="bg-red-700 bg-opacity-10 rounded-lg p-4 text-center">
      <div class="text-base font-bold text-red-700">
        {{ $t("order.orderNotPlacedYet") }}
      </div>
    </div>
    <div
      class="bg-red-700 bg-opacity-10 rounded-lg p-4 text-center mt-4"
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
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orderInfo: {
      type: Object,
      required: true,
    },
  },
});
</script>
