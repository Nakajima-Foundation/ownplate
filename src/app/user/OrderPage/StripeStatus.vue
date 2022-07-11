<template>
  <div
    class="mt-6 mx-6 bg-black bg-opacity-5 rounded-lg p-4 text-center"
    >
    <div class="font-bold">
      {{ $t("order.onlinePaymentStatus") }}
    </div>
    <div :class="'stripe_' + orderInfo.payment.stripe">
      {{ $t("order.status.stripe_user_" + orderInfo.payment.stripe)
      }}<br />
      {{
      $t(
      "order.status.stripe_user_message_" + orderInfo.payment.stripe
      )
      }}<br />
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
      hasStripe
    }
  },

});
</script>
