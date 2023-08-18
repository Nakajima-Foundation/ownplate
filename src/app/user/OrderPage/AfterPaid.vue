<template>
  <div>
    <!-- Restaurant Profile Photo and Name -->
    <div class="afterPaid mt-4">
      <shop-header :shopInfo="shopInfo"></shop-header>
    </div>

    <!-- After Paid -->
    <!-- Thank you Message -->
    <ThankYou />

    <!-- Line Button -->
    <LineButton
      :shopInfo="shopInfo"
      :hasFriends="hasFriends"
      :hasLine="hasLine"
    />

    <!-- Order Summary -->
    <div class="mx-6 mt-6 rounded-lg bg-white px-2 pt-6 pb-1 shadow">
      <!-- Order Status -->
      <OrderStatus :orderInfo="orderInfo" :orderName="orderName" />

      <!-- Time to Pickup -->
      <Pickup
        :orderInfo="orderInfo"
        :shopInfo="shopInfo"
        :timeEstimated="timeEstimated"
        :timeRequested="timeRequested"
      />

      <!-- Stripe status -->
      <StripeStatus v-if="hasStripe" :orderInfo="orderInfo" />

      <!-- Cancel Button -->
      <div class="mt-8 mb-5 text-center">
        <o-button
          v-if="just_paid"
          @click="handleCancelPayment"
          class="b-reset-tw"
        >
          <div class="inline-flex items-center justify-center">
            <i class="material-icons mr-2 text-lg text-red-700"
              >highlight_off</i
            >
            <div class="text-base font-bold text-red-700">
              {{ $t("order.cancelOrder") }}
            </div>
          </div>
        </o-button>
      </div>
    </div>

    <!-- Canceled Message -->
    <div
      v-if="canceled"
      class="mx-6 mt-6 rounded-lg bg-red-700 bg-opacity-10 p-4 text-center"
    >
      <span class="text-base font-bold text-red-700">{{
        $t("order.cancelOrderComplete")
      }}</span>
    </div>
    <!-- Special Thank you Message from the Restaurant -->
    <ThankYouFromRestaurant v-if="!canceled" :shopInfo="shopInfo" />

    <!-- Favorite Button -->
    <div class="mt-6 text-center">
      <div>
        <favorite-button :shopInfo="shopInfo"></favorite-button>
      </div>
    </div>

    <!-- Restaurant LINE -->
    <RestaurantLine v-if="hasLineUrl" :shopInfo="shopInfo" />

    <!-- end Of After Paid -->

    <!-- customer info -->
    <div
      v-if="orderInfo.phoneNumber && !shopInfo.isEC"
      class="mt-4 text-center"
    >
      <CustomerInfo :orderInfo="orderInfo" />
    </div>

    <!-- Order Body -->
    <div class="mx-6 mt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
      <!-- Left -->
      <div>
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-30">
          {{ $t("order.yourOrder") + ": " + orderName }}
        </div>

        <!-- Details -->
        <div class="mt-2">
          <order-info
            :shopInfo="shopInfo || {}"
            :orderItems="orderItems"
            :orderInfo="orderInfo || {}"
          ></order-info>
        </div>

        <!-- Customer info -->
        <div
          class="mt-2"
          v-if="
            shopInfo &&
            (shopInfo.isEC || orderInfo.isDelivery) &&
            hasCustomerInfo
          "
        >
          <UserCustomerInfo
            :shopInfo="shopInfo"
            :orderInfo="orderInfo"
            :orderId="orderId"
          />
        </div>

        <!-- Your Message to the Restaurant -->
        <template v-if="hasMemo">
          <div class="mt-4 rounded-lg bg-white p-4 shadow">
            <div class="text-xs font-bold text-black text-opacity-60">
              {{ $t("order.orderMessage") }}
            </div>
            <div class="mt-1 text-base">{{ orderInfo.memo }}</div>
          </div>
        </template>

        <!-- Canceled Message -->
        <div
          v-if="canceled"
          class="mt-6 rounded-lg bg-red-700 bg-opacity-10 p-4 text-center"
        >
          <span class="text-base font-bold text-red-700">{{
            $t("order.cancelOrderComplete")
          }}</span>
        </div>

        <!-- Receipt -->
        <template
          v-if="order_accepted && hasStripe && !canceled && !cancelPayment"
        >
          <Receipt />
        </template>

        <!-- View Menu Page Button -->
        <div class="mt-6 text-center">
          <router-link :to="menuPagePath">
            <div
              class="inline-flex h-12 items-center justify-center rounded-full border-2 border-op-teal px-6 b-reset-tw"
            >
              <div class="text-base font-bold text-op-teal">
                {{ $t("order.menu") }}
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Right -->
      <div class="mt-4 lg:mt-0">
        <!-- Restaurant Info -->
        <div>
          <div class="text-xl font-bold text-black text-opacity-30">
            {{
              shopInfo.isEC
                ? $t("shopInfo.ecShopDetails")
                : $t("shopInfo.restaurantDetails")
            }}
          </div>

          <div class="mt-2">
            <shop-info
              :compact="true"
              :shopInfo="shopInfo"
              :isDelivery="orderInfo.isDelivery"
              :paymentInfo="paymentInfo"
            />
          </div>
        </div>

        <!-- QR Code -->
        <div class="mt-6" v-if="!shopInfo.isEC">
          <div class="text-xl font-bold text-black text-opacity-30">
            {{ $t("order.adminQRCode") }}
          </div>

          <div class="mt-2 rounded-lg bg-white p-4 text-center shadow">
            <vue-qrcode
              :value="urlAdminOrderPage"
              :options="{ width: 160 }"
            ></vue-qrcode>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

import ShopHeader from "@/app/user/Restaurant/ShopHeader.vue";
import ShopInfo from "@/app/user/Restaurant/ShopInfo.vue";
import FavoriteButton from "@/app/user/Restaurant/FavoriteButton.vue";

import OrderInfo from "@/app/user/OrderPage/OrderInfo.vue";
import CustomerInfo from "@/app/user/OrderPage/CustomerInfo.vue";
import UserCustomerInfo from "@/app/user/OrderPage/UserCustomerInfo.vue";

import ThankYou from "@/app/user/OrderPage/AfterPaid/ThankYou.vue";
import ThankYouFromRestaurant from "@/app/user/OrderPage/AfterPaid/ThankYouFromRestaurant.vue";
import LineButton from "@/app/user/OrderPage/AfterPaid/LineButton.vue";
import RestaurantLine from "@/app/user/OrderPage/AfterPaid/RestaurantLine.vue";
import StripeStatus from "@/app/user/OrderPage/AfterPaid/StripeStatus.vue";
import OrderStatus from "@/app/user/OrderPage/AfterPaid/OrderStatus.vue";
import Receipt from "@/app/user/OrderPage/AfterPaid/Receipt.vue";
import Pickup from "@/app/user/OrderPage/AfterPaid/Pickup.vue";

import { order_status } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { stripeCancelIntent } from "@/lib/stripe/stripe";

import * as analyticsUtil from "@/lib/firebase/analytics";

import { isEmpty, validUrl } from "@/utils/utils";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "Order",
  components: {
    ShopHeader,
    ShopInfo,
    FavoriteButton,

    OrderInfo,
    CustomerInfo,
    UserCustomerInfo,

    // after paid components
    ThankYou,
    ThankYouFromRestaurant,
    LineButton,
    RestaurantLine,
    StripeStatus,
    OrderStatus,
    Receipt,
    Pickup,
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
    hasFriends: {
      type: Boolean,
      required: false,
    },
    hasLine: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const store = useStore();
    const { d } = useI18n({ useScope: "global" });

    const orderId = route.params.orderId as string;
    const restaurantId = route.params.restaurantId as string;

    const hasStripe = computed(() => {
      return props.orderInfo.payment && props.orderInfo.payment.stripe;
    });
    const cancelPayment = computed(() => {
      return (
        props.orderInfo.payment && props.orderInfo.payment.stripe === "canceled"
      );
    });
    const hasLineUrl = computed(() => {
      return props.shopInfo.lineUrl && validUrl(props.shopInfo.lineUrl);
    });
    const urlAdminOrderPage = computed(() => {
      return `${location.origin}/admin/restaurants/${restaurantId}/orders/${orderId}`;
    });
    const timeRequested = computed(() => {
      const date = props.orderInfo.timePlaced.toDate();
      return d(date, "long");
    });
    const timeEstimated = computed(() => {
      if (props.orderInfo.timeEstimated) {
        const date = props.orderInfo.timeEstimated.toDate();
        return d(date, "long");
      }
      return undefined; // backward compatibility
    });
    const orderName = computed(() => {
      return nameOfOrder(props.orderInfo);
    });
    const just_paid = computed(() => {
      return props.orderInfo.status === order_status.order_placed;
    });
    const canceled = computed(() => {
      return props.orderInfo.status === order_status.order_canceled;
    });
    const order_accepted = computed(() => {
      return props.orderInfo.status >= order_status.order_accepted;
    });
    const hasCustomerInfo = computed(() => {
      return props.orderInfo.status > order_status.validation_ok;
    });
    const hasMemo = computed(() => {
      return props.orderInfo && !isEmpty(props.orderInfo.memo);
    });

    const sendRedunded = () => {
      analyticsUtil.sendRedunded(props.orderInfo, orderId, props.shopInfo);
    };
    const handleCancelPayment = () => {
      store.commit("setAlert", {
        code: "order.cancelOrderConfirm",
        callback: async () => {
          try {
            store.commit("setLoading", true);
            await stripeCancelIntent({
              restaurantId: restaurantId,
              orderId: orderId,
            });
            sendRedunded();
            // console.log("cancel", data);
          } catch (error) {
            // BUGBUG: Implement the error handling code here
            // console.error(error.message, error.details);
            store.commit("setErrorMessage", {
              code: "order.cancel",
              error,
            });
          } finally {
            store.commit("setLoading", false);
          }
        },
      });
    };
    return {
      orderId,
      // computed
      hasStripe,
      cancelPayment,
      hasLineUrl,
      urlAdminOrderPage,
      timeRequested,
      timeEstimated,
      orderName,
      just_paid,
      canceled,
      order_accepted,
      hasCustomerInfo,
      hasMemo,
      // method
      handleCancelPayment,
    };
  },
});
</script>
