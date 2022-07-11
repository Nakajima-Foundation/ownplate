<template>
  <div class="mt-6 text-center">
    <div class="inline-flex space-x-4">
      <div>
        <div class="text-sm font-bold text-black text-opacity-60">
          {{ $t("order.orderStatus") }}
        </div>
        <div
          class="inline-block px-4 py-1 rounded-full mt-2"
          :class="orderStatusKey"
          >
          <div class="text-sm font-bold">
            {{
            $t(
            "order.status." +
            convOrderStateForTextFunc(orderStatusKey, orderInfo)
            )
            }}
          </div>
        </div>
      </div>
      <div>
        <div class="text-sm font-bold text-black text-opacity-60">
          {{ $t("order.orderId") }}
        </div>
        <div class="mt-1">
          <div class="text-2xl">{{ orderName }}</div>
        </div>
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
  }

});
</script>
