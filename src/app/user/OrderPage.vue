<template>
  <div>
    <template v-if="!isUser">
      <RequireLogin :loginVisible="loginVisible" @dismissed="handleDismissed" />
    </template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Order Header Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Back Button (Edit Order) -->
            <div v-if="just_validated" class="m-t-24">
              <b-button
                :loading="isDeleting"
                @click="handleEditItems"
                class="b-reset h-9 rounded-full bg-form"
              >
                <span class="p-l-16 p-r-16">
                  <i class="material-icons c-primary s-18 m-r-8">arrow_back</i>
                  <span class="c-primary t-button">{{
                    $t("button.back")
                  }}</span>
                </span>
              </b-button>
            </div>

            <!-- Restaurant Profile Photo and Name -->
            <shop-header :shopInfo="shopInfo"></shop-header>

            <!-- After Paid -->
            <div v-if="paid">
              <!-- Thank you Message -->
              <div class="m-t-24">
                <div class="t-h6 c-primary align-center">
                  {{ $t("order.thankyou") }}
                </div>
                <div class="t-h6 c-primary align-center m-t-8">
                  {{ $t("order.pleaseStay") }}
                </div>
              </div>

              <!-- Line Button -->
              <div v-if="showAddLine" class="m-t-24 align-center">
                <b-button
                  class="b-reset op-button-small"
                  style="background:#18b900"
                  @click="handleLineAuth"
                >
                  <i
                    class="fab fa-line c-text-white-full m-l-24 m-r-8"
                    style="font-size:24px"
                  />
                  <span class="c-text-white-full m-r-24">{{
                    $t("line.notifyMe")
                  }}</span>
                </b-button>
              </div>

              <!-- Order Status -->
              <div class="align-center m-t-24">
                <div class="is-inline-flex">
                  <div class="m-r-24">
                    <div class="t-subtitle2 c-text-black-medium">
                      {{ $t("order.orderStatus") }}
                    </div>
                    <div class="op-status m-t-8" :class="orderStatusKey">
                      {{ $t("order.status." + orderStatusKey) }}
                    </div>
                  </div>
                  <div>
                    <div class="t-subtitle2 c-text-black-medium">
                      {{ $t("order.orderId") }}
                    </div>
                    <div class="t-h5 c-text-black-high m-t-8">
                      {{ orderName }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Time to Pickup -->

              <div
                v-if="waiting"
                class="align-center t-body2 c-text-black-medium m-t-16"
              >
                <div>
                  {{ $t("order.timeRequested") + ": " + timeRequested }}
                </div>
                <div v-if="timeEstimated">
                  {{ $t("order.timeToPickup") + ": " + timeEstimated }}
                </div>
              </div>

              <!-- Cancel Button -->
              <div class="align-center m-t-24">
                <b-button
                  v-if="just_paid"
                  class="b-reset op-button-text bg-transparent"
                  @click="handleCancelPayment"
                >
                  <i class="material-icons c-status-red s-18">highlight_off</i>
                  <span class="c-status-red">{{
                    $t("order.cancelOrder")
                  }}</span>
                </b-button>
              </div>

              <!-- Cancel Message -->
              <div
                v-if="canceled"
                class="bg-status-red-bg rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 align-center"
              >
                <span class="t-subtitle1 c-status-red">{{
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
                <div
                  class="bg-form m-t-24 p-l-16 p-r-16 p-t-16 p-b-16 rounded-lg"
                >
                  <div class="t-caption">{{ $t("order.thanksMessage") }}</div>
                  <div class="t-body1 m-t-8">{{ shopInfo.orderThanks }}</div>
                </div>
              </template>

              <!-- Restaurant LINE -->
              <div
                v-if="hasLineUrl"
                class="align-center m-t-16 bg-form rounded-lg p-t-16 p-l-16 p-r-16 p-b-16"
              >
                <a target="_blank" :href="this.shopInfo.lineUrl">
                  <div class="op-button-pill bg-status-green c-text-white-full">
                    <i class="fab fa-line"></i>
                    <span class="t-subtitle2">{{ $t("order.lineLink") }}</span>
                  </div>
                </a>
                <div class="t-body2 m-t-8">
                  {{ $t("order.lineMessage") }}
                </div>
              </div>
            </div>
            <!-- End of After Paid -->

            <!-- Before Paid -->
            <div v-else>
              <div
                class="align-center bg-status-red-bg p-t-24 p-l-24 p-r-24 p-b-24 t-subtitle1 c-status-red rounded-lg m-t-16"
              >
                {{ $t("order.orderNotPlacedYet") }}
              </div>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
      </div>

      <!-- Order Body Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-6"></div>
        <!-- Left Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Order Details -->
            <div class="m-t-24">
              <!-- Title -->
              <div v-if="paid" class="t-h6 c-text-black-disabled">
                {{ $t("order.yourOrder") + ": " + orderName }}
              </div>
              <div v-else class="t-h6 c-text-black-disabled">
                {{ $t("order.confirmOrder") }}
              </div>

              <!-- Details -->
              <order-info
                :orderItems="this.orderItems"
                :orderInfo="this.orderInfo || {}"
                @change="handleTipChange"
              ></order-info>

              <!-- Cancel Message -->
              <div
                v-if="canceled"
                class="bg-status-red-bg rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 align-center m-t-24"
              >
                <span class="t-subtitle1 c-status-red">{{
                  $t("order.cancelOrderComplete")
                }}</span>
              </div>

              <!-- View Menu Page Button -->
              <div class="align-center m-t-24" v-if="paid">
                <b-button
                  class="b-reset op-button-small secondary"
                  @click="handleOpenMenu"
                >
                  <span class="c-primary p-l-24 p-r-24">
                    {{ $t("order.menu") }}
                  </span>
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

              <!-- Your Message to the Restaurant -->
              <template v-if="paid && hasMemo">
                <div
                  class="bg-form m-t-24 p-l-16 p-r-16 p-t-16 p-b-16 rounded-lg"
                >
                  <div class="t-caption">{{ $t("order.orderMessage") }}</div>
                  <div class="t-body1 m-t-8">{{ orderInfo.memo }}</div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- (Before Paid) Order Details -->
            <div v-if="just_validated">
              <!-- Time to Pickup -->
              <time-to-pickup
                v-if="shopInfo.businessDay"
                :shopInfo="shopInfo"
                ref="time"
                @notAvailable="handleNotAvailable"
              />

              <!-- Order Notice -->
              <template
                v-if="
                  shopInfo &&
                    shopInfo.orderNotice &&
                    shopInfo.orderNotice.length > 0
                "
              >
                <div class="m-t-24">
                  <div class="t-h6 c-text-black-disabled">
                    {{ $t("order.orderNotice") }}
                  </div>
                  <div
                    class="bg-surface rounded-lg d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16"
                  >
                    <div class="cols">
                      <div class="p-r-8">
                        <i class="material-icons s-24 c-status-red">error</i>
                      </div>
                      <div class="t-body1 c-status-red">
                        {{ shopInfo.orderNotice }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Order Notice -->
              <template v-if="shopInfo && shopInfo.acceptUserMessage">
                <div class="m-t-24">
                  <div class="t-h6 c-text-black-disabled">
                    {{ $t("order.orderMessage") }}
                  </div>
                  <div
                    class="bg-surface rounded-lg d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16"
                  >
                    <div class="cols">
                      <b-input
                        v-model="memo"
                        type="textarea"
                        :placeholder="$t('order.enterMessage')"
                        style="width: 100%"
                      ></b-input>
                    </div>
                  </div>
                </div>
              </template>
              <!-- Payment -->
              <div class="m-t-24">
                <!-- Title -->
                <div class="t-h6 c-text-black-disabled">
                  {{ $t("order.yourPayment") }}
                </div>

                <!-- Pay Online -->
                <div v-if="showPayment">
                  <stripe-card
                    @change="handleCardStateChange"
                    ref="stripe"
                    :stripeJCB="stripeJCB"
                  ></stripe-card>
                  <!-- <credit-card-input></credit-card-input> -->
                  <!-- Pay Button -->
                  <div class="align-center m-t-24">
                    <b-button
                      class="b-reset op-button-medium primary"
                      style="min-width: 288px;"
                      :loading="isPaying"
                      :disabled="!cardState.complete || notAvailable"
                      @click="handlePayment"
                    >
                      <span class="c-onprimary p-l-24 p-r-24">
                        {{ $t("order.placeOrder") }}
                        <!-- {{ $n(orderInfo.total + tip, "currency") }} -->
                      </span>
                    </b-button>
                  </div>
                </div>

                <!-- Pay at Restaurant -->
                <div v-else class="m-t-8">
                  <div
                    class="bg-form rounded-lg p-l-16 p-r-16 p-t-16 p-b-16 t-body2 c-text-black-high"
                  >
                    {{ $t("order.pleasePayAtRestaurant") }}
                  </div>
                </div>

                <!-- Pay Button -->
                <div v-if="inStorePayment" class="align-center m-t-24">
                  <div class="t-subtitle2 c-text-black-disabled">
                    {{ $t("order.or") }}
                  </div>
                  <b-button
                    class="b-reset op-button-medium primary m-t-24"
                    style="min-width: 288px;"
                    :loading="isPlacing"
                    :disabled="notAvailable"
                    @click="handleNoPayment"
                  >
                    <span class="c-onprimary p-l-24 p-r-24">{{
                      $t("order.placeOrderNoPayment")
                    }}</span>
                  </b-button>
                  <div class="t-subtitle2 c-text-black-disabled m-t-8">
                    {{ $t("order.placeOrderNoPaymentNote") }}
                  </div>
                </div>

                <!-- Send SMS Checkbox -->
                <div v-if="!isLineEnabled" class="m-t-24">
                  <div class="bg-form rounded-lg p-l-16 p-r-16 p-t-16 p-b-16">
                    <b-checkbox v-model="sendSMS">
                      <span class="t-body2 c-text-black-high">{{
                        $t("order.sendSMS")
                      }}</span>
                    </b-checkbox>
                  </div>
                </div>
              </div>
            </div>

            <!-- (After Paid) Restaurant Details -->
            <div v-if="paid">
              <shop-info
                :compact="true"
                :shopInfo="shopInfo"
                :paymentInfo="paymentInfo"
              />
              <!-- <div class="align-center m-t-24">
                <b-button class="b-reset op-button-small bg-status-blue" @click="handleOpenMenu">
                  <span class="c-text-white-full">
                    {{
                    $t("order.menu")
                    }}
                  </span>
                </b-button>
              </div>-->
              <!-- QR Code -->
              <div class="m-t-24">
                <div class="t-h6 c-text-black-disabled">
                  {{ $t("order.adminQRCode") }}
                </div>
                <div class="m-t-8 align-center">
                  <qrcode
                    :value="urlAdminOrderPage"
                    :options="{ width: 160 }"
                  ></qrcode>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-6"></div>
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
        this.$store.commit("resetCart", this.restaurantId());
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
        this.$store.commit("resetCart", this.restaurantId());
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
