<template>
  <div>
    <div class="op-status" :class="statusKey">{{ $t("order.status." + statusKey) }}</div>
  </div>
</template>

<script>
import { order_status } from "~/plugins/constant.js";

export default {
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  computed: {
    statusKey() {
      return Object.keys(order_status).reduce((result, key) => {
        if (order_status[key] == this.order.status) {
          return key;
        }
        return result;
      }, "unexpected");
    }
  }
};
</script>
