<template>
  <div>
    <template v-if="!isUser">
      <RequireLogin :loginVisible="loginVisible" @dismissed="handleDismissed" />
    </template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Back Button (Edit Order) -->
      <div v-if="just_validated" class="mt-6 mx-6">
        <b-button
          :loading="isDeleting"
          @click="handleEditItems"
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
        <div class="mt-4 mx-6">
          <div class="text-xl font-bold text-op-teal text-center">
            {{ $t("order.thankyou") }}
          </div>
          <div class="text-xl font-bold text-op-teal text-center mt-2">
            {{ $t("order.pleaseStay") }}
          </div>
        </div>

        <!-- Line Button -->
        <div v-if="showAddLine" class="mt-6 text-center">
          <b-button @click="handleLineAuth" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center h-12 px-6 rounded-full"
              style="background: #18b900"
            >
              <i class="fab fa-line text-2xl text-white mr-2" />
              <div class="text-base font-bold text-white">
                {{ $t("line.notifyMe") }}
              </div>
            </div>
          </b-button>
        </div>

        <!-- Order Status -->
        <div class="mt-6 text-center">
          <div class="inline-flex space-x-4">
            <div>
              <div class="text-sm font-bold text-black text-opacity-60">
                {{ $t("order.orderStatus") }}
              </div>
              <div
                class="inline-block px-4 py-1 rounded-full mt-2"
                :class="orderStatusKey"
              >
                <div class="text-sm font-bold">
                  {{ $t("order.status." + orderStatusKey) }}
                </div>
              </div>
            </div>
            <div>
              <div class="text-sm font-bold text-black text-opacity-60">
                {{ $t("order.orderId") }}
              </div>
              <div class="mt-1">
                <div class="text-2xl">{{ orderName }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time to Pickup -->
        <div v-if="waiting" class="mt-4 text-sm text-center">
          <div>
            {{ $t("order.timeRequested") + ": " + timeRequested }}
          </div>
          <div v-if="timeEstimated">
            {{ $t("order.timeToPickup") + ": " + timeEstimated }}
          </div>
        </div>

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
        <template
          v-if="
            shopInfo &&
              shopInfo.orderThanks &&
              shopInfo.orderThanks.length > 0 &&
              !canceled
          "
        >
          <div class="mt-6 mx-6 bg-black bg-opacity-5 rounded-lg p-4">
            <div class="text-xs">{{ $t("order.thanksMessage") }}</div>
            <div class="text-base mt-2">{{ shopInfo.orderThanks }}</div>
          </div>
        </template>

        <!-- Restaurant LINE -->
        <div
          v-if="hasLineUrl"
          class="mt-6 mx-6 bg-black bg-opacity-5 rounded-lg p-4 text-center"
        >
          <a target="_blank" :href="this.shopInfo.lineUrl">
            <div
              class="inline-flex justify-center items-center h-12 px-6 rounded-full"
              style="background: #18b900"
            >
              <i class="fab fa-line text-2xl text-white mr-2" />
              <div class="text-base font-bold text-white">
                {{ $t("order.lineLink") }}
              </div>
            </div>
          </a>

          <div class="text-sm mt-2">
            {{ $t("order.lineMessage") }}
          </div>
        </div>
      </div>

      <!-- Before Paid -->
      <div v-else class="mt-4 mx-6">
        <div class="bg-red-700 bg-opacity-10 rounded-lg p-6 text-center">
          <div class="text-base font-bold text-red-700">
            {{ $t("order.orderNotPlacedYet") }}
          </div>
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
              :orderItems="this.orderItems"
              :orderInfo="this.orderInfo || {}"
              @change="handleTipChange"
            ></order-info>
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
            <!-- Time to Pickup -->
            <div>
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("order.timeRequested") }}
              </div>

              <div class="mt-2">
                <time-to-pickup
                  v-if="shopInfo.businessDay"
                  :shopInfo="shopInfo"
                  ref="time"
                  @notAvailable="handleNotAvailable"
                />
              </div>
            </div>

            <!-- Order Notice -->
            <template
              v-if="
                shopInfo &&
                  shopInfo.orderNotice &&
                  shopInfo.orderNotice.length > 0
              "
            >
              <div class="mt-6">
                <div class="text-xl font-bold text-black text-opacity-30">
                  {{ $t("order.orderNotice") }}
                </div>

                <div class="bg-white rounded-lg shadow p-4 mt-2">
                  <div class="flex">
                    <div class="mr-2">
                      <i class="material-icons text-2xl text-red-700">error</i>
                    </div>
                    <div class="flex-1 text-base text-red-700">
                      {{ shopInfo.orderNotice }}
                    </div>
                  </div>
                </div>
              </div>
            </template>

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
                    :disabled="!cardState.complete || notAvailable"
                    @click="handlePayment"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                      style="min-width: 288px;"
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
                    :disabled="notAvailable"
                    @click="handleNoPayment"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                      style="min-width: 288px;"
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

          <!-- (After Paid) Restaurant Details -->
          <div v-if="paid">
            <!-- Restaurant Info -->
            <div>
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("shopInfo.restaurantDetails") }}
              </div>

              <div class="mt-2">
                <shop-info
                  :compact="true"
                  :shopInfo="shopInfo"
                  :paymentInfo="paymentInfo"
                />
              </div>
            </div>

            <!-- QR Code -->
            <div class="mt-6">
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
import ShopHeader from "~/app/user/Restaurant/ShopHeader";
import OrderInfo from "~/app/user/Order/OrderInfo";
import ShopInfo from "~/app/user/Restaurant/ShopInfo";
import StripeCard from "~/app/user/Order/StripeCard";
import TimeToPickup from "~/app/user/Order/TimeToPickup";
import PhoneLogin from "~/app/auth/PhoneLogin";
import NotFound from "~/components/NotFound";
import RequireLogin from "~/components/RequireLogin";

import { db, firestore, functions } from "~/plugins/firebase.js";
import { order_status } from "~/plugins/constant.js";
import { nameOfOrder } from "~/plugins/strings.js";
import { releaseConfig } from "~/plugins/config.js";
import { stripeCreateIntent, stripeCancelIntent } from "~/plugins/stripe.js";
import { lineAuthURL } from "~/plugins/line.js";

import * as analyticsUtil from "~/plugins/analytics";

export default {
  name: "Order",
  components: {
    ShopHeader,
    OrderInfo,
    PhoneLogin,
    ShopInfo,
    StripeCard,
    TimeToPickup,
    NotFound,
    RequireLogin
  },
  data() {
    return {
      notAvailable: false,
      loginVisible: false,
      isPaying: false,
      restaurantsId: this.restaurantId(),
      shopInfo: { restaurantName: "" },
      cardState: {},
      orderInfo: {},
      menuObj: null,
      detacher: [],
      isDeleting: false,
      isPlacing: false,
      tip: 0,
      sendSMS: true,
      paymentInfo: {},
      notFound: false,
      memo: ""
    };
  },
  created() {
    if (this.isUser) {
      this.loadData();
    } else if (!this.isUser) {
      this.loginVisible = true;
    }
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map(detacher => {
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
    hasLineUrl() {
      return this.shopInfo.lineUrl;
    },
    urlAdminOrderPage() {
      return `${
        location.origin
      }/admin/restaurants/${this.restaurantId()}/orders/${this.orderId}`;
    },
    showAddLine() {
      return (
        this.isLineEnabled &&
        this.$store.state.claims &&
        !this.$store.state.claims.line
      );
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
      //console.log("payment", releaseConfig.hidePayment, this.stripeAccount);
      return !releaseConfig.hidePayment && this.stripeAccount;
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
    orderStatusKey() {
      return Object.keys(order_status).reduce((result, key) => {
        return order_status[key] === this.orderInfo.status ? key : result;
      }, "unexpected");
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
    waiting() {
      return this.orderInfo.status < order_status.cooking_completed;
    },
    orderItems() {
      return this.getOrderItems(this.orderInfo, this.menuObj);
    },
    orderId() {
      return this.$route.params.orderId;
    },
    hasMemo() {
      return this.orderInfo && !this.isEmpty(this.orderInfo.memo);
    }
  },
  watch: {
    isUser() {
      if (this.isUser) {
        this.loadData();
      }
    }
  },
  methods: {
    sendPurchase() {
      analyticsUtil.sendPurchase(
        this.orderInfo,
        this.orderId,
        this.orderItems.map(or => {
          return { ...or.item, id: or.id };
        }),
        this.shopInfo,
        this.restaurantId()
      );
      console.log(this.orderItems);
    },
    sendRedunded() {
      analyticsUtil.sendRedunded(
        this.orderInfo,
        this.orderId,
        this.shopInfo,
        this.restaurantId()
      );
      console.log(this.orderItems);
    },
    handleLineAuth() {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname
      });
      location.href = url;
    },
    loadData() {
      const restaurant_detacher = db
        .doc(`restaurants/${this.restaurantId()}`)
        .onSnapshot(async restaurant => {
          if (restaurant.exists) {
            const restaurant_data = restaurant.data();
            this.shopInfo = restaurant_data;
            console.log("*** R", this.shopInfo);
            const uid = restaurant_data.uid;
            const snapshot = await db
              .doc(`/admins/${uid}/public/payment`)
              .get();
            this.paymentInfo = snapshot.data() || {};
            //console.log("restaurant", uid, this.paymentInfo);
          } else {
            this.notFound = true;
          }
        });
      const order_detacher = db
        .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
        .onSnapshot(
          async order => {
            const order_data = order.exists ? order.data() : {};
            this.orderInfo = order_data;
            console.log("*** O", this.orderInfo);
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
          },
          error => {
            console.error(error.message);
            this.notFound = true;
          }
        );
      this.detacher = [restaurant_detacher, order_detacher];
    },

    handleOpenMenu() {
      this.$router.push(`/r/${this.restaurantId()}`);
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
    async handleEditItems() {
      this.$router.push({
        path: `/r/${this.restaurantId()}`
      });
    },
    async handlePayment() {
      const timeToPickup = this.$refs.time.timeToPickup();
      //console.log("handlePayment", timeToPickup);

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
          memo: this.memo || ""
        });
        this.sendPurchase();
        console.log("createIntent", data);
        window.scrollTo(0, 0);
      } catch (error) {
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
          error
        });
      } finally {
        this.isPaying = false;
      }
    },
    async handleNoPayment() {
      const timeToPickup = this.$refs.time.timeToPickup();
      const orderPlace = functions.httpsCallable("orderPlace");
      try {
        this.isPlacing = true;
        const { data } = await orderPlace({
          restaurantId: this.restaurantId() + this.forcedError("place"),
          timeToPickup,
          orderId: this.orderId,
          sendSMS: this.sendSMS,
          tip: this.tip || 0,
          memo: this.memo || ""
        });
        console.log("place", data);
        this.sendPurchase();
        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "order.place",
          error
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
              orderId: this.orderId
            });
            this.sendRedunded();
            console.log("cancel", data);
          } catch (error) {
            // BUGBUG: Implement the error handling code here
            console.error(error.message, error.details);
            this.$store.commit("setErrorMessage", {
              code: "order.cancel",
              error
            });
          } finally {
            this.$store.commit("setLoading", false);
          }
        }
      });
    }
  }
};
</script>
