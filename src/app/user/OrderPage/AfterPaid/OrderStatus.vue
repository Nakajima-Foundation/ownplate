<template>
  <div class="text-center">
    <div class="mb-4">
      <div class="text-sm font-bold text-black/50">
        {{ $t("order.orderStatus") }}
      </div>
      <div
        class="mx-2 mt-2 rounded-lg p-4 text-2xl font-bold"
        :class="orderStatusKey"
      >
        {{
          $t(
            "order.status." +
              convOrderStateForTextFunc(orderStatusKey, orderInfo),
          )
        }}
      </div>
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
import { order_status } from "@/config/constant";
import { convOrderStateForText } from "@/utils/utils";

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
  setup(props) {
    const orderStatusKey = computed(() => {
      return Object.keys(order_status).reduce((result, key) => {
        return order_status[key] === props.orderInfo.status ? key : result;
      }, "unexpected");
    });
    const orderIsPlaced = computed(() => {
      return props.orderInfo.status === order_status.order_placed;
    });
    return {
      orderStatusKey,
      convOrderStateForTextFunc: convOrderStateForText,
      orderIsPlaced,
    };
  },
});
</script>
