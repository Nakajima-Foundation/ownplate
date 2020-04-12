<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <section class="section">
        <div v-if="paid" style="text-align: center;">
          <p class="thankyou">{{$t('order.thankyou')}}</p>
          <p
            :class="orderStatusKey"
            style="margin-bottom:1rem;padding:0.5rem"
          >{{ $t("order.status." + orderStatusKey) }}</p>
        </div>
        <shop-orner-info
          :src="this.shopInfo.restProfilePhoto"
          :name="this.shopInfo.restaurantName"
        />
        <shop-info v-if="paid" :compact="true" :shopInfo="shopInfo" />

        <h2>{{ $t('order.yourOrder') + ": " + orderName }}</h2>
        <order-info :orderItems="this.orderItems" :orderInfo="this.orderInfo||{}"></order-info>

        <b-notification :closable="false" v-if="newOrder">
          {{$t('order.validating')}}
          <b-loading :is-full-page="false" :active.sync="newOrder" :can-cancel="true"></b-loading>
        </b-notification>

        <div v-if="validated">
          <div class="is-centered" style="text-align: center;">
            <b-button
              expanded
              rounded
              @click="handleEditItems"
              style="margin-bottom:1rem;"
            >{{$t('order.editItems')}}</b-button>
          </div>

          <hr class="hr-black" />

          <h2>{{$t('order.yourPayment')}}</h2>
          <stripe-card ref="stripe"></stripe-card>
          <!-- <credit-card-input></credit-card-input> -->

          <div class="is-centered" style="text-align: center;">
            <b-button
              type="is-primary"
              expanded
              rounded
              style="margin-top:4rem;padding-top: 0.2rem;"
              size="is-large"
              @click="goNext"
            >
              <span
                class="p-font bold"
              >{{$t('order.placeOrder')}} {{$n(orderInfo.total, 'currency')}}</span>
            </b-button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import ShopOrnerInfo from "~/components/ShopOrnerInfo";
import OrderInfo from "~/components/OrderInfo";
import CreditCardInput from "~/components/CreditCardInput";
import ShopInfo from "~/components/ShopInfo";
import StripeCard from "~/components/StripeCard";
import NotFound from "~/components/NotFound";

import { db, firestore, functions } from "~/plugins/firebase.js";
import { order_status } from "~/plugins/constant.js";
import { nameOfOrder } from "~/plugins/strings.js";

export default {
  name: "Order",

  components: {
    ShopOrnerInfo,
    OrderInfo,
    CreditCardInput,
    ShopInfo,
    StripeCard,
    NotFound
  },
  data() {
    return {
      isLoading: true,
      restaurantsId: this.restaurantId(),
      shopInfo: { restaurantName: "" },
      orderInfo: {},
      menus: [],
      detacher: [],
      notFound: false
    };
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        if (restaurant.exists) {
          const restaurant_data = restaurant.data();
          this.shopInfo = restaurant_data;
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
          if (order.exists) {
            const order_data = order.data();
            this.orderInfo = order_data;
          } else {
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
    orderName() {
      return nameOfOrder(this.orderInfo);
    },
    orderStatusKey() {
      return Object.keys(order_status).reduce((result, key) => {
        return order_status[key] === this.orderInfo.status ? key : result;
      }, "unexpected");
    },
    newOrder() {
      return this.orderInfo.status == order_status.new_order;
    },
    validated() {
      return this.orderInfo.status == order_status.validation_ok;
    },
    paid() {
      return this.orderInfo.status >= order_status.customer_paid;
    },
    orderItems() {
      if (this.menus.length > 0 && this.orderInfo.order) {
        const menuObj = this.array2obj(this.menus);
        return Object.keys(this.orderInfo.order).map(key => {
          const num = this.orderInfo.order[key];
          return {
            item: menuObj[key],
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
    }
  },
  methods: {
    specialRequest(key) {
      const option = this.orderInfo.options && this.orderInfo.options[key];
      if (option) {
        return option
          .reduce((ret, choice) => {
            if (choice === true) {
              ret.push("something");
            } else if (choice) {
              ret.push(choice);
            }
            return ret;
          }, [])
          .join(", ");
      }
      return "";
    },
    async handleEditItems() {
      console.log("handleEditItems");
      try {
        await db
          .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
          .delete();
        console.log("suceeded");
        this.$router.push({
          path: `/r/${this.restaurantId()}#${this.orderId}`
        });
      } catch (error) {
        console.log("failed");
      }
    },
    async goNext() {
      const {
        error,
        paymentMethod
      } = await this.$refs.stripe.createPaymentMethod();

      if (error) {
        console.log(error);
        return;
      }

      const checkoutCreate = functions.httpsCallable("checkoutCreate");
      const checkoutConfirm = functions.httpsCallable("checkoutConfirm");

      try {
        const result = await checkoutCreate({
          paymentMethodId: paymentMethod.id,
          restaurantId: this.restaurantId(),
          orderId: this.orderId,
          phoneNumber: this.$store.state.user.phoneNumber
        });

        console.log(result);
      } catch (error) {
        console.log(error);
      }

      // try {
      //   // HACK: Workaround until we implement sprite
      //   await db
      //     .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
      //     .update({
      //       status: order_status.customer_paid,
      //       phoneNumber: this.$store.state.user.phoneNumber,
      //       timePaid: firestore.FieldValue.serverTimestamp()
      //     });
      //   console.log("suceeded");
      //   window.scrollTo(0, 0);
      // } catch (error) {
      //   console.log("failed", error);
      // }
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
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>
