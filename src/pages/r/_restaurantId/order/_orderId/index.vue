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
    <div class="is-centered" style="text-align: center;">
      <b-button expanded rounded style="margin-bottom:1rem;">
        Add more items
      </b-button>

      <n-link :to="{ path: '/shop/menu' }">
        Remove all items
      </n-link>
    </div>

    <hr class="hr-black" />

    <h2 class="p-big bold">
      Your payment
    </h2>
    <credit-card-input></credit-card-input>

    <div class="is-centered" style="text-align: center;">
      <b-button
        type="is-info"
        expanded
        rounded
        style="margin-top:4rem;padding-top: 0.2rem;"
        size="is-large"
        @click="goNext"
      >
        <span class="p-font bold">
          Place order: $44.00
        </span>
      </b-button>
    </div>
  </section>
</template>

<script>
import ShopOrnerInfo from "~/components/ShopOrnerInfo";
import OrderInfo from "~/components/OrderInfo";
import CreditCardInput from "~/components/CreditCardInput";

import { db } from "~/plugins/firebase.js";

export default {
  name: "Order",

  components: {
    ShopOrnerInfo,
    OrderInfo,
    CreditCardInput
  },
  data() {
    return {
      restaurantsId: this.restaurantId(),
      shopInfo: {},
      orderInfo: {},
      menus: [],

      orderItems: [],

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
  watch: {
    menus() {
      this.updateOrder();
    },
    orderInfo() {
      this.updateOrder();
    },
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map((detacher) => {
        detacher();
      });
    }
  },
  computed: {
    orderId() {
      return this.$route.params.orderId;
    }
  },
  methods: {
    updateOrder() {
      if (this.menus.length > 0 && this.orderInfo.order) {
        const menuObj = this.array2obj(this.menus);
        console.log(menuObj);
        this.orderItems = Object.keys(this.orderInfo.order).map((key) => {
          const num = this.orderInfo.order[key];
          return {
            item: menuObj[key],
            count: num,
          };
        });
      }
    },
    goNext() {
      // this.$router.push({ path: "/restaurants/thank" });
      this.$router.push({ path: `/r/${this.restaurantId()}/order/${this.orderId}/thanks` });
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
