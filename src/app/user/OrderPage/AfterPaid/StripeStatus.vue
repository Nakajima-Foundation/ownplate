<template>
  <div
    class="mt-6 mx-2 bg-black bg-opacity-5 rounded-lg pt-4 pb-4 px-1 text-center font-bold"
  >
    <div class="mb-1 text-sm text-center font-bold text-black text-opacity-50">
      {{ $t("order.onlinePaymentStatus") }}
    </div>
    <div :class="'stripe_' + orderInfo.payment.stripe">
      <div class="text-xl">
        {{
          $t(
            "order.status" +
              (mode === "mo" ? ".mo" : "") +
              ".stripe_user_" +
              orderInfo.payment.stripe
          )
        }}
      </div>
      <div v-if="mode !== 'mo'">
        {{ $t("order.status.stripe_user_message_" + orderInfo.payment.stripe) }}
      </div>
    </div>
    <div v-if="isJustCancelPayment">
      {{ $t("order.status.stripe_user_message_just_payment_canceled") }}
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { order_status } from "@/config/constant";

export default defineComponent({
  props: {
    orderInfo: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const hasStripe = computed(() => {
      return props.orderInfo.payment && props.orderInfo.payment.stripe;
    });
    const isJustCancelPayment = computed(() => {
      return (
        hasStripe.value &&
        props.orderInfo.payment.stripe === "canceled" &&
        props.orderInfo.status !== order_status.order_canceled
      );
    });
    return {
      isJustCancelPayment,
      hasStripe,
    };
  },
});
</script>
