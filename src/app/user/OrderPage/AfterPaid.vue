<template>
  <div>
    <!-- Restaurant Profile Photo and Name -->
    <div class="mt-4">
      <shop-header :shopInfo="shopInfo"></shop-header>
    </div>

    <!-- After Paid -->
    <!-- Thank you Message -->
    <ThankYou v-if="mode !== 'mo'" />

    <!-- Line Button -->
    <LineButton :groupData="groupData" />

    <!-- Order Summary -->
    <div class="mt-6 mx-6 pt-6 pb-1 px-2 bg-white rounded-lg shadow">
      <!-- Order Status -->
      <OrderStatus :orderInfo="orderInfo" :orderName="orderName" />

      <!-- Time to Pickup -->
      <Pickup
        :orderInfo="orderInfo"
        :shopInfo="shopInfo"
        :timeEstimated="timeEstimated"
        :timeRequested="timeRequested"
        :paid="paid"
        :mode="mode"
      />

      <!-- Stripe status -->
      <StripeStatus v-if="hasStripe" :orderInfo="orderInfo" :mode="mode" />

      <!-- Cancel Button -->
      <div class="mt-8 mb-5 text-center">
        <b-button
          v-if="just_paid"
          @click="handleCancelPayment"
          class="b-reset-tw"
        >
          <div class="inline-flex justify-center items-center">
            <i class="material-icons text-lg mr-2 text-red-700"
              >highlight_off</i
            >
            <div class="text-base font-bold text-red-700">
              {{ $t("order.cancelOrder") }}
            </div>
          </div>
        </b-button>
      </div>
    </div>

    <!-- Canceled Message -->
    <div
      v-if="canceled"
      class="mt-6 mx-6 bg-red-700 bg-opacity-10 rounded-lg p-4 text-center"
    >
      <span class="text-base font-bold text-red-700">{{
        $t("order.cancelOrderComplete")
      }}</span>
    </div>
    <!-- Special Thank you Message from the Restaurant -->
    <ThankYouFromRestaurant
      v-if="!canceled && mode !== 'mo'"
      :shopInfo="shopInfo"
    />

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
    <div class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
      <!-- Left -->
      <div>
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-30">
          <div v-if="paid">
            {{ $t("order.yourOrder") + ": " + orderName }}
          </div>
        </div>

        <!-- Details -->
        <div class="mt-2">
          <order-info
            :shopInfo="shopInfo || {}"
            :orderItems="this.orderItems"
            :orderInfo="this.orderInfo || {}"
            :groupData="groupData"
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
        <template v-if="paid && hasMemo">
          <div class="bg-white rounded-lg p-4 shadow mt-4">
            <div class="text-xs font-bold text-black text-opacity-60">
              {{ $t("order.orderMessage") }}
            </div>
            <div class="mt-1 text-base">{{ orderInfo.memo }}</div>
          </div>
        </template>

        <!-- Canceled Message -->
        <div
          v-if="canceled"
          class="mt-6 bg-red-700 bg-opacity-10 rounded-lg p-4 text-center"
        >
          <span class="text-base font-bold text-red-700">{{
            $t("order.cancelOrderComplete")
          }}</span>
        </div>

        <!-- Receipt -->
        <template v-if="order_accepted && hasStripe">
          <Receipt />
        </template>

        <!-- View Menu Page Button -->
        <div v-if="paid" class="mt-6 text-center">
          <b-button class="b-reset-tw" @click="handleOpenMenu">
            <div
              class="inline-flex justify-center items-center h-12 px-6 rounded-full border-2 border-op-teal"
            >
              <div class="text-base font-bold text-op-teal">
                {{ $t("order.menu") }}
              </div>
            </div>
          </b-button>
        </div>
      </div>

      <!-- Right -->
      <div class="mt-4 lg:mt-0">
        <!-- (After Paid) Restaurant Details -->
        <div v-if="paid">
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

            <div class="bg-white rounded-lg shadow p-4 mt-2 text-center">
              <qrcode
                :value="urlAdminOrderPage"
                :options="{ width: 160 }"
              ></qrcode>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";

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

import { db } from "@/plugins/firebase";
import { orderPlace } from "@/lib/firebase/functions";

import { order_status } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { stripeCancelIntent } from "@/lib/stripe/stripe";

import * as analyticsUtil from "@/lib/firebase/analytics";

import { isEmpty } from "@/utils/utils";

export default {
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
      type: Object,
      required: true,
    },
    orderInfo: {
      type: Object,
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
    mode: {
      type: String,
      required: false,
    },
    groupData: {
      type: Object,
      required: false,
    },
  },
  computed: {
    hasStripe() {
      return this.orderInfo.payment && this.orderInfo.payment.stripe;
    },
    hasLineUrl() {
      return this.shopInfo.lineUrl;
    },
    urlAdminOrderPage() {
      return `${
        location.origin
      }/admin/restaurants/${this.restaurantId()}/orders/${this.orderId}`;
    },
    timeRequested() {
      const date = this.orderInfo.timePlaced.toDate();
      return this.$d(date, "long");
    },
    timeEstimated() {
      if (this.orderInfo.timeEstimated) {
        const date = this.orderInfo.timeEstimated.toDate();
        return this.$d(date, "long");
      }
      return undefined; // backward compatibility
    },
    orderName() {
      return nameOfOrder(this.orderInfo);
    },
    just_paid() {
      return this.orderInfo.status === order_status.order_placed;
    },
    canceled() {
      return this.orderInfo.status === order_status.order_canceled;
    },
    paid() {
      return this.orderInfo.status >= order_status.order_placed;
    },
    order_accepted() {
      return this.orderInfo.status >= order_status.order_accepted;
    },
    hasCustomerInfo() {
      return this.orderInfo.status > order_status.validation_ok;
    },
    orderId() {
      return this.$route.params.orderId;
    },
    hasMemo() {
      return this.orderInfo && !isEmpty(this.orderInfo.memo);
    },
  },
  // end of computed
  methods: {
    sendRedunded() {
      analyticsUtil.sendRedunded(
        this.orderInfo,
        this.orderId,
        this.shopInfo,
        this.restaurantId()
      );
    },

    handleOpenMenu() {
      this.$emit("handleOpenMenu");
    },
    async handleCancelPayment() {
      this.$store.commit("setAlert", {
        code: "order.cancelOrderConfirm",
        callback: async () => {
          try {
            this.$store.commit("setLoading", true);
            const { data } = await stripeCancelIntent({
              restaurantId: this.restaurantId() + this.forcedError("cancel"),
              orderId: this.orderId,
            });
            this.sendRedunded();
            console.log("cancel", data);
          } catch (error) {
            // BUGBUG: Implement the error handling code here
            console.error(error.message, error.details);
            this.$store.commit("setErrorMessage", {
              code: "order.cancel",
              error,
            });
          } finally {
            this.$store.commit("setLoading", false);
          }
        },
      });
    },
  },
};
</script>