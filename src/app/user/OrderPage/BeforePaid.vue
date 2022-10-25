<template>
  <div>
    <!-- Back Button (Edit Order) -->
    <div class="mx-6 mt-6">
      <o-button
        :loading="isDeleting"
        @click="handleOpenMenu"
        class="b-reset-tw"
      >
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">arrow_back</i>
          <div class="text-sm font-bold text-op-teal">
            {{ $t("button.back") }}
          </div>
        </div>
      </o-button>
    </div>

    <!-- Restaurant Profile Photo and Name -->
    <div class="beforePaid mt-4">
      <shop-header :shopInfo="shopInfo"></shop-header>
    </div>

    <!-- Before Paid -->
    <div class="mx-6 mt-4">
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
    <div class="mx-6 mt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
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
            class="mb-4 mt-2 rounded-lg bg-white p-4 shadow"
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
              class="font-bold text-red-700"
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
                userMessageError ? 'rounded border-4 border-red-700 p-2' : ''
              "
            >
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("order.orderMessage") }}
              </div>

              <div class="mt-2 rounded-lg bg-white p-4 shadow">
                <o-input
                  v-model="memo"
                  type="textarea"
                  :placeholder="$t('order.enterMessage')"
                  class="w-full"
                ></o-input>
                <div :class="userMessageError ? 'font-bold text-red-700' : ''">
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

              <div
                v-if="disabledPickupTime"
                class="mx-6 mt-6 text-xs font-bold text-red-700"
              >
                {{ $tc("mobileOrder.shopInfo.pickupNote", 1, { lastOrder }) }}
              </div>

              <div class="mt-6 text-center">
                <o-button
                  :loading="isPaying"
                  :disabled="
                    !cardState.complete ||
                    notAvailable ||
                    notSubmitAddress ||
                    userMessageError ||
                    disabledPickupTime ||
                    stripeSmallPayment
                  "
                  @click="handlePayment(true)"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal px-6 shadow"
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
                </o-button>
                <div
                  v-if="mode !== 'mo' && stripeSmallPayment"
                  class="mt-2 text-sm font-bold text-red-700"
                >
                  {{ $t("errorPage.code.smallPayment") }}
                </div>
              </div>
              <div v-if="mode === 'mo'" class="text-center">
                <div
                  v-if="stripeSmallPayment"
                  class="mt-2 text-sm font-bold text-red-700"
                >
                  <div>
                    {{ $t("mobileOrder.smallPayment1") }}
                  </div>
                  <div>
                    {{ $t("mobileOrder.smallPayment2") }}
                  </div>
                  <div>
                    {{ $t("mobileOrder.smallPayment3") }}
                  </div>
                </div>
                <div
                  v-else
                  class="mt-2 text-center text-xs text-black text-opacity-50"
                >
                  {{ $t("order.placeOrderMoNote") }}
                </div>
              </div>
            </div>

            <!-- Pay at Restaurant -->
            <div v-else class="mt-2">
              <div class="rounded-lg bg-black bg-opacity-5 p-4">
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
                <o-button
                  :loading="isPlacing"
                  :disabled="
                    notAvailable ||
                    notSubmitAddress ||
                    userMessageError ||
                    disabledPickupTime
                  "
                  @click="handlePayment(false)"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal px-6 shadow"
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
                </o-button>
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
              class="mt-2 text-center font-bold text-red-700"
            >
              {{ $t("order.alertReqireAddress") }}
            </div>

            <!-- Send SMS Checkbox -->
            <div v-if="!isLineEnabled" class="mt-6">
              <div class="rounded-lg bg-black bg-opacity-5 p-4">
                <o-checkbox v-model="sendSMS">
                  <div class="text-sm font-bold">
                    {{ $t("order.sendSMS") }}
                  </div>
                </o-checkbox>
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
import { stripeReceipt } from "@/lib/stripe/stripe";

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
    disabledPickupTime: {
      type: Boolean,
      required: true,
    },
    lastOrder: {
      type: String,
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
    async handlePayment(payStripe) {
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
        if (payStripe) {
          this.isPaying = true;
          await this.$refs.stripe.createToken();
        } else {
          this.isPlacing = true;
        }
        const { data } = await orderPlace({
          timeToPickup,
          restaurantId: this.restaurantId(),
          orderId: this.orderId,
          tip: this.tip || 0,
          payStripe,
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
        this.isPaying = false;
      }
    },
    openTransactionsAct() {
      this.$emit("openTransactionsAct");
    },
  },
};
</script>
