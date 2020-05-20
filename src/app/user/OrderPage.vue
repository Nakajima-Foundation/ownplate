<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Order Header Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>
        <!-- Center Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Back Button (Edit Order) -->
            <div v-if="just_validated" class="m-t-24">
              <b-button
                :loading="isDeleting"
                @click="handleEditItems"
                class="b-reset h-36 r-36 bg-form"
              >
                <span class="p-l-16 p-r-16">
                  <i class="material-icons c-primary s-18 m-r-8">arrow_back</i>
                  <span class="c-primary t-button">{{$t('button.back')}}</span>
                </span>
              </b-button>
            </div>

            <!-- Restaurant Profile Photo and Name -->
            <shop-orner-info :shopInfo="shopInfo"></shop-orner-info>

            <!-- After Paid -->
            <div v-if="paid">
              <!-- Thank you Message -->
              <div class="m-t-24">
                <div class="t-h6 c-primary align-center">{{$t('order.thankyou')}}</div>
                <div class="t-h6 c-primary align-center m-t-8">{{$t('order.pleaseStay')}}</div>
              </div>

              <!-- Line Button -->
              <div v-if="showAddLine" class="m-t-8" style="text-align: center;">
                <b-button
                  type="is-primary"
                  class="p-r-16 p-l-16 notify"
                  style="background:#18b900"
                  tag="a"
                  :href="lineAuth"
                >
                  <i class="fab fa-line" style="font-size:1.2em" />
                  {{$t('line.notifyMe')}}
                </b-button>
              </div>

              <!-- Order Status -->
              <div class="align-center m-t-24">
                <div class="is-inline-flex">
                  <div class="m-r-24">
                    <div class="t-subtitle2 c-text-black-medium">{{ $t('order.orderStatus') }}</div>
                    <div
                      class="op-status m-t-8"
                      :class="orderStatusKey"
                    >{{ $t("order.status." + orderStatusKey) }}</div>
                  </div>
                  <div>
                    <div class="t-subtitle2 c-text-black-medium">{{ $t('order.orderId') }}</div>
                    <div class="t-h5 c-text-black-high m-t-8">{{ orderName }}</div>
                  </div>
                </div>
              </div>

              <!-- Time to Pickup -->
              <div
                v-if="waiting"
                class="align-center t-body2 c-text-black-medium m-t-16"
              >{{$t('order.timeToPickup') + ": " + timePlaced }}</div>

              <!-- Cancel Button -->
              <div class="align-center m-t-24">
                <b-button
                  v-if="just_paid"
                  type="is-danger"
                  class="p-r-16 p-l-16"
                  :loading="isCanceling"
                  @click="handleCancelPayment"
                >{{$t('button.cancel')}}</b-button>
              </div>

              <!-- Special Thank you Message from the Restaurant -->
              <template v-if="shopInfo && shopInfo.orderThanks && shopInfo.orderThanks.length > 0">
                <div class="bg-form m-t-24 p-l-16 p-r-16 p-t-16 p-b-16 r-8">
                  <div class="t-caption">{{$t('order.thanksMessage')}}</div>
                  <div class="t-body1 m-t-8">{{shopInfo.orderThanks}}</div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>

      <!-- Order Body Area -->
      <div class="columns is-gapless">
        <!-- Left Gap -->
        <div class="column is-narrow w-24"></div>
        <!-- Left Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <!-- Order Details -->
            <div class="m-t-24">
              <!-- Title -->
              <div
                v-if="paid"
                class="t-h6 c-text-black-disabled"
              >{{ $t('order.yourOrder') + ": " + orderName }}</div>
              <div v-else class="t-h6 c-text-black-disabled">{{ $t('order.yourOrder') }}</div>
              <!-- Details -->
              <order-info
                :orderItems="this.orderItems"
                :orderInfo="this.orderInfo||{}"
                @change="handleTipChange"
              ></order-info>
              <!-- Validating -->
              <b-notification :closable="false" v-if="newOrder">
                {{$t('order.validating')}}
                <b-loading :is-full-page="false" :active.sync="newOrder" :can-cancel="true"></b-loading>
              </b-notification>
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
              <template v-if="shopInfo && shopInfo.orderNotice && shopInfo.orderNotice.length > 0">
                <div class="m-t-24">
                  <div class="t-h6 c-text-black-disabled">Order Notice</div>
                  <div class="bg-surface r-8 d-low m-t-8 p-l-16 p-r-16 p-t-16 p-b-16">
                    <div class="cols">
                      <div class="p-r-8">
                        <i class="material-icons s-24 c-status-red">error</i>
                      </div>
                      <div class="t-body1 c-status-red">{{shopInfo.orderNotice}}</div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Payment -->
              <div class="m-t-24">
                <!-- Title -->
                <div class="t-h6 c-text-black-disabled">{{$t('order.yourPayment')}}</div>

                <!-- Pay Online -->
                <div v-if="showPayment">
                  <stripe-card
                    :stripe-account="this.stripeAccount"
                    @change="handleCardStateChange"
                    ref="stripe"
                  ></stripe-card>
                  <!-- <credit-card-input></credit-card-input> -->
                  <div class="is-centered" style="text-align: center;">
                    <b-button
                      type="is-primary"
                      expanded
                      rounded
                      :loading="isPaying"
                      :disabled="!cardState.complete || notAvailable"
                      style="margin-top:4rem;padding-top: 0.2rem;"
                      size="is-large"
                      @click="handlePayment"
                    >
                      <span
                        class="p-font bold"
                      >{{$t('order.placeOrder')}} {{$n(orderInfo.total + tip, 'currency')}}</span>
                    </b-button>
                  </div>
                </div>

                <!-- Pay at Restaurant -->
                <div v-else class="m-t-8">
                  <div
                    class="bg-form r-8 p-l-16 p-r-16 p-t-16 p-b-16 t-body2 c-text-black-high"
                  >{{ $t('order.pleasePayAtRestaurant') }}</div>
                </div>

                <!-- Send SMS Checkbox -->
                <div v-if="!lineEnabled" class="m-t-8">
                  <div class="bg-form r-8 p-l-16 p-r-16 p-t-16 p-b-16">
                    <b-checkbox v-model="sendSMS">
                      <span class="t-body2 c-text-black-high">{{$t('order.sendSMS')}}</span>
                    </b-checkbox>
                  </div>
                </div>

                <!-- Pay Button -->
                <div v-if="!showPayment" class="align-center m-t-24">
                  <b-button
                    class="b-reset op-button-medium primary"
                    style="min-width: 288px;"
                    :loading="isPlacing"
                    :disabled="notAvailable"
                    @click="handleNoPayment"
                  >
                    <span class="c-onprimary p-l-24 p-r-24">{{$t('order.placeOrderNoPayment')}}</span>
                  </b-button>
                </div>
              </div>
            </div>

            <!-- (After Paid) Restaurant Details -->
            <shop-info v-if="paid" :compact="true" :shopInfo="shopInfo" />
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>
      <error-popup :error="errorMessage" />
    </template>
  </div>
</template>

<script>
import ShopOrnerInfo from "~/app/user/Restaurant/ShopOrnerInfo";
import OrderInfo from "~/app/user/Order/OrderInfo";
import ShopInfo from "~/app/user/Restaurant/ShopInfo";
import StripeCard from "~/app/user/Order/StripeCard";
import TimeToPickup from "~/app/user/Order/TimeToPickup";
import NotFound from "~/components/NotFound";

import { db, firestore, functions } from "~/plugins/firebase.js";
import { order_status } from "~/plugins/constant.js";
import { nameOfOrder } from "~/plugins/strings.js";
import { releaseConfig } from "~/plugins/config.js";
import { stripeCreateIntent, stripeCancelIntent } from "~/plugins/stripe.js";
import { ownPlateConfig } from "@/config/project";
import ErrorPopup from "~/components/ErrorPopup";

export default {
  name: "Order",
  components: {
    ShopOrnerInfo,
    OrderInfo,
    ShopInfo,
    StripeCard,
    TimeToPickup,
    ErrorPopup,
    NotFound
  },
  data() {
    return {
      showAddLine: false,
      notAvailable: false,
      isPaying: false,
      restaurantsId: this.restaurantId(),
      shopInfo: { restaurantName: "" },
      cardState: {},
      stripeAccount: null,
      orderInfo: {},
      menus: [],
      detacher: [],
      isDeleting: false,
      isPlacing: false,
      tip: 0,
      isCanceling: false,
      sendSMS: true,
      errorMessage: null,
      notFound: false
    };
  },
  created() {
    if (this.lineEnabled && this.user) {
      db.doc(`users/${this.user.uid}/private/line`)
        .get()
        .then(doc => {
          const data = doc.data();
          console.log(data);
          this.showAddLine = !(data && data.isFriend);
        });
    }
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(async restaurant => {
        if (restaurant.exists) {
          const restaurant_data = restaurant.data();
          this.shopInfo = restaurant_data;
          const uid = restaurant_data.uid;
          const snapshot = await db.doc(`/admins/${uid}/public/stripe`).get();
          const stripeInfo = snapshot.data();
          console.log("restaurant", uid, stripeInfo);
          this.stripeAccount = stripeInfo && stripeInfo["stripeAccount"];
        } else {
          this.notFound = true;
        }
      });
    const menu_detacher = db
      .collection(`restaurants/${this.restaurantId()}/menus`)
      .onSnapshot(menu => {
        if (!menu.empty) {
          this.menus = menu.docs.map(this.doc2data("menu"));
        }
      });
    const order_detacher = db
      .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
      .onSnapshot(
        order => {
          console.log("CALLSNAPSHOT");
          const order_data = order.exists ? order.data() : {};
          console.log(order_data);
          if (
            this.user.uid === order_data.uid ||
            this.$store.getters.isSuperAdmin
          ) {
            console.log("UPDATE");
            this.orderInfo = order_data;
          } else if (!this.isDeleting) {
            console.log("NOTUPDATE");
            this.notFound = true;
          }
        },
        error => {
          // Because of the firestore.rules, it causes "insufficient permissions"
          // if the order does not exist.
          console.log(error);
          this.notFound = true;
        }
      );
    this.detacher = [restaurant_detacher, menu_detacher, order_detacher];
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map(detacher => {
        detacher();
      });
    }
  },
  computed: {
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: ownPlateConfig.line.LOGIN_CHANNEL_ID,
        redirect_uri: this.redirect_uri,
        scope: "profile openid email",
        bot_prompt: "aggressive",
        state: "s" + Math.random(), // LATER: Make it more secure
        nonce: location.pathname // HACK: Repurposing nonce
      };
      const queryString = Object.keys(query)
        .map(key => {
          return key + "=" + encodeURIComponent(query[key]);
        })
        .join("&");
      return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
    },
    redirect_uri() {
      return location.origin + "/callback/line";
    },
    lineEnabled() {
      return !!ownPlateConfig.line;
    },
    timePlaced() {
      const date = this.orderInfo.timePlaced.toDate();
      return this.$d(date, "long");
    },
    showPayment() {
      //console.log("payment", releaseConfig.hidePayment, this.stripeAccount);
      return !releaseConfig.hidePayment && this.stripeAccount;
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
    paid() {
      return this.orderInfo.status >= order_status.order_placed;
    },
    waiting() {
      return this.orderInfo.status < order_status.cooking_completed;
    },
    orderItems() {
      if (this.menus.length > 0 && this.orderInfo.order) {
        return Object.keys(this.orderInfo.order).map(key => {
          const num = this.orderInfo.order[key];
          return {
            item: this.menuObj[key],
            count: num,
            id: key,
            specialRequest: this.specialRequest(key)
          };
        });
      }
      return [];
    },
    menuObj() {
      return this.array2obj(this.menus);
    },
    orderId() {
      return this.$route.params.orderId;
    },
    user() {
      return this.$store.state.user;
    }
  },
  methods: {
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
    specialRequest(key) {
      const option = this.orderInfo.options && this.orderInfo.options[key];
      if (option) {
        return option.filter(choice => choice).join(", ");
      }
      return "";
    },
    async handleEditItems() {
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
      this.$router.push({
        path: `/r/${this.restaurantId()}#${this.orderId}`
      });
    },
    async handlePayment() {
      const timeToPickup = this.$refs.time.timeToPickup();
      console.log("handlePayment", timeToPickup);

      this.isPaying = true;
      const {
        error,
        paymentMethod
      } = await this.$refs.stripe.createPaymentMethod();

      if (error) {
        this.isPaying = false;
        console.log(error);
        return;
      }

      try {
        const { data } = await stripeCreateIntent({
          paymentMethodId: paymentMethod.id,
          timeToPickup,
          restaurantId: this.restaurantId() + this.forcedError("intent"),
          orderId: this.orderId,
          description: `${this.orderName} ${this.shopInfo.restaurantName} ${this.shopInfo.phoneNumber}`,
          sendSMS: this.sendSMS,
          tip: this.tip || 0
        });
        console.log("create", data);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error.message, error.details);
        this.errorMessage = { code: "sprite.intent", details: error.details };
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
          restaurantId: this.restaurantId(),
          timeToPickup,
          orderId: this.orderId,
          sendSMS: this.sendSMS,
          tip: this.tip || 0
        });
        console.log("place", data);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error.message, error.details);
      } finally {
        this.isPlacing = true;
      }
    },
    async handleCancelPayment() {
      try {
        this.isCanceling = true;
        const { data } = await stripeCancelIntent({
          restaurantId: this.restaurantId(),
          orderId: this.orderId
        });
        console.log("cancel", data);
      } catch (error) {
        // BUGBUG: Implement the error handling code here
        console.error(error.message, error.details);
      } finally {
        this.isCanceling = false;
      }
    }
  }
};
</script>
