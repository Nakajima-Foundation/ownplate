<template>
  <div class="card block">

    <template v-for="orderItem in orderItems">
      <order-item
        :item="orderItem.item"
        :count="orderItem.count"
        :specialRequest="orderItem.specialRequest"
        :key="orderItem.key"
        ></order-item>
    </template>

    <hr class="hr-black" />

    <div v-if="verified">
      <div class="card-content subtotal">
        <div class="media">
          <div class="media-content">
            <h4 class="bold">
              {{$t('order.subtotal')}}
            </h4>
          </div>
          <div class="media-right" style="margin-top:-0.4rem;">
            <p class="p-bold">
              {{$n(orderInfo.sub_total, 'currency')}}
            </p>
          </div>
        </div>
      </div>

      <div class="card-content tax">
        <div class="media">
          <div class="media-content">
            <h4 class="bold">
              {{$t('order.salesTax')}}
            </h4>
          </div>
          <div class="media-right" style="margin-top:-0.4rem;">
            <p class="p-bold">
              {{$n(orderInfo.tax, 'currency')}}
            </p>
          </div>
        </div>
      </div>

      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <h3 class="bold">
              {{$t('order.total')}}
            </h3>
          </div>
          <div class="media-right">
            <p class="p-big bold" style="color:#CB4B4B">
              {{$n(orderInfo.total, 'currency')}}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { order_status } from "~/plugins/constant.js";
import OrderItem from "~/components/OrderItem";

export default {
  name: "Order",

  props: {
    orderItems: {
      type: Array,
      required: true
    },
    orderInfo: {
      type: Object,
      required: true
    },
  },
  components: {
    OrderItem
  },
  computed: {
    verified() {
      return this.orderInfo.status >= order_status.validation_ok;
    }
  },
  methods: {}
};
</script>
<style type="scss" scped>
.tax {
  margin-top: -1.6rem !important;
}
</style>
