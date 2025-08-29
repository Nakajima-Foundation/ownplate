<template>
  <div class="text-center">
    <div class="mb-4">
      <div class="text-sm font-bold text-black/50">
        {{ $t("order.orderStatus") }}
      </div>
      <OrderState
        :orderState="orderStatusKey"
        class="mx-2 mt-2 rounded-lg p-4 text-2xl font-bold"
      >
        {{
          $t(
            "order.status." +
              convOrderStateForTextFunc(orderStatusKey, orderInfo),
          )
        }}
      </OrderState>
    </div>
    <div>
      <div class="text-sm font-bold text-black/50">
        {{ $t("order.orderId") }}
      </div>
      <div class="mt-1">
        <div class="text-lg text-black">{{ orderName }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { order_status_keys } from "@/config/constant";
import { convOrderStateForText } from "@/utils/utils";
import OrderState from "@/components/OrderStatus.vue";

export default defineComponent({
  props: {
    orderInfo: {
      type: Object,
      required: true,
    },
    orderName: {
      type: String,
      required: true,
    },
  },
  components: {
    OrderState,
  },
  setup(props) {
    const orderStatusKey = computed(() => {
      return order_status_keys[props.orderInfo.status];
    });
    return {
      orderStatusKey,
      convOrderStateForTextFunc: convOrderStateForText,
    };
  },
});
</script>
