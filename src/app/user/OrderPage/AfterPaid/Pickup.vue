<template>
  <div>
    <div v-if="showRequest">
      <div
        class="mt-2 text-center text-sm font-bold text-black/50"
      >
        {{ $t("order.timeRequested") }}
      </div>
      <div class="mt-1 text-center text-lg tracking-tight text-black">
        {{ timeRequested }}
      </div>
    </div>
    <div v-if="showEstimated">
      <div
        class="mt-2 text-center text-sm font-bold text-black/50"
      >
        {{ $t("order.timeToPickup") }}
      </div>
      <div class="mt-1 text-center text-lg tracking-tight text-black">
        {{ timeEstimated }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
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
  },
  setup(props) {
    const waiting = computed(() => {
      return props.orderInfo.status < order_status.cooking_completed;
    });
    const showRequest = computed(() => {
      return waiting.value && !props.shopInfo.isEC;
    });
    const showEstimated = computed(() => {
      return props.timeEstimated;
    });
    return {
      showRequest,
      showEstimated,
    };
  },
});
</script>
