<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <section class="section">
        <div v-if="paid">
          <div style="text-align: center;">
            <i class="far fa-check-circle thankyou-icon"></i>
            <p class="thankyou">
              {{$t('order.thankyou')}}
              <br />
              {{$t('order.pleaseStay')}}
            </p>
          </div>
          <h2>{{ $t('order.orderStatus') + orderName }}</h2>
          <p v-if="waiting">{{$t('order.timeToPickup') + ": " + timePlaced }}</p>
          <div v-if="paid" class="m-t-8" style="text-align: center;">
            <p
              :class="orderStatusKey"
              style="margin-bottom:1rem;padding:0.5rem"
            >{{ $t("order.status." + orderStatusKey) }}</p>
            <b-button
              v-if="just_paid"
              type="is-danger"
              class="p-r-16 p-l-16"
              :loading="isCanceling"
              @click="handleCancelPayment"
              style="margin-bottom:1rem"
            >{{$t('button.cancel')}}</b-button>
          </div>
        </div>
        <shop-orner-info
          :src="this.shopInfo.restProfilePhoto"
          :name="this.shopInfo.restaurantName"
        />

        <shop-info v-if="paid" :compact="true" :shopInfo="shopInfo" />

        <h2 v-if="paid">{{ $t('order.yourOrder') + ": " + orderName }}</h2>
        <h2 v-else>{{ $t('order.yourOrder') }}</h2>
        <order-info
          :orderItems="this.orderItems"
          :orderInfo="this.orderInfo||{}"
          @change="handleTipChange"
        ></order-info>

        <b-notification :closable="false" v-if="newOrder">
          {{$t('order.validating')}}
          <b-loading :is-full-page="false" :active.sync="newOrder" :can-cancel="true"></b-loading>
        </b-notification>

        <div v-if="just_validated" class="m-t-16">
          <div class="is-centered" style="text-align: center;">
            <b-button
              expanded
              rounded
              :loading="isDeleting"
              @click="handleEditItems"
              style="margin-bottom:1rem;"
            >{{$t('order.editItems')}}</b-button>
          </div>

          <time-to-pickup
            v-if="shopInfo.businessDay"
            :shopInfo="shopInfo"
            ref="time"
            @notAvailable="handleNotAvailable"
          />

          <hr class="hr-black" />
          <div v-if="showPayment">
            <h2>{{$t('order.yourPayment')}}</h2>
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
          <div v-else>{{ $t('order.pleasePayAtRestaurant') }}</div>
          <div v-if="!showPayment" class="is-centered" style="text-align: center;">
            <b-button
              expanded
              :type="showPayment ? '' : 'is-primary'"
              rounded
              :loading="isPlacing"
              :disabled="notAvailable"
              style="margin-top:1rem;padding-top: 0.2rem;"
              size="is-large"
              @click="handleNoPayment"
            >
              <span class="p-font bold">{{$t('order.placeOrderNoPayment')}}</span>
            </b-button>
          </div>
          <div style="margin-top: 1rem">
            <b-checkbox v-model="sendSMS">{{$t('order.sendSMS')}}</b-checkbox>
          </div>
        </div>
      </section>
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

export default {
  name: "Order",
  components: {
    ShopOrnerInfo,
    OrderInfo,
    ShopInfo,
    StripeCard,
    TimeToPickup,
    NotFound
  },
  data() {
    return {
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
      notFound: false
    };
  },
  created() {
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
          const order_data = order.exists ? order.data() : {};
          if (
            this.user.uid === order_data.uid ||
            this.$store.getters.isSuperAdmin
          ) {
            this.orderInfo = order_data;
          } else if (!this.isDeleting) {
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
          restaurantId: this.restaurantId(),
          orderId: this.orderId,
          description: `${this.orderName} ${this.shopInfo.restaurantName} ${this.shopInfo.phoneNumber}`,
          sendSMS: this.sendSMS,
          tip: this.tip || 0
        });
        console.log("create", data);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error(error.message, error.details);
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
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
.thankyou {
  color: $primary;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.thankyou-icon {
  color: $primary;
  font-size: 8em;
  margin: 1rem;
}
</style>
