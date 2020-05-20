<template>
  <div class="bg-surface r-8 d-low m-t-8 p-b-24">
    <!-- Order Items -->
    <template v-for="orderItem in orderItems">
      <order-item
        :item="orderItem.item"
        :count="orderItem.count"
        :specialRequest="orderItem.specialRequest"
        :key="orderItem.key"
      ></order-item>
    </template>

    <hr class="devider m-t-16 m-b-0 m-l-16 m-r-16" />

    <!-- Totals -->
    <div v-if="verified">
      <!-- Sub Total -->
      <div class="p-t-16 p-l-16 p-r-16">
        <div class="cols">
          <div class="flex-1">
            <div class="t-body1 c-text-black-high">{{$t('order.subtotal')}}</div>
          </div>
          <div class="align-righ">
            <span class="t-body1 c-text-black-high">{{$n(orderInfo.sub_total, 'currency')}}</span>
          </div>
        </div>
      </div>

      <!-- Tax -->
      <div class="p-t-8 p-l-16 p-r-16">
        <div class="cols">
          <div class="flex-1">
            <div class="t-body1 c-text-black-high">{{$t('order.salesTax')}}</div>
          </div>
          <div class="align-righ">
            <span class="t-body1 c-text-black-high">{{$n(orderInfo.tax, 'currency')}}</span>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div v-if="regionTip.choices.length > 0" class="p-t-8 p-l-16 p-r-16">
        <div class="cols">
          <div class="flex-1">
            <div class="t-body1 c-text-black-high">{{$t('order.total')}}</div>
          </div>
          <div class="align-righ">
            <span class="t-body1 c-text-black-high">{{$n(orderInfo.total, 'currency')}}</span>
          </div>
        </div>
      </div>

      <hr class="devider m-t-16 m-b-0 m-l-16 m-r-16" />

      <!-- Tip -->
      <div v-if="regionTip.choices.length > 0" class="p-t-16 p-l-16 p-r-16">
        <div class="cols">
          <div class="flex-1">
            <div class="t-body1 c-text-black-high">{{$t('order.tip')}}</div>
          </div>
          <div class="align-righ">
            <span class="t-body1 c-text-black-high">{{$n(tip, 'currency')}}</span>
          </div>
        </div>
        <!-- Tip Buttons -->
        <div v-if="isTipEditable" class="columns is-gapless">
          <div class="column is-narrow">
            <b-input
              class="w-96 m-t-8 m-r-16"
              type="number"
              :step="tipStep"
              v-model="tip"
              v-on:input="handleTipInput"
              maxlength="30"
              style
            />
          </div>
          <div class="column">
            <b-button
              v-for="ratio in regionTip.choices"
              class="m-t-8 m-r-8 bg-form"
              @click="updateTip(ratio)"
              :type="isSameAmount(ratio) ? 'is-primary' : ''"
              :key="ratio"
            >{{ ratio + "%" }}</b-button>
          </div>
        </div>
      </div>

      <hr class="devider m-t-16 m-b-0 m-l-16 m-r-16" />

      <!-- Total Charge -->
      <div class="p-t-24 p-l-16 p-r-16">
        <div class="cols">
          <div class="flex-1">
            <div class="t-h6 c-status-green">{{$t('order.totalCharge')}}</div>
          </div>
          <div class="align-righ">
            <span class="t-h6 c-status-green">{{$n(orderInfo.total + Number(tip), 'currency')}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { order_status } from "~/plugins/constant.js";
import OrderItem from "~/app/user/Order/OrderItem";

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
    }
  },
  data() {
    return {
      tip: 0
    };
  },
  watch: {
    orderInfo() {
      //console.log("orderInfo changed", this.orderInfo.total);
      if (this.isTipEditable) {
        this.updateTip(this.regionTip.default);
      } else {
        this.tip = this.orderInfo.tip;
      }
    }
  },
  components: {
    OrderItem
  },
  computed: {
    regionTip() {
      return this.$store.getters.stripeRegion.tip;
    },
    tipStep() {
      return 1.0 / this.$store.getters.stripeRegion.multiple;
    },
    verified() {
      return this.orderInfo.status >= order_status.validation_ok;
    },
    isTipEditable() {
      return this.orderInfo.status === order_status.validation_ok;
    }
  },
  methods: {
    calcTip(ratio) {
      const m = this.$store.getters.stripeRegion.multiple;
      const value = Math.round((this.orderInfo.total * ratio * m) / 100) / m;
      if (m === 1) {
        return Math.round(value);
      }
      return Math.round(value * m) / m;
    },
    updateTip(ratio) {
      this.tip = this.calcTip(ratio);
      this.$emit("change", this.tip);
    },
    isSameAmount(ratio) {
      return Number(this.tip) === this.calcTip(ratio);
    },
    handleTipInput() {
      //console.log("tip=", this.tip);
      if (this.tip < 0) {
        console.log("native");
        this.tip = -this.tip;
      }
      this.$emit("change", Number(this.tip));
    }
  }
};
</script>
