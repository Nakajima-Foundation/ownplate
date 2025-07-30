<template>
  <div
    class="mx-2 mt-2 rounded-lg bg-black/5 px-1 pt-4 pb-4 text-center font-bold"
  >
    <div class="mb-1 text-center text-sm font-bold text-black/50">
      {{ $t("order.onlinePaymentStatus") }}
    </div>
    <StripeStatus :stripeState="orderInfo.payment.stripe">
      <div class="text-xl">
        {{ $t("order.status" + ".stripe_user_" + orderInfo.payment.stripe) }}
      </div>
      <div>
        {{ $t("order.status.stripe_user_message_" + orderInfo.payment.stripe) }}
      </div>
    </StripeStatus>
    <div v-if="isJustCancelPayment">
      {{ $t("order.status.stripe_user_message_just_payment_canceled") }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { order_status } from "@/config/constant";
import StripeStatus from "@/components/StripeStatus.vue";

export default defineComponent({
  props: {
    orderInfo: {
      type: Object,
      required: true,
    },
  },
  components: {
    StripeStatus,
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
