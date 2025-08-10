<template>
  <div>
    <!-- Back Button (Edit Order) -->
    <div class="mx-6 mt-4">
      <router-link :to="menuPagePath">
        <div
          class="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-black/5 px-4"
        >
          <i class="material-icons text-op-teal mr-2 text-lg">arrow_back</i>
          <div class="text-op-teal text-sm font-bold">
            {{ $t("button.back") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Restaurant Profile Photo and Name -->
    <div class="beforePaid mt-2">
      <shop-header :shopInfo="shopInfo"></shop-header>
    </div>

    <!-- Before Paid -->
    <div class="mx-6 mt-4">
      <BeforePaidAlert
        :orderInfo="orderInfo"
        :shopInfo="shopInfo"
        message="order.waitingPayment"
      />
    </div>
    <!-- end of Before Paid -->

    <!-- Order Body -->
    <div class="mx-6 mt-2 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
      <!-- Left -->
      <div>
        <!-- Title -->
        <div class="text-xl font-bold text-black/30">
          <div>
            {{ $t("order.confirmOrder") }}
          </div>
        </div>

        <!-- Details -->
        <div class="mt-2">
          <order-info
            :shopInfo="shopInfo || {}"
            :orderItems="orderItems"
            :orderInfo="orderInfo || {}"
          ></order-info>
        </div>
      </div>

      <!-- Right -->
      <div class="mt-4 lg:mt-0">
        <div>
          <!-- Payment -->
          <div class="mt-2">
            <div class="text-xl font-bold text-black/30">
              {{ $t("order.yourPayment") }}
            </div>

            <!-- Pay Online -->
            <div v-if="showPayment" class="mt-2">
              <stripe-card
                @change="handleCardStateChange"
                ref="stripeRef"
                :stripeJCB="stripeJCB"
                :stripeAccount="stripeAccount"
                :clientSecret="orderInfo.client_secret"
                :ownerUid="shopInfo.uid"
                :uid="orderInfo.uid"
                :hasPayment="orderInfo.hasPayment"
                :isPayingError="isPayingError"
              ></stripe-card>
              <div class="mt-4 text-center">
                <button
                  :disabled="!cardState.complete"
                  @click="handlePayment()"
                  class="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div
                    class="bg-op-teal inline-flex h-16 items-center justify-center rounded-full px-6 shadow-sm"
                    style="min-width: 288px"
                  >
                    <div class="text-xl font-bold text-white">
                      {{ $t("order.submitPayment") }}
                    </div>
                  </div>
                </button>
                <div
                  v-if="stripeSmallPayment"
                  class="mt-2 text-sm font-bold text-red-700"
                >
                  {{ $t("errorPage.code.smallPayment") }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType } from "vue";

import ShopHeader from "@/app/user/Restaurant/ShopHeader.vue";

import OrderInfo from "@/app/user/OrderPage/OrderInfo.vue";

import StripeCard from "@/app/user/OrderPage/BeforePaid/StripeCard.vue";
import BeforePaidAlert from "@/app/user/OrderPage/BeforePaid/BeforePaidAlert.vue";

import { orderPay } from "@/lib/firebase/functions";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import * as analyticsUtil from "@/lib/firebase/analytics";

import { useStore } from "vuex";
import { useGeneralStore } from "@/store";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "Order",
  components: {
    ShopHeader,

    OrderInfo,

    // before paid
    StripeCard,
    BeforePaidAlert,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    orderInfo: {
      type: Object as PropType<OrderInfoData>,
      required: true,
    },
    orderItems: {
      type: Array,
      required: true,
    },
    paymentInfo: {
      type: Object,
      required: true,
    },
    menuPagePath: {
      type: String,
      required: false,
    },
  },
  data() {
    return {};
  },
  setup(props) {
    const route = useRoute();
    const store = useStore();
    const generalStore = useGeneralStore();

    const restaurantId = route.params.restaurantId as string;

    const isPayingError = ref(false);

    const cardState = ref({});

    // ref for refs
    const stripeRef = ref();

    const stripeAccount = computed(() => {
      return props.paymentInfo.stripe;
    });

    const stripeJCB = computed(() => {
      return props.paymentInfo.stripeJCB === true;
    });
    const inStorePayment = computed(() => {
      return props.paymentInfo.inStore;
    });
    const showPayment = computed(() => {
      return stripeAccount.value;
    });

    const orderId = computed(() => {
      return route.params.orderId as string;
    });
    const stripeSmallPayment = computed(() => {
      return props.orderInfo.total <= 50;
    });

    // end of computed

    // methods
    // internal
    const sendPurchase = () => {
      analyticsUtil.sendPurchase(
        props.orderInfo,
        orderId.value,
        props.orderItems.map((or: any) => {
          return { ...or.item, id: or.id, quantity: or.count };
        }),
        props.shopInfo,
        restaurantId,
      );
    };
    const handleCardStateChange = (state: { [key: string]: boolean }) => {
      if (state.complete) {
        isPayingError.value = false;
      }
      cardState.value = state;
    };

    const handlePayment = async () => {
      try {
        isPayingError.value = false;
        generalStore.setLoading(true);
        const pay = await stripeRef.value.processPayment();
        if (pay.error) {
          isPayingError.value = true;
          generalStore.setLoading(false);
          return;
        }
        await orderPay({
          restaurantId,
          orderId: orderId.value,
          isSavePay: stripeRef.value.isSavePay,
        });

        sendPurchase();
        store.commit("resetCart", restaurantId);
        window.scrollTo(0, 0);
      } catch (error: any) {
        console.error(error.message, error.details);
        store.commit("setErrorMessage", {
          code: "order.place",
          error,
        });
      } finally {
        generalStore.setLoading(false);
      }
    };

    return {
      // ref
      isPayingError,
      cardState,

      // refs
      stripeRef,

      // computed
      stripeJCB,
      inStorePayment,
      showPayment,
      orderId,
      stripeSmallPayment,

      // methods
      handleCardStateChange,
      handlePayment,
      stripeAccount,
      //
    };
  },
});
</script>
