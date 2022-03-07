<template>
  <div class="bg-white rounded-lg shadow p-4">
    <!-- Order Items -->
    <div class="grid grid-cols-1 space-y-4">
      <template v-for="(orderItem, key) in orderItems">
        <order-item :orderItem="orderItem" :key="orderItem.key" :editable="editable" :available="(editedAvailableOrders||{})[key]" @input="updateAvailable" :mkey="key"></order-item>
      </template>
    </div>

    <!-- Totals -->
    <div
      v-if="verified"
      class="border-t-2 border-solid border-black border-opacity-10 mt-4 pt-4"
    >
      <!-- Sub Total -->
      <div class="flex">
        <div class="flex-1">
          <div class="text-base">
            {{ $t("order.subtotal") }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-base">
            {{ $n(orderInfo.sub_total, "currency") }}
          </div>
        </div>
      </div>

      <!-- Tax -->
      <div class="flex mt-2">
        <div class="flex-1">
          <div class="text-base">
            {{
              $t(
                orderInfo.inclusiveTax ? "order.inclusiveTax" : "order.salesTax"
              )
            }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-base">
            {{ $n(orderInfo.tax, "currency") }}
          </div>
        </div>
      </div>

      <!-- Postage for EC -->
      <div v-if="shopInfo.isEC"
           class="border-t-2 border-solid border-black border-opacity-10 mt-4 pt-4">
        <div class="flex">
          <div class="flex-1">
            <div class="text-base">
              {{ $t("order.shippingCost") }}
            </div>
          </div>
          <div class="text-right">
            {{ orderInfo.shoppingCost }}
            <div class="text-base">
              {{ $n(actualShippingCost, "currency") }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Postage for delivery -->
      <div v-if="shopInfo.enableDelivery"
           class="border-t-2 border-solid border-black border-opacity-10 mt-4 pt-4">
        <div class="flex">
          <div class="flex-1">
            <div class="text-base">
              {{ $t("delivery.deliveryFee") }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-base">
              {{ $n(orderInfo.deliveryFee || 0, "currency") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div v-if="false && regionTip.choices.length > 0" class="flex mt-2">
        <div class="flex-1">
          <div class="text-base">
            {{ $t("order.total") }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-base">
            {{ $n(orderInfo.total, "currency") }}
          </div>
        </div>
      </div>

      <!-- Tip -->
      <div
        v-if="regionTip.choices.length > 0 && (isTipEditable || tip > 0) && enableTip"
        class="border-t-2 border-solid border-black border-opacity-10 mt-4 pt-4"
      >
        <div class="flex">
          <div class="flex-1">
            <div class="text-base">{{ $t("order.tip") }}</div>
          </div>
          <div class="text-right">
            <div class="text-base">
              {{ $n(tip, "currency") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tip Buttons -->
      <div v-if="regionTip.choices.length > 0 && enableTip" class="mt-2">
        <div v-if="isTipEditable">
          <div>
            <b-input
              class="w-full"
              type="number"
              :placeholder="$t('order.maxTip', { max: regionTip.max })"
              :step="tipStep"
              v-model="tip"
              v-on:input="handleTipInput"
              maxlength="30"
              style
            />
          </div>

          <div class="mt-2">
            <b-button
              v-for="ratio in regionTip.choices"
              class="b-reset-tw mr-2 mb-2"
              @click="updateTip(ratio)"
              :key="ratio"
              ><div
                class="inline-flex justify-center items-center h-9 rounded-full w-16"
                :class="
                  isSameAmount(ratio) ? 'bg-op-teal' : 'bg-black bg-opacity-5'
                "
              >
                <div
                  class="text-sm font-bold"
                  :class="isSameAmount(ratio) ? 'text-white' : 'text-op-teal'"
                >
                  {{ ratio + "%" }}
                </div>
              </div></b-button
            >
          </div>
        </div>
      </div>

      <!-- Total Charge -->
      <div
        class="border-t-2 border-solid border-black border-opacity-10 mt-4 pt-4"
      >
        <div class="flex">
          <div class="flex-1">
            <div class="text-xl font-bold text-green-600">
              {{ $t("order.totalCharge") }}
            </div>
          </div>
          <div class="text-right">

            <div class="text-xl font-bold text-green-600">
              {{ $n(orderInfo.total + Number(tip) + Number(actualShippingCost), "currency") }}
            </div>
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
    },
    shopInfo: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      required: false,
    },
    editedAvailableOrders: {
      type: Array,
      required: false
    },
    shippingCost: {
      type: Number,
      required: false
    },
  },
  data() {
    return {
      tip: ""
    };
  },
  watch: {
    orderInfo() {
      console.log("orderInfo changed", this.orderInfo.total);
      if (this.isTipEditable) {
        if (this.tip === "" && this.regionTip.default === 0) {
          return; // display the placeholder
        }
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
    actualShippingCost() {
      return this.orderInfo.shippingCost ? this.orderInfo.shippingCost : (this.shippingCost || 0)
    },
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
    },
    enableTip() {
      return !this.shopInfo.isEC;
    },
    maxTip() {
      return this.calcTip(this.regionTip.max);
    }
  },
  methods: {
    updateAvailable(value) {
      this.$emit("input", value)
    },

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
      if (this.tip < 0) {
        console.log("negative");
        this.tip = -this.tip;
      } else if (this.tip > this.maxTip) {
        console.log("max");
        this.tip = this.maxTip;
      }
      this.$emit("change", Number(this.tip));
    }
  }
};
</script>
