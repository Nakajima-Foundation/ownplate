<template>
  <div class="rounded-lg bg-white p-4 shadow-sm">
    <!-- Order Items -->
    <div class="grid grid-cols-1 space-y-4">
      <template v-for="(orderItem, key) in orderItems" :key="orderItem.key">
        <order-item
          :orderItem="orderItem"
          :editable="editable"
          :available="(editedAvailableOrders || {})[key]"
          @update="updateAvailable"
          :menuData="(menuData || {})[orderItem.id]"
          :mkey="key"
        ></order-item>
      </template>
    </div>

    <!-- Totals -->
    <div
      v-if="verified"
      class="mt-4 border-t-2 border-solid border-black/10 pt-4"
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
      <div class="mt-2 flex">
        <div class="flex-1">
          <div class="text-base">
            {{
              $t(
                orderInfo.inclusiveTax
                  ? "order.inclusiveTax"
                  : "order.salesTax",
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

      <!-- Promotion discount for after pay -->
      <div
        v-if="orderInfo.promotionId"
        class="-mx-2 mt-2 flex bg-green-600/10 px-2 py-1 rounded-md"
      >
        <div class="flex-1">
          <div class="text-base">
            {{ $t("order.discountString") }}
            ({{ orderInfo.promotionName }})
          </div>
        </div>
        <div class="text-right">
          <div class="text-base">
            {{ $n(-orderInfo.discountPrice, "currency") }}
          </div>
        </div>
      </div>

      <!-- Postage for EC -->
      <div
        v-if="shopInfo.isEC"
        class="mt-4 border-t-2 border-solid border-black/10 pt-4"
      >
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
      <div
        v-if="orderInfo.isDelivery"
        class="mt-4 border-t-2 border-solid border-black/10 pt-4"
      >
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
      <div v-if="false && regionTip.choices.length > 0" class="mt-2 flex">
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
        v-if="
          regionTip.choices.length > 0 &&
          (isTipEditable || previewTip) &&
          enableTip
        "
        class="mt-4 border-t-2 border-solid border-black/10 pt-4"
      >
        <div class="flex">
          <div class="flex-1">
            <div class="text-base">{{ $t("order.tip") }}</div>
          </div>
          <div class="text-right">
            <div class="text-base">
              {{ $n(Number(previewTip || 0), "currency") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tip Buttons -->
      <div v-if="regionTip.choices.length > 0 && enableTip" class="mt-2">
        <div v-if="isTipEditable">
          <div>
            <input
              class="w-full p-2 border-inherit border-2 rounded-lg"
              type="number"
              :placeholder="$t('order.maxTip', { max: regionTip.max })"
              :step="tipStep"
              v-model="tip"
              maxlength="30"
            />
          </div>

          <div class="mt-2">
            <o-button
              v-for="ratio in regionTip.choices"
              class="b-reset-tw mr-2 mb-2"
              @click="updateTip(ratio)"
              :key="ratio"
              ><div
                class="inline-flex h-9 w-16 items-center justify-center rounded-full"
                :class="isSameAmount(ratio) ? 'bg-op-teal' : 'bg-black/5'"
              >
                <div
                  class="text-sm font-bold"
                  :class="isSameAmount(ratio) ? 'text-white' : 'text-op-teal'"
                >
                  {{ ratio + "%" }}
                </div>
              </div></o-button
            >
          </div>
        </div>
      </div>

      <!-- Total Charge -->
      <div class="mt-4 border-t-2 border-solid border-black/10 pt-4">
        <div class="flex">
          <div class="flex-1">
            <div class="text-xl font-bold text-green-600">
              {{ $t("order.totalCharge") }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold text-green-600">
              {{ $n(previewTotal, "currency") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- promotion discount for before pay -->
    <div
      v-if="enablePromotion"
      class="bg-green-600/10 p-2 -mx-2 rounded-lg mt-2"
    >
      <!-- promotion discount -->
      <template v-if="promotion?.paymentRestrictions">
        <!-- おもちかえりの場合は以下のメッセージを表示-->
        <span class="text-sm font-bold text-black/40">
          {{ $t("order.discountAlert." + promotion.paymentRestrictions) }}
        </span>
      </template>
      <div class="mt-2 flex">
        <div class="flex-1">
          <div class="text-base">
            {{ promotion.promotionName }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-base">
            {{ $n(-discountPrice, "currency") }}
          </div>
        </div>
      </div>
      <div class="mt-4 border-t-2 border-solid border-black/10 pt-4 pb-2">
        <div class="flex">
          <div class="flex-1">
            <div class="text-xl font-bold text-green-600">
              {{ $t("order.totalCharge") }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-xl font-bold text-green-600">
              {{ $n(previewDiscountTotal, "currency") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref, PropType } from "vue";

import { order_status } from "@/config/constant";
import { stripeRegion } from "@/utils/utils";
import OrderItem from "@/app/user/OrderPage/OrderItem.vue";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { MenuData } from "@/models/menu";

export default defineComponent({
  name: "Order",

  props: {
    orderItems: {
      type: Array,
      required: true,
    },
    orderInfo: {
      type: Object as PropType<OrderInfoData>,
      required: true,
    },
    menuData: {
      type: Object as PropType<{ [key: string]: MenuData }>,
      required: false,
    },
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    // promotion
    promotion: {
      type: Object,
      required: false,
    },
    enablePromotion: {
      type: Boolean,
      required: false,
    },
    discountPrice: {
      type: Number,
      required: false,
    },
    // end of promotion
    editable: {
      type: Boolean,
      required: false,
    },
    editedAvailableOrders: {
      type: Array,
      required: false,
    },
    shippingCost: {
      type: Number,
      required: false,
    },
  },
  components: {
    OrderItem,
  },
  emits: ["update", "change"],
  setup(props, ctx) {
    const regionTip = stripeRegion.tip;
    const tipStep = 1.0 / stripeRegion.multiple;

    const tip = ref<number | string>("");

    // methods
    const updateAvailable = (value: boolean) => {
      ctx.emit("update", value);
    };

    // internal
    const calcTip = (ratio: number) => {
      const m = stripeRegion.multiple;
      const value = Math.round((props.orderInfo.total * ratio * m) / 100) / m;
      if (m === 1) {
        return Math.round(value);
      }
      return Math.round(value * m) / m;
    };
    const updateTip = (ratio: number) => {
      console.log("updateTip");
      tip.value = calcTip(ratio);
    };
    const isSameAmount = (ratio: number) => {
      return Number(tip.value) === calcTip(ratio);
    };
    // computed
    // internal
    const maxTip = computed(() => {
      return calcTip(regionTip.max);
    });

    // computed
    const actualShippingCost = computed(() => {
      return props.orderInfo.shippingCost
        ? props.orderInfo.shippingCost
        : props.shippingCost || 0;
    });

    const verified = computed(() => {
      return props.orderInfo.status >= order_status.validation_ok;
    });
    const isTipEditable = computed(() => {
      return props.orderInfo.status === order_status.validation_ok;
    });

    const previewTip = computed(() => {
      // both edittable tip or orderinfo tip
      if (isTipEditable.value) {
        return tip.value;
      }
      return props.orderInfo.tip;
    });

    const previewTotal = computed(() => {
      return props.editable || isTipEditable.value
        ? props.orderInfo.total +
            Number(tip.value) +
            Number(actualShippingCost.value) +
            Number(props.orderInfo.deliveryFee || 0)
        : props.orderInfo.totalCharge;
    });
    const previewDiscountTotal = computed(() => {
      return props.editable || isTipEditable.value
        ? previewTotal.value - Number(props.discountPrice)
        : props.orderInfo.totalCharge;
    });
    const enableTip = computed(() => {
      if (props.shopInfo.isEC) {
        return false;
      }
      return true;
    });

    const orderInfo = computed(() => {
      return props.orderInfo;
    });
    watch(orderInfo, () => {
      console.log("orderInfo changed", props.orderInfo.total);
      if (isTipEditable.value) {
        if (tip.value === "" && regionTip.default === 0) {
          return; // display the placeholder
        }
        updateTip(regionTip.default);
      } else {
        tip.value = props.orderInfo.tip;
      }
    });
    watch(tip, (v) => {
      const tipNum = Number(v);
      if (tipNum < 0) {
        console.log("negative");
        tip.value = -v;
      } else if (tipNum > maxTip.value) {
        console.log("max");
        tip.value = maxTip.value;
      }
      ctx.emit("change", Number(tip.value));
    });

    return {
      // const
      regionTip,
      tipStep,
      // ref
      tip,

      previewDiscountTotal,

      // methods
      updateAvailable,
      updateTip,
      isSameAmount,

      actualShippingCost,
      verified,
      isTipEditable,
      previewTip,
      previewTotal,
      enableTip,
    };
  },
});
</script>
