<template>
  <div>
    <template v-if="!isUser && !isLiffUser">
      <RequireLogin :loginVisible="loginVisible" @dismissed="handleDismissed" />
    </template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else-if="orderError">
      <div class="mt-4 mx-6">
        <div class="text-xl font-bold text-center">
          {{ $t("order.orderErrorMessage") }}
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Back Button (Edit Order) -->
      <div v-if="just_validated" class="mt-6 mx-6">
        <b-button
          :loading="isDeleting"
          @click="handleOpenMenu"
          class="b-reset-tw"
        >
          <div
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal mr-2">arrow_back</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("button.back") }}
            </div>
          </div>
        </b-button>
      </div>

      <!-- Restaurant Profile Photo and Name -->
      <div class="mt-4">
        <shop-header :shopInfo="shopInfo"></shop-header>
      </div>

      <!-- After Paid -->
      <div v-if="paid">
        <!-- Thank you Message -->
        <ThankYou />

        <!-- Line Button -->
        <LineButton :groupData="groupData" />

        <!-- Order Status -->
        <OrderStatus :orderInfo="orderInfo" :orderName="orderName" />

        <!-- Time to Pickup -->
        <div v-if="waiting && !shopInfo.isEC" class="mt-4 text-sm text-center">
          <div>
            {{ $t("order.timeRequested") + ": " + timeRequested }}
          </div>
          <div v-if="timeEstimated">
            {{ $t("order.timeToPickup") + ": " + timeEstimated }}
          </div>
        </div>

        <!-- Stripe status -->
        <StripeStatus v-if="hasStripe" :orderInfo="orderInfo" />

        <!-- Cancel Button -->
        <div class="mt-6 text-center">
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
        <ThankYouFromRestaurant v-if="!canceled" :shopInfo="shopInfo" />

        <!-- Favorite Button -->
        <div class="mt-4 mx-6 bg-black bg-opacity-5 rounded-lg p-4 text-center">
          <div>
            <favorite-button :shopInfo="shopInfo"></favorite-button>
          </div>
        </div>

        <!-- Restaurant LINE -->
        <RestaurantLine v-if="hasLineUrl" :shopInfo="shopInfo" />
      </div>
      <!-- end Of After Paid -->

      <!-- Before Paid -->
      <div v-else class="mt-4 mx-6">
        <BeforePaidAlert :orderInfo="orderInfo" :shopInfo="shopInfo" />
      </div>
      <!-- end of Before Paid -->

      <!-- customer info -->
      <div
        v-if="orderInfo.phoneNumber && !shopInfo.isEC"
        class="mt-4 text-center"
      >
        <div class="text-base font-bold">
          {{ $t("order.customerInfo") }}
        </div>
        <div class="text-xs font-bold">
          {{ $t("sms.phonenumber") }}
        </div>
        <div class="text-base mt-1">
          <div>
            <a :href="nationalPhoneURI" class="text-base font-bold">{{
              nationalPhoneNumber
            }}</a>
          </div>
          <div class="text-base">{{ orderInfo.name }}</div>
        </div>
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
            <div v-else>
              {{ $t("order.confirmOrder") }}
            </div>
          </div>

          <!-- Details -->
          <div class="mt-2">
            <order-info
              :shopInfo="shopInfo || {}"
              :orderItems="this.orderItems"
              :orderInfo="this.orderInfo || {}"
              :shippingCost="shippingCost"
              @change="handleTipChange"
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
            <CustomerInfo
              :shopInfo="shopInfo"
              :orderId="orderId"
              :phoneNumber="nationalPhoneNumber"
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

          <!-- Validating -->
          <b-notification :closable="false" v-if="newOrder">
            {{ $t("order.validating") }}
            <b-loading
              :is-full-page="false"
              :active.sync="newOrder"
              :can-cancel="true"
            ></b-loading>
          </b-notification>
        </div>

        <!-- Right -->
        <div class="mt-4 lg:mt-0">
          <!-- (Before Paid) Order Details -->
          <div v-if="just_validated">
            <!-- For EC and Delivery -->
            <div
              v-if="shopInfo.isEC || orderInfo.isDelivery"
              class="text-xl font-bold text-black text-opacity-30"
            >
              {{ $t("order.ec.formtitle") }}
            </div>

            <!-- For EC and Delivery -->
            <div
              v-if="shopInfo.isEC || orderInfo.isDelivery"
              class="bg-white rounded-lg shadow p-4 mb-4 mt-2"
            >
              <ECCustomer
                ref="ecCustomerRef"
                :user="user"
                :shopInfo="shopInfo"
                :orderInfo="orderInfo"
                @updateLocation="updateLocation"
              />
            </div>
            <!-- End of EC and Delivery -->

            <!-- map for delivery -->
            <div class="mt-4" v-if="orderInfo.isDelivery">
              <span
                v-if="
                  $refs.ecCustomerRef &&
                  $refs.ecCustomerRef.ecErrors['location'].length > 0
                "
                class="text-red-700 font-bold"
              >
                <div
                  v-for="(error, key) in $refs.ecCustomerRef.ecErrors[
                    'location'
                  ]"
                >
                  {{ $t(error) }}
                </div>
              </span>
              <OrderPageMap
                ref="orderPageMapRef"
                @updateHome="updateHome"
                :shopInfo="shopInfo"
                :fullAddress="
                  $refs.ecCustomerRef && $refs.ecCustomerRef.fullAddress
                "
                :deliveryInfo="deliveryData"
              />
            </div>

            <!-- Time to Pickup -->
            <div v-if="!shopInfo.isEC">
              <div class="text-xl font-bold text-black text-opacity-30">
                <span v-if="orderInfo.isDelivery">
                  {{ $t("order.deliveryTimeRequested") }}
                </span>
                <span v-else>
                  {{ $t("order.timeRequested") }}
                </span>
              </div>

              <div class="mt-2">
                <time-to-pickup
                  v-if="shopInfo.businessDay"
                  :shopInfo="shopInfo"
                  :isDelivery="orderInfo.isDelivery || false"
                  ref="time"
                  @notAvailable="handleNotAvailable"
                />
              </div>
            </div>

            <!-- Order Notice -->
            <OrderNotice :shopInfo="shopInfo" />

            <!-- Message -->
            <template v-if="shopInfo && shopInfo.acceptUserMessage">
              <div class="mt-6">
                <div class="text-xl font-bold text-black text-opacity-30">
                  {{ $t("order.orderMessage") }}
                </div>

                <div class="bg-white rounded-lg shadow p-4 mt-2">
                  <b-input
                    v-model="memo"
                    type="textarea"
                    :placeholder="$t('order.enterMessage')"
                    class="w-full"
                  ></b-input>
                </div>
              </div>
            </template>

            <!-- Payment -->
            <div class="mt-6">
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("order.yourPayment") }}
              </div>

              <!-- Pay Online -->
              <div v-if="showPayment" class="mt-2">
                <stripe-card
                  @change="handleCardStateChange"
                  ref="stripe"
                  :stripeJCB="stripeJCB"
                ></stripe-card>

                <div class="mt-6 text-center">
                  <b-button
                    :loading="isPaying"
                    :disabled="
                      !cardState.complete || notAvailable || notSubmitAddress
                    "
                    @click="handlePayment"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                      style="min-width: 288px"
                    >
                      <div class="text-xl font-bold text-white">
                        {{ $t("order.placeOrder") }}
                        <!-- {{ $n(orderInfo.total + tip, "currency") }} -->
                      </div>
                    </div>
                  </b-button>
                </div>
              </div>

              <!-- Pay at Restaurant -->
              <div v-else class="mt-2">
                <div class="bg-black bg-opacity-5 rounded-lg p-4">
                  <div class="text-sm">
                    {{ $t("order.pleasePayAtRestaurant") }}
                  </div>
                </div>
              </div>

              <!-- Pay Button -->
              <div v-if="inStorePayment" class="mt-4 text-center">
                <div class="text-sm font-bold text-black text-opacity-60">
                  {{ $t("order.or") }}
                </div>

                <div class="mt-4">
                  <b-button
                    :loading="isPlacing"
                    :disabled="notAvailable || notSubmitAddress"
                    @click="handleNoPayment"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                      style="min-width: 288px"
                    >
                      <div class="text-xl font-bold text-white">
                        {{ $t("order.placeOrderNoPayment") }}
                      </div>
                    </div>
                  </b-button>
                </div>

                <div class="mt-2 text-sm font-bold text-black text-opacity-60">
                  {{ $t("order.placeOrderNoPaymentNote") }}
                </div>
              </div>

              <!-- Error message for ec and delivery -->
              <div
                v-if="
                  requireAddress &&
                  $refs.ecCustomerRef &&
                  $refs.ecCustomerRef.hasEcError
                "
                class="text-center text-red-700 font-bold mt-2"
              >
                {{ $t("order.alertReqireAddress") }}
              </div>

              <!-- Send SMS Checkbox -->
              <div v-if="!isLineEnabled" class="mt-6">
                <div class="bg-black bg-opacity-5 rounded-lg p-4">
                  <b-checkbox v-model="sendSMS">
                    <div class="text-sm font-bold">
                      {{ $t("order.sendSMS") }}
                    </div>
                  </b-checkbox>
                </div>
              </div>
            </div>
          </div>
          <!-- end of just_validated >

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
    </template>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import ShopHeader from "@/app/user/Restaurant/ShopHeader";
import OrderInfo from "@/app/user/Order/OrderInfo";
import ShopInfo from "@/app/user/Restaurant/ShopInfo";
import StripeCard from "@/app/user/Order/StripeCard";
import TimeToPickup from "@/app/user/Order/TimeToPickup";
import PhoneLogin from "@/app/auth/PhoneLogin";
import NotFound from "@/components/NotFound";
import RequireLogin from "@/components/RequireLogin";
import FavoriteButton from "@/app/user/Restaurant/FavoriteButton";
import CustomerInfo from "@/components/CustomerInfo";

import OrderPageMap from "./OrderPageMap.vue";

import ThankYou from "./OrderPage/AfterPaid/ThankYou.vue";
import ThankYouFromRestaurant from "./OrderPage/AfterPaid/ThankYouFromRestaurant.vue";
import LineButton from "./OrderPage/AfterPaid/LineButton.vue";
import RestaurantLine from "./OrderPage/AfterPaid/RestaurantLine.vue";
import StripeStatus from "./OrderPage/AfterPaid/StripeStatus.vue";
import OrderStatus from "./OrderPage/AfterPaid/OrderStatus.vue";
import Receipt from "./OrderPage/AfterPaid/Receipt.vue";

import ECCustomer from "./OrderPage/ECCustomer.vue";
import OrderNotice from "./OrderPage/OrderNotice.vue";

import BeforePaidAlert from "./OrderPage/BeforePaid/BeforePaidAlert.vue";

import { db, firestore } from "@/plugins/firebase";
import { orderPlace } from "@/lib/firebase/functions";

import { order_status, order_status_keys } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import {
  stripeCreateIntent,
  stripeCancelIntent,
  stripeReceipt,
} from "@/lib/stripe/stripe";

import { costCal } from "@/utils/commonUtils";

import * as analyticsUtil from "@/lib/firebase/analytics";

import isEmail from "validator/lib/isEmail";

import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";
import { isEmpty, getOrderItems } from "@/utils/utils";

export default {
  name: "Order",
  metaInfo() {
    return {
      title:
        this.shopInfo?.restaurantName && this.statusKey
          ? [
              this.defaultTitle,
              this.shopInfo ? this.shopInfo?.restaurantName : "--",
              "Order Page",
              this.$t("order.status." + this.statusKey),
            ].join(" / ")
          : [this.defaultTitle, "Order Page"].join(" / "),
    };
  },
  components: {
    ShopHeader,
    OrderInfo,
    PhoneLogin,
    ShopInfo,
    StripeCard,
    TimeToPickup,
    NotFound,
    RequireLogin,
    CustomerInfo,
    OrderPageMap,
    FavoriteButton,
    // after paid components
    ThankYou,
    ThankYouFromRestaurant,
    LineButton,
    RestaurantLine,
    StripeStatus,
    OrderStatus,
    Receipt,

    BeforePaidAlert,

    ECCustomer,
    OrderNotice,
  },
  props: {
    shopInfo: {
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
    notFound: {
      type: Boolean,
      required: false,
    },
    mode: {
      type: String,
      required: false,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    groupData: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      notAvailable: false,
      loginVisible: false,
      isPaying: false,
      restaurantsId: this.restaurantId(),
      addressList: [],
      cardState: {},
      orderInfo: {},
      customer: {},
      menuObj: null,
      detacher: [],
      isDeleting: false,
      isPlacing: false,
      tip: 0,
      sendSMS: true,
      postageInfo: {},
      memo: "",
    };
  },
  created() {
    if (this.isUser || this.isLiffUser) {
      this.loadUserData();
    } else if (!this.isUser) {
      this.loginVisible = true;
    }
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map((detacher) => {
        detacher();
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === "r-restaurantId") {
      this.deleteOrderInfo();
    }
    next();
  },
  computed: {
    statusKey() {
      return this.orderInfo ? order_status_keys[this.orderInfo.status] : null;
    },
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
    showPayment() {
      return this.stripeAccount;
    },
    stripeAccount() {
      return this.paymentInfo.stripe;
    },
    stripeJCB() {
      return this.paymentInfo.stripeJCB === true;
    },
    inStorePayment() {
      return this.paymentInfo.inStore;
    },
    orderName() {
      return nameOfOrder(this.orderInfo);
    },
    orderError() {
      return this.orderInfo.status === order_status.error;
    },
    newOrder() {
      return this.orderInfo.status === order_status.new_order;
    },
    just_validated() {
      return this.orderInfo.status === order_status.validation_ok;
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
    waiting() {
      return this.orderInfo.status < order_status.cooking_completed;
    },
    hasCustomerInfo() {
      return this.orderInfo.status > order_status.validation_ok;
    },
    orderItems() {
      return getOrderItems(this.orderInfo, this.menuObj);
    },
    orderId() {
      return this.$route.params.orderId;
    },
    hasMemo() {
      return this.orderInfo && !isEmpty(this.orderInfo.memo);
    },
    phoneNumber() {
      return (
        this.orderInfo &&
        this.orderInfo.phoneNumber &&
        parsePhoneNumber(this.orderInfo.phoneNumber)
      );
    },
    nationalPhoneNumber() {
      return this.phoneNumber ? formatNational(this.phoneNumber) : "";
    },
    nationalPhoneURI() {
      return formatURL(this.phoneNumber);
    },
    shippingCost() {
      return costCal(
        this.postageInfo,
        this.$refs?.ecCustomerRef?.customerInfo?.prefectureId,
        this.orderInfo.total
      );
    },
    requireAddress() {
      return this.shopInfo.isEC || this.orderInfo.isDelivery;
    },
    notSubmitAddress() {
      return this.requireAddress && this.$refs?.ecCustomerRef.hasEcError;
    },
  },
  // end of computed
  watch: {
    shopInfo(newValue) {
      if (this.shopInfo.isEC) {
        db.doc(`restaurants/${this.restaurantId()}/ec/postage`)
          .get()
          .then((snapshot) => {
            this.postageInfo = snapshot.data() || {};
          });
      }
    },
    isUser() {
      if (this.isUser) {
        this.loadUserData();
      }
    },
    isLiffUser() {
      if (this.isLiffUser) {
        this.loadUserData();
      }
    },
  },
  methods: {
    updateHome(pos) {
      this.$refs.ecCustomerRef.updateHome(pos);
    },
    updateLocation(pos) {
      this.$refs.orderPageMapRef.updateLocation(pos);
    },
    sendPurchase() {
      analyticsUtil.sendPurchase(
        this.orderInfo,
        this.orderId,
        this.orderItems.map((or) => {
          return { ...or.item, id: or.id, quantity: or.count };
        }),
        this.shopInfo,
        this.restaurantId()
      );
    },
    sendRedunded() {
      analyticsUtil.sendRedunded(
        this.orderInfo,
        this.orderId,
        this.shopInfo,
        this.restaurantId()
      );
    },
    loadUserData() {
      const order_detacher = db
        .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
        .onSnapshot(
          async (order) => {
            const order_data = order.exists ? order.data() : {};
            this.orderInfo = order_data;
            // console.log("*** O", this.orderInfo);
            if (this.orderInfo.menuItems) {
              this.menuObj = this.orderInfo.menuItems;
            } else {
              // Backward compatibility
              if (!this.menuObj) {
                const menu = await db
                  .collection(`restaurants/${this.restaurantId()}/menus`)
                  .get();
                if (!menu.empty) {
                  const menus = menu.docs.map(this.doc2data("menu"));
                  this.menuObj = this.array2obj(menus);
                }
              }
            }
            if (this.just_validated) {
              analyticsUtil.sendViewCart(
                this.orderInfo,
                this.orderId,
                this.orderItems.map((or) => {
                  return { ...or.item, id: or.id, quantity: or.count };
                }),
                this.shopInfo,
                this.restaurantId()
              );
            }
          },
          (error) => {
            this.notFound = true;
          }
        );
      this.detacher = [order_detacher];
    },

    handleOpenMenu() {
      if (this.inLiff) {
        this.$router.push(this.liff_base_path + "/r/" + this.restaurantId());
      } else if (this.mode === "mo") {
        this.$router.push(`/${this.moPrefix}/r/${this.restaurantId()}`);
      } else {
        this.$router.push(`/r/${this.restaurantId()}`);
      }
    },
    handleNotAvailable(flag) {
      console.log("handleNotAvailable", flag);
      this.notAvailable = flag;
    },
    handleTipChange(tip) {
      //console.log("handleTipChange", tip);
      this.tip = tip;
    },
    handleCardStateChange(state) {
      this.cardState = state;
    },
    handleDismissed(params) {
      console.log("handleDismissed", params);
      // The user has dismissed the login dialog (including the successful login)
      this.loginVisible = false;
    },
    async deleteOrderInfo() {
      try {
        this.isDeleting = true;
        await db
          .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
          .delete();
        console.log("suceeded");
      } catch (error) {
        this.isDeleting = false;
        console.log("failed");
      }
    },
    async saveLiffCustomer() {
      const uid = this.user.uid;
      const data = {
        uid,
        restaurantId: this.restaurantId(),
        name: this.orderInfo.name || "",
        orderId: this.orderId, //  (this is last)
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
    },
    async handlePayment() {
      if (this.requireAddress) {
        if (this.$refs.ecCustomerRef.hasEcError) {
          return;
        }
        if (this.isSaveAddress) {
          await this.saveAddress();
        }
      }

      const timeToPickup = this.shopInfo.isEC
        ? firebase.firestore.Timestamp.now()
        : this.$refs.time.timeToPickup();

      this.isPaying = true;
      try {
        await this.$refs.stripe.createToken();
        const { data } = await stripeCreateIntent({
          timeToPickup,
          restaurantId: this.restaurantId() + this.forcedError("intent"),
          orderId: this.orderId,
          description: `${this.orderName} ${this.shopInfo.restaurantName} ${this.shopInfo.phoneNumber}`,
          sendSMS: this.sendSMS,
          tip: this.tip || 0,
          memo: this.memo || "",
          customerInfo: this.$refs.ecCustomerRef.customerInfo || {},
        });
        if (this.isLiffUser) {
          await this.saveLiffCustomer();
        }
        this.sendPurchase();
        this.$store.commit("resetCart", this.restaurantId());
        console.log("createIntent", data);
        window.scrollTo(0, 0);
      } catch (error) {
        // alert(JSON.stringify(error));
        console.error(error.message, error.details);
        let error_code = "stripe.intent";
        if (
          error.details &&
          error.details.code === "card_declined" &&
          error.details.decline_code === "card_not_supported" &&
          !this.stripeJCB
        ) {
          console.log("JCB");
          error_code = "stripe.NoJCB";
        }
        this.$store.commit("setErrorMessage", {
          code: error_code,
          error,
        });
      } finally {
        this.isPaying = false;
      }
    },
    async handleNoPayment() {
      console.log(this.requireAddress, this.isSaveAddress);
      if (this.requireAddress) {
        if (this.$refs.ecCustomerRef.hasEcError) {
          return;
        }
        if (this.isSaveAddress) {
          await this.saveAddress();
        }
      }
      const timeToPickup = this.shopInfo.isEC
        ? firebase.firestore.Timestamp.now()
        : this.$refs.time.timeToPickup();
      try {
        this.isPlacing = true;
        const { data } = await orderPlace({
          restaurantId: this.restaurantId() + this.forcedError("place"),
          timeToPickup,
          orderId: this.orderId,
          sendSMS: this.sendSMS,
          tip: this.tip || 0,
          memo: this.memo || "",
          customerInfo: this.$refs.ecCustomerRef.customerInfo || {},
        });
        if (this.isLiffUser) {
          await this.saveLiffCustomer();
        }
        console.log("place", data);
        this.sendPurchase();
        this.$store.commit("resetCart", this.restaurantId());
        window.scrollTo(0, 0);
      } catch (error) {
        // alert(JSON.stringify(error));
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "order.place",
          error,
        });
      } finally {
        this.isPlacing = false;
      }
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
