<template>
  <div class="card block">
    <div class="card-content" @click="$emit('selected', order)">
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          <h3>{{ orderName }}</h3>
        </div>
        <div class="level-right">
          <order-status :order="order" />
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ totalCount }} items
        </div>
        <div class="level-right" v-if="phoneNumber">
          {{ nationalPhoneNumber }}
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ $n(order.total / 100, 'currency') }}
        </div>
        <div class="level-right">
          {{ timestamp || "0:00pm"}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderStatus from "~/components/OrderStatus";
import { nameOfOrder } from "~/plugins/strings.js";
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";

export default {
  components: {
    OrderStatus,
  },
  props: {
    order: {
      type: Object,
      required: true
    },
  },
  computed: {
    timestamp() {
      return this.order.timePaid.toLocaleTimeString();
    },
    phoneNumber() {
      return this.order.phoneNumber && parsePhoneNumber(this.order.phoneNumber);
    },
    nationalPhoneNumber() {
      return formatNational(this.phoneNumber);
    },
    orderName() {
      return nameOfOrder(this.order);
    },
    totalCount() {
      if (this.order.order) {
        return Object.keys(this.order.order).reduce((count, id)=>{ 
          return count + this.order.order[id]; 
        }, 0);
      }
      return 0;
    }
  },
  mounted() {
  }
}
</script>