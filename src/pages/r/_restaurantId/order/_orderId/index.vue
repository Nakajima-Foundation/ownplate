<template>
  <section class="section">
    <shop-orner-info
      :src="
            this.shopInfo.restProfilePhoto ||
            'https://pbs.twimg.com/profile_images/704153164438642692/bYo0YeEr_bigger.jpg'
            "
      :name="this.shopInfo.restaurantName || 'Yuta Seatle'"
      ></shop-orner-info>
    <h2 class="p-big bold">
      {{$t('order.yourOrder')}}
    </h2>
    <order-info
      :orderItems="this.orderItems"
      :orderInfo="this.orderInfo||{}"
      ></order-info>

    <b-notification :closable="false" v-if="newOrder">
        Validating...
        <b-loading :is-full-page="false" :active.sync="newOrder" :can-cancel="true"></b-loading>
    </b-notification>

    <div v-if="validated">
      <div class="is-centered" style="text-align: center;">
        <b-button 
          expanded 
          rounded
          @click="handleEditItems" 
          style="margin-bottom:1rem;">
          {{$t('order.editItems')}}
        </b-button>
      </div>

      <hr class="hr-black" />

      <h2 class="p-big bold">
        {{$t('order.yourPayment')}}
      </h2>
      <credit-card-input></credit-card-input>

      <div class="is-centered" style="text-align: center;">
        <b-button
          type="is-primary"
          expanded
          rounded
          style="margin-top:4rem;padding-top: 0.2rem;"
          size="is-large"
          @click="goNext"
        >
          <span class="p-font bold">
            {{$t('order.placeOrder')}} {{$n(orderInfo.total, 'currency')}}
          </span>
        </b-button>
      </div>
    </div>
  </section>
</template>

<script>
import ShopOrnerInfo from "~/components/ShopOrnerInfo";
import OrderInfo from "~/components/OrderInfo";
import CreditCardInput from "~/components/CreditCardInput";

import { db } from "~/plugins/firebase.js";
import { order_status } from "~/plugins/constant.js";

export default {
  name: "Order",

  components: {
    ShopOrnerInfo,
    OrderInfo,
    CreditCardInput
  },
  data() {
    return {
      isLoading: true,
      restaurantsId: this.restaurantId(),
      shopInfo: {},
      orderInfo: {},
      menus: [],
      detacher: [],
    };
  },
  created() {
    const restaurant_detacher = db.doc(`restaurants/${this.restaurantId()}`).onSnapshot((restaurant) => {
      if (restaurant.exists) {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data;
      }
    });
    const menu_detacher = db.collection(`restaurants/${this.restaurantId()}/menus`).onSnapshot((menu) => {
      if (!menu.empty) {
        this.menus = menu.docs.map(this.doc2data("menu"));
      }
    });
    const order_detacher = db.doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`).onSnapshot((order) => {
      if (order.exists) {
        const order_data = order.data();
        this.orderInfo = order_data;
      }
    });
    this.detacher = [
      restaurant_detacher,
      menu_detacher,
      order_detacher
    ]
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map((detacher) => {
        detacher();
      });
    }
  },
  computed: {
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
        console.log(this.orderInfo);
        return Object.keys(this.orderInfo.order).map((key) => {
          const num = this.orderInfo.order[key];
          return {
            item: menuObj[key],
            count: num,
            id: key,
            specialRequest: "no special request" // BUGBUG: Implement this later
          };
        });
      }
      console.log("menu is not ready");
      return []; 
    },
    orderId() {
      return this.$route.params.orderId;
    }
  },
  methods: {
    async handleEditItems() {
      console.log("handleEditItems");
      try {
        await db.doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`).delete();
        console.log("suceeded");
        this.$router.push({ path: `/r/${this.restaurantId()}` });
      } catch(error) {
        console.log("failed");
      }
    },
    async goNext() {
      try {
        // HACK: Workaround until we implement sprite
        await db.doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`).set({
          status: order_status.customer_paid
        }, { merge:true });
        console.log("suceeded");
      } catch(error) {
        console.log("failed", error);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
