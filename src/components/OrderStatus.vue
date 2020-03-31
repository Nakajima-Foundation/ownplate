<template>
  <b-button 
    variant="outline-primary"
    rounded>
    {{ $t("order.status." + statusKey) }}
  </b-button>
</template>

<script>
import { order_status } from "~/plugins/constant.js";

export default {
  props: {
    order: {
      type: Object,
      required: true
    },
  },
  computed: {
    statusKey() {
      console.log(order_status);
      return Object.keys(order_status).reduce((result, key)=>{
        if (order_status[key] == this.order.status) {
          return key;
        }
        return result;
      }, "unexpected");
    }
  }
}
</script>