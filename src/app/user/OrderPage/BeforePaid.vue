<template>
  <div>
    <!-- Back Button (Edit Order) -->
    <div class="mt-6 mx-6">
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

    <!-- Before Paid -->
    <div class="mt-4 mx-6">
      <BeforePaidAlert :orderInfo="orderInfo" :shopInfo="shopInfo" />
    </div>
    <!-- end of Before Paid -->

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
          <div>
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
            :groupData="groupData"
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
          <UserCustomerInfo
            :shopInfo="shopInfo"
            :orderInfo="orderInfo"
            :orderId="orderId"
          />
        </div>
      </div>

      <!-- Right -->
      <div class="mt-4 lg:mt-0">
        <div>
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
                v-for="(error, key) in $refs.ecCustomerRef.ecErrors['location']"
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
                :orderInfo="orderInfo"
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
            <div
              class="mt-6"
              :class="
                userMessageError ? 'p-2 rounded border-4 border-red-700' : ''
              "
            >
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
                <div :class="userMessageError ? 'text-red-700 font-bold' : ''">
                  {{ $t("validationError.memo.length") }}
                </div>
              </div>
            </div>
          </template>

          <!--Act on Specified Commercial Transactions -->
          <div class="mt-6">
            <SpecifiedCommercialTransactions
              :shopInfo="shopInfo"
              @openTransactionsAct="openTransactionsAct()"
            />
          </div>

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
                    !cardState.complete ||
                    notAvailable ||
                    notSubmitAddress ||
                    userMessageError ||
                    stripeSmallPayment
                  "
                  @click="handlePayment"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                    style="min-width: 288px"
                  >
                    <div class="text-xl font-bold text-white">
                      {{
                        mode === "mo"
                          ? $t("order.placeOrderMo")
                          : $t("order.placeOrder")
                      }}
                      <!-- {{ $n(orderInfo.total + tip, "currency") }} -->
                    </div>
                  </div>
                </b-button>
                <div
                  v-if="mode !== 'mo' && stripeSmallPayment"
                  class="text-sm font-bold text-red-700 mt-2 text-opacity-60"
                >
                  {{ $t("errorPage.code.smallPayment") }}
                </div>
              </div>
              <div v-if="mode === 'mo'">
                <div
                  class="mt-2 text-center text-xs text-black text-opacity-50"
                >
                  {{ $t("order.placeOrderMoNote") }}
                </div>
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
                  :disabled="notAvailable || notSubmitAddress || userMessageError"
                  @click="handleNoPayment"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                    style="min-width: 288px"
                  >
                    <div class="text-xl font-bold text-white">
                      {{
                        mode === "mo"
                          ? $t("order.placeOrderNoPaymentMo")
                          : $t("order.placeOrderNoPayment")
                      }}
                    </div>
                  </div>
                </b-button>
              </div>
              <div v-if="mode !== 'mo'">
                <div class="mt-2 text-sm font-bold text-black text-opacity-60">
                  {{ $t("order.placeOrderNoPaymentNote") }}
                </div>
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
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";

import ShopHeader from "@/app/user/Restaurant/ShopHeader.vue";
import FavoriteButton from "@/app/user/Restaurant/FavoriteButton.vue";

import OrderInfo from "@/app/user/OrderPage/OrderInfo.vue";
import UserCustomerInfo from "@/app/user/OrderPage/UserCustomerInfo.vue";
import CustomerInfo from "@/app/user/OrderPage/CustomerInfo.vue";

import StripeCard from "@/app/user/OrderPage/BeforePaid/StripeCard.vue";
import TimeToPickup from "@/app/user/OrderPage/BeforePaid/TimeToPickup.vue";
import ECCustomer from "@/app/user/OrderPage/BeforePaid/ECCustomer.vue";
import OrderNotice from "@/app/user/OrderPage/BeforePaid/OrderNotice.vue";
import BeforePaidAlert from "@/app/user/OrderPage/BeforePaid/BeforePaidAlert.vue";
import SpecifiedCommercialTransactions from "@/app/user/OrderPage/BeforePaid/SpecifiedCommercialTransactions.vue";
import OrderPageMap from "@/app/user/OrderPage/BeforePaid/Map.vue";

import { db, firestore } from "@/plugins/firebase";
import { orderPlace } from "@/lib/firebase/functions";

import { order_status } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { stripeCreateIntent, stripeReceipt } from "@/lib/stripe/stripe";

import { costCal } from "@/utils/commonUtils";

import * as analyticsUtil from "@/lib/firebase/analytics";

export default {
  name: "Order",
  components: {
    ShopHeader,
    FavoriteButton,

    OrderInfo,
    UserCustomerInfo,
    CustomerInfo,

    // before paid
    StripeCard,
    TimeToPickup,
    ECCustomer,
    OrderNotice,
    BeforePaidAlert,
    SpecifiedCommercialTransactions,
    OrderPageMap,
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
    deliveryData: {
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
  data() {
    return {
      notAvailable: false,
      isPaying: false,
      cardState: {},

      isDeleting: false,
      isPlacing: false,
      tip: 0,
      sendSMS: true,
      postageInfo: {},
      memo: "",
    };
  },
  created() {
    this.setPostage();
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === "r-restaurantId") {
      this.deleteOrderInfo();
    }
    next();
  },
  computed: {
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
    hasCustomerInfo() {
      return this.orderInfo.status > order_status.validation_ok;
    },
    orderId() {
      return this.$route.params.orderId;
    },
    stripeSmallPayment() {
      return this.orderInfo.total <= 50;
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
      return this.requireAddress && this.$refs?.ecCustomerRef?.hasEcError;
    },
    userMessageError() {
      return this.shopInfo.acceptUserMessage && this.memo.length > 500;
    },
  },
  // end of computed
  watch: {
    shopInfo(newValue) {
      this.setPostage();
    },
  },
  methods: {
    setPostage() {
      if (this.shopInfo.isEC) {
        db.doc(`restaurants/${this.restaurantId()}/ec/postage`)
          .get()
          .then((snapshot) => {
            this.postageInfo = snapshot.data() || {};
          });
      }
    },
    updateHome(pos) {
      this.$refs.ecCustomerRef.updateHome(pos);
    },
    updateLocation(pos) {
      if (this.$refs.orderPageMapRef) {
        this.$refs.orderPageMapRef.updateLocation(pos);
      }
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

    handleOpenMenu() {
      this.$emit("handleOpenMenu");
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
      if (this.userMessageError) {
        return;
      }
      if (this.requireAddress) {
        if (this.$refs.ecCustomerRef.hasEcError) {
          return;
        }
        if (this.$refs.ecCustomerRef.isSaveAddress) {
          await this.$refs.ecCustomerRef.saveAddress();
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
          customerInfo: this.$refs.ecCustomerRef
            ? this.$refs.ecCustomerRef.customerInfo || {}
            : {},
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
      if (this.userMessageError) {
        return;
      }
      if (this.requireAddress) {
        if (this.$refs.ecCustomerRef && this.$refs.ecCustomerRef.hasEcError) {
          return;
        }
        if (this.$refs.ecCustomerRef.isSaveAddress) {
          await this.$refs.ecCustomerRef.saveAddress();
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
          customerInfo: this.$refs.ecCustomerRef
            ? this.$refs.ecCustomerRef.customerInfo || {}
            : {},
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
    openTransactionsAct() {
      this.$emit("openTransactionsAct");
    },
  },
};
</script>
