<template>
  <div class="mt-4 rounded-lg bg-white p-4 shadow">
    <!-- Details -->
    <div class="mt-2 text-xl font-bold text-black">
      {{ $t("order.receipt.receipt") }}
    </div>
    <div class="mt-2">
      <span @click="receipt()" class="cursor-pointer">{{
        $t(
          isLoadingReceipt
            ? "order.receipt.loading"
            : "order.receipt.getReceipt",
        )
      }}</span>
    </div>
    <div class="mt-2 text-xs font-bold">
      {{ $t("order.receipt.explain1") }}
    </div>
    <div class="text-xs font-bold">
      {{ $t("order.receipt.explain2") }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { stripeReceipt } from "@/lib/stripe/stripe";

import { useRestaurantId } from "@/utils/utils";
import { useRoute } from "vue-router";

export default defineComponent({
  setup() {
    const route = useRoute();
    const restaurantId = useRestaurantId();
    const isLoadingReceipt = ref(false);
    const receipt = async () => {
      if (isLoadingReceipt.value) {
        return;
      }
      isLoadingReceipt.value = true;
      try {
        const res = (await stripeReceipt({
          restaurantId: restaurantId.value,
          orderId: route.params.orderId,
        })) as any;
        if (res.data && res.data.receipt_url) {
          window.open(res.data.receipt_url);
        }
      } catch (e) {
        console.log("error");
      }
      isLoadingReceipt.value = false;
    };
    return {
      isLoadingReceipt,
      receipt,
    };
  },
});
</script>
