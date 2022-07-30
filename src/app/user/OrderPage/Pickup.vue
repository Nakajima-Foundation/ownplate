<template>
  <div>
    <div v-if="showRequest">
      <div
        class="mt-6 text-sm text-center font-bold text-black text-opacity-50"
      >
        {{ $t("order.timeRequested") }}
      </div>
      <div class="mt-1 text-lg text-center text-black tracking-tight">
        {{ timeRequested }}
      </div>
    </div>
    <div v-if="showEstimated">
      <div
        class="mt-6 text-sm text-center font-bold text-black text-opacity-50"
      >
        {{ $t("order.timeToPickup") }}
      </div>
      <div class="mt-1 text-lg text-center text-black tracking-tight">
        {{ timeEstimated }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import { order_status } from "@/config/constant";

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
    timeEstimated: {
      type: String,
      required: false,
    },
    timeRequested: {
      type: String,
      required: false,
    },
    mode: {
      type: String,
      required: true,
    },
    paid: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const waiting = computed(() => {
      return props.orderInfo.status < order_status.cooking_completed;
    });
    const showRequest = computed(() => {
      if (props.mode === "mo") {
        return props.paid;
      }
      return waiting.value && !props.shopInfo.isEC;
    });
    const showEstimated = computed(() => {
      if (props.mode === "mo") {
        return !props.paid;
      }
      return props.timeEstimated;
    });
    return {
      showRequest,
      showEstimated,
    };
  },
});
</script>
