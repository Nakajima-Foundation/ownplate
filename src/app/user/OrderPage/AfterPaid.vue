<template>
  <div>
    <!-- Restaurant Profile Photo and Name -->
    <div class="afterPaid mt-4">
      <shop-header :shopInfo="shopInfo"></shop-header>
    </div>

    <!-- After Paid -->
    <!-- Thank you Message -->
    <ThankYou v-if="mode !== 'mo'" />

    <!-- Line Button -->
    <LineButton :groupData="groupData" />

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
        :paid="paid"
        :mode="mode"
      />

      <!-- Stripe status -->
      <StripeStatus v-if="hasStripe" :orderInfo="orderInfo" :mode="mode" />

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
    <div class="mx-6 mt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
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
            :orderItems="orderItems"
            :orderInfo="orderInfo || {}"
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
        <template v-if="order_accepted && hasStripe">
          <Receipt />
        </template>

        <!-- View Menu Page Button -->
        <div v-if="paid" class="mt-6 text-center">
          <o-button class="b-reset-tw" @click="handleOpenMenu">
            <div
              class="inline-flex h-12 items-center justify-center rounded-full border-2 border-op-teal px-6"
            >
              <div class="text-base font-bold text-op-teal">
                {{ $t("order.menu") }}
              </div>
            </div>
          </o-button>
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
                  : $t(
                      mode === "mo"
                        ? "mobileOrder.storeDetails"
                        : "shopInfo.restaurantDetails"
                    )
              }}
            </div>

            <div class="mt-2">
              <shop-info
                :compact="true"
                :shopInfo="shopInfo"
                :isDelivery="orderInfo.isDelivery"
                :mode="mode"
                :isPickup="isPickup"
                :paymentInfo="paymentInfo"
              />
            </div>
          </div>

          <!-- QR Code -->
          <div class="mt-6" v-if="!shopInfo.isEC">
            <div class="text-xl font-bold text-black text-opacity-30">
              {{
                $t(
                  mode === "mo"
                    ? "mobileOrder.adminQRCode"
                    : "order.adminQRCode"
                )
              }}
            </div>

            <div class="mt-2 rounded-lg bg-white p-4 text-center shadow">
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

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  PropType,
} from "@vue/composition-api";
  
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

import { orderPlace } from "@/lib/firebase/functions";

import { order_status } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { stripeCancelIntent } from "@/lib/stripe/stripe";

import * as analyticsUtil from "@/lib/firebase/analytics";

import { isEmpty, validUrl } from "@/utils/utils";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

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
    mode: {
      type: String,
      required: false,
    },
    groupData: {
      type: Object,
      required: false,
    },
  },
  setup(props, ctx) {
    const orderId = ctx.root.$route.params.orderId;
    const restaurantId = ctx.root.$route.params.restaurantId;

    const hasStripe = computed(() => {
      return props.orderInfo.payment && props.orderInfo.payment.stripe;
    });
    const hasLineUrl = computed(() => {
      return props.shopInfo.lineUrl && validUrl(props.shopInfo.lineUrl);
    });
    const urlAdminOrderPage = computed(() => {
      return `${
        location.origin
      }/admin/restaurants/${restaurantId}/orders/${orderId}`;
    });
    const timeRequested = computed(() => {
      const date = props.orderInfo.timePlaced.toDate();
      return ctx.root.$d(date, "long");
    });
    const timeEstimated = computed(() => {
      if (props.orderInfo.timeEstimated) {
        const date = props.orderInfo.timeEstimated.toDate();
        return ctx.root.$d(date, "long");
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
    const paid = computed(() => {
      return props.orderInfo.status >= order_status.order_placed;
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
    const isPickup = computed(() => {
      return props.orderInfo && props.orderInfo.isPickup;
    });
    if (props.mode == "mo") {
      const menus = Object.keys(props.orderInfo.menuItems).map((menuId) => {
        return {
          ...props.orderInfo.menuItems[menuId],
          id: menuId,
        } as any;
      });

      const data = analyticsUtil.getDataForLayer(
        props.orderInfo,
        orderId,
        menus,
        props.shopInfo,
        restaurantId
      );
      // console.log(data);
      dataLayer.push({ ecommerce: null }); // Clear the previous ecommerce object.
      dataLayer.push({
        event: "purchase",
        ecommerce: data,
      });
    }

    const sendRedunded = () => {
      analyticsUtil.sendRedunded(
        props.orderInfo,
        orderId,
        props.shopInfo,
        restaurantId
      );
    };
    const handleOpenMenu = () => {
      ctx.emit("handleOpenMenu");
    };
    const handleCancelPayment = () => {
      ctx.root.$store.commit("setAlert", {
        code: "order.cancelOrderConfirm",
        callback: async () => {
          try {
            ctx.root.$store.commit("setLoading", true);
            const { data } = await stripeCancelIntent({
              restaurantId: restaurantId,
              orderId: orderId,
            });
            sendRedunded();
            // console.log("cancel", data);
          } catch (error) {
            // BUGBUG: Implement the error handling code here
            // console.error(error.message, error.details);
            ctx.root.$store.commit("setErrorMessage", {
              code: "order.cancel",
              error,
            });
          } finally {
            ctx.root.$store.commit("setLoading", false);
          }
        },
      });
    };
    return {
      orderId,
      // computed
      hasStripe,
      hasLineUrl,
      urlAdminOrderPage,
      timeRequested,
      timeEstimated,
      orderName,
      just_paid,
      canceled,
      paid,
      order_accepted,
      hasCustomerInfo,
      hasMemo,
      isPickup,
      // method
      handleOpenMenu,
      handleCancelPayment,
    };
  },
});
</script>
