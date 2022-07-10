<template>
  <b-button
    v-if="0 != totalQuantities"
    :loading="isCheckingOut"
    :disabled="
      isCheckingOut || noPaymentMethod || noAvailableTime || cantDelivery
    "
    @click="handleCheckOut"
    class="b-reset-tw fixed z-10 left-1/2 bottom-8 w-[18rem] ml-[-9rem]"
  >
    <div
      class="inline-flex justify-center items-center w-72 rounded-full bg-op-teal shadow-lg"
      :class="shopInfo.enableDelivery ? 'pt-2 pb-2' : 'h-20'"
    >
      <template v-if="noPaymentMethod">
        <div class="text-white text-base font-bold">
          {{ $t("shopInfo.noPaymentMethod") }}
        </div>
      </template>

      <template v-else-if="noAvailableTime">
        <div class="text-white text-base font-bold">
          {{ $t("shopInfo.noAvailableTime") }}
        </div>
      </template>

      <template v-else="!noPaymentMethod">
        <div class="inline-flex flex-col justify-center items-center">
          <!-- delivery -->
          <template v-if="isDelivery">
            <template
              v-if="
                shopInfo.enableDelivery &&
                cantDelivery &&
                deliveryData.enableDeliveryThreshold
              "
            >
              <div
                class="inline-flex justify-center items-center text-white text-base font-bold"
              >
                {{
                  $tc("shopInfo.buttonDeliveryFeeThreshold", 0, {
                    price: $n(deliveryData.deliveryThreshold, "currency"),
                  })
                }}
              </div>
              <div
                class="inline-flex justify-center items-center text-white text-base font-bold"
              >
                {{
                  $tc("shopInfo.buttonDeliveryFeeDiff", 0, {
                    price: $n(diffDeliveryThreshold, "currency"),
                  })
                }}
              </div>
            </template>
            <template
              v-else-if="deliveryData.enableDeliveryFree && !isDeliveryFree"
            >
              <div
                class="inline-flex justify-center items-center text-white text-base font-bold"
              >
                {{
                  $tc("shopInfo.deliveryFeeThresholdInfo", 0, {
                    price: $n(deliveryData.deliveryFreeThreshold, "currency"),
                  })
                }}
              </div>
              <div
                class="inline-flex justify-center items-center text-white text-base font-bold"
              >
                {{
                  $tc("shopInfo.buttonDeliveryFeeDiff", 0, {
                    price: $n(diffDeliveryFreeThreshold, "currency"),
                  })
                }}
              </div>
            </template>
            <div
              class="inline-flex justify-center items-center text-white text-base font-bold"
              v-if="shopInfo.enableDelivery"
            >
              <div class="mr-2">
                {{
                  $tc("shopInfo.buttonDeliveryFee", 0, {
                    price: $n(
                      isDeliveryFree ? 0 : deliveryData.deliveryFee,
                      "currency"
                    ),
                  })
                }}
                <span
                  class="text-xs"
                  v-if="!isDeliveryFree && deliveryData.deliveryFee > 0"
                  >{{ $tc("tax.include") }}</span
                >
              </div>
            </div>
          </template>
          <!-- total and price -->
          <div
            class="inline-flex justify-center items-center text-white text-base font-bold"
          >
            <div class="mr-2">
              {{
                $tc("sitemenu.orderCounter", totalQuantities, {
                  count: totalQuantities,
                })
              }}
            </div>
            <div class="">
              <Price
                :shopInfo="{ inclusiveTax: true }"
                :menu="{ price: totalPrice.total }"
              />
            </div>
          </div>

          <div
            class="is-inline-flex flex-center justify-center items-center text-white"
          >
            <div class="text-xl font-bold mr-2">
              {{ $t("sitemenu.checkout") }}
            </div>
            <i class="material-icons text-2xl">shopping_cart</i>
          </div>
        </div>
      </template>
    </div>
  </b-button>
</template>
<script>
import { defineComponent, computed } from "@vue/composition-api";

import { arraySum } from "@/utils/utils";

import Price from "@/components/Price";

export default defineComponent({
  components: {
    Price,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orders: {
      type: Object,
      required: true,
    },
    paymentInfo: {
      type: Object,
      required: true,
    },
    deliveryData: {
      type: Object,
      required: true,
    },
    isCheckingOut: {
      type: Boolean,
      required: true,
    },
    noAvailableTime: {
      type: Boolean,
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: true,
    },
    totalPrice: {
      type: Object,
      required: true,
    },
  },
  emits: ["handleCheckOut"],

  setup(props, ctx) {
    const totalQuantities = computed(() => {
      const ret = Object.values(props.orders).reduce((total, order) => {
        return total + arraySum(order);
      }, 0);
      return ret;
    });
    const noPaymentMethod = computed(() => {
      // MEMO: ignore hidePayment. No longer used
      return !props.paymentInfo.stripe && !props.paymentInfo.inStore;
    });

    const cantDelivery = computed(() => {
      if (!props.shopInfo.enableDelivery) {
        return false;
      }

      if (props.isDelivery && props.deliveryData.enableDeliveryThreshold) {
        return (
          (props.totalPrice.total || 0) < props.deliveryData.deliveryThreshold
        );
      }
      return false;
    });
    const isDeliveryFree = computed(() => {
      if (
        props.shopInfo.enableDelivery &&
        props.deliveryData.enableDeliveryFree
      ) {
        return (
          (props.totalPrice.total || 0) >=
          props.deliveryData.deliveryFreeThreshold
        );
      }
      return false;
    });
    const diffDeliveryThreshold = computed(() => {
      return (
        props.deliveryData.deliveryThreshold - (props.totalPrice.total || 0)
      );
    });

    const diffDeliveryFreeThreshold = computed(() => {
      return (
        props.deliveryData.deliveryFreeThreshold - (props.totalPrice.total || 0)
      );
    });

    const handleCheckOut = () => {
      ctx.emit("handleCheckOut");
    };
    return {
      totalQuantities,

      noPaymentMethod,
      cantDelivery,

      handleCheckOut,

      isDeliveryFree,
      diffDeliveryThreshold,
      diffDeliveryFreeThreshold,
    };
  },
});
</script>
