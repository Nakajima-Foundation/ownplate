<template>
  <div>
    <o-button
      v-if="0 != totalQuantities"
      :disabled="
        isCheckingOut || noPaymentMethod || noAvailableTime || cantDelivery
      "
      @click="handleCheckOut"
      class="b-reset-tw fixed left-1/2 bottom-3 z-30 ml-[-9rem] w-[18rem] sm:bottom-8"
    >
      <div
        class="inline-flex w-72 items-center justify-center rounded-full bg-op-teal shadow-lg"
        :class="shopInfo.enableDelivery ? 'pt-2 pb-2' : 'h-20'"
      >
        <ButtonLoading v-if="isCheckingOut" />
        <template v-if="noPaymentMethod">
          <div
            class="text-base font-bold text-white"
            v-if="shopInfo.publicFlag"
          >
            {{ $t("shopInfo.noPaymentMethod") }}
          </div>
          <div class="text-base font-bold text-white" v-else>
            {{ $t("shopInfo.notPublicShop") }}
          </div>
        </template>

        <template v-else-if="noAvailableTime">
          <div class="text-base font-bold text-white">
            {{ $t("shopInfo.noAvailableTime") }}
          </div>
        </template>

        <template v-else-if="!noPaymentMethod">
          <div class="inline-flex flex-col items-center justify-center">
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
                  class="inline-flex items-center justify-center text-base font-bold text-white"
                >
                  {{
                    $t(
                      "shopInfo.buttonDeliveryFeeThreshold",
                      {
                        price: $n(deliveryData.deliveryThreshold, "currency"),
                      },
                      0,
                    )
                  }}
                </div>
                <div
                  class="inline-flex items-center justify-center text-base font-bold text-white"
                >
                  {{
                    $t(
                      "shopInfo.buttonDeliveryFeeDiff",
                      {
                        price: $n(diffDeliveryThreshold, "currency"),
                      },
                      0,
                    )
                  }}
                </div>
              </template>
              <template
                v-else-if="deliveryData.enableDeliveryFree && !isDeliveryFree"
              >
                <div
                  class="inline-flex items-center justify-center text-base font-bold text-white"
                >
                  {{
                    $t(
                      "shopInfo.deliveryFeeThresholdInfo",
                      {
                        price: $n(
                          deliveryData.deliveryFreeThreshold,
                          "currency",
                        ),
                      },
                      0,
                    )
                  }}
                </div>
                <div
                  class="inline-flex items-center justify-center text-base font-bold text-white"
                >
                  {{
                    $t(
                      "shopInfo.buttonDeliveryFeeDiff",
                      {
                        price: $n(diffDeliveryFreeThreshold, "currency"),
                      },
                      0,
                    )
                  }}
                </div>
              </template>
              <div
                class="inline-flex items-center justify-center text-base font-bold text-white"
                v-if="shopInfo.enableDelivery"
              >
                <div class="mr-2">
                  {{
                    $t(
                      "shopInfo.buttonDeliveryFee",
                      {
                        price: $n(
                          isDeliveryFree ? 0 : deliveryData.deliveryFee,
                          "currency",
                        ),
                      },
                      0,
                    )
                  }}
                  <span
                    class="text-xs"
                    v-if="!isDeliveryFree && deliveryData.deliveryFee > 0"
                    >{{ $t("tax.include") }}</span
                  >
                </div>
              </div>
            </template>
            <!-- total and price -->
            <template v-if="!noPaymentMethod">
              <div
                class="inline-flex items-center justify-center text-base font-bold text-white"
              >
                <div class="mr-2">
                  {{
                    $t(
                      "sitemenu.orderCounter",
                      {
                        count: totalQuantities,
                      },
                      totalQuantities,
                    )
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
                class="is-inline-flex items-center justify-center text-white"
              >
                <div class="mr-2 text-xl font-bold">
                  {{ $t(buttonText) }}
                </div>
                <i class="material-icons text-2xl">shopping_cart</i>
              </div>
            </template>
          </div>
        </template>
      </div>
    </o-button>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";

import { arraySum } from "@/utils/utils";

import Price from "@/components/Price.vue";
import ButtonLoading from "@/components/Button/Loading.vue";

export default defineComponent({
  components: {
    Price,
    ButtonLoading,
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
  emits: ["handleCheckOut", "showCart"],

  setup(props, ctx) {
    const isShowCart = ref(false);

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
      if (!isShowCart.value) {
        isShowCart.value = true;
      } else {
        ctx.emit("handleCheckOut");
      }
    };
    const closeCart = () => {
      isShowCart.value = false;
    };
    const buttonText = computed(() => {
      if (!isShowCart.value) {
        return "sitemenu.confirmCart";
      } else {
        return "sitemenu.checkout";
      }
    });
    watch(totalQuantities, (value) => {
      if (value === 0) {
        closeCart();
      }
    });
    return {
      totalQuantities,

      noPaymentMethod,
      cantDelivery,

      handleCheckOut,

      isDeliveryFree,
      diffDeliveryThreshold,
      diffDeliveryFreeThreshold,

      isShowCart,
      closeCart,

      buttonText,
    };
  },
});
</script>
