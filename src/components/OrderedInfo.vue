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
        <div class="level-right">
          {{ order.phoneNumber || "(222)222-2222" }}
        </div>
      </div>
      <div class="level is-mobile" style="margin:0">
        <div class="level-left">
          {{ $n(order.total / 100, 'currency') }}
        </div>
        <div class="level-right">
          {{ orderTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderStatus from "~/components/OrderStatus";
import { nameOfOrder } from "~/plugins/strings.js";

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
    orderTime() {
      if (this.order.timePaid) {
        return this.order.timePaid.toDate().toLocaleTimeString();
      }
      return "";
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