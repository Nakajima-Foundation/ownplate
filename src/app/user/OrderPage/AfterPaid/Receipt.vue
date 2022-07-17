<template>
  <div class="bg-white rounded-lg shadow p-4 mt-4">
    <!-- Details -->
    <div class="mt-2 text-xl font-bold text-black">
      {{ $t("order.receipt.receipt") }}
    </div>
    <div class="mt-2">
      <span @click="receipt()" class="cursor-pointer">{{
        $t(
          isLoadingReceipt
            ? "order.receipt.loading"
            : "order.receipt.getReceipt"
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

<script>
import { defineComponent, ref } from "@vue/composition-api";

import { stripeReceipt } from "@/lib/stripe/stripe";

export default defineComponent({
  setup(props, ctx) {
    const isLoadingReceipt = ref(false);
    const receipt = async () => {
      if (isLoadingReceipt.value) {
        return;
      }
      isLoadingReceipt.value = true;
      try {
        const res = await stripeReceipt({
          restaurantId: ctx.root.restaurantId(),
          orderId: ctx.root.$route.params.orderId,
        });
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
