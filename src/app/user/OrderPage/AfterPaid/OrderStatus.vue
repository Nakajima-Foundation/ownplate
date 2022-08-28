<template>
  <div class="text-center">
    <div>
      <div class="text-sm font-bold text-black text-opacity-50">
        {{ $t("order.orderStatus") }}
      </div>
      <div
        class="rounded-lg p-4 mt-2 mb-6 mx-2 text-2xl font-bold"
        :class="orderStatusKey"
      >
        {{
          $t(
            "order.status." +
              convOrderStateForTextFunc(orderStatusKey, orderInfo)
          )
        }}
      </div>
    </div>
    <div>
      <div class="text-sm font-bold text-black text-opacity-50">
        {{ $t("order.orderId") }}
      </div>
      <div class="mt-1">
        <div class="text-lg text-black">{{ orderName }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
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
    return {
      orderStatusKey,
      convOrderStateForTextFunc: convOrderStateForText,
    };
  },
});
</script>
