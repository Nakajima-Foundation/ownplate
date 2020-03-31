<template>
  <section class="section" style="background-color:#fffafa">
    <back-button :url="'/admin/restaurants/' + restaurantId() + '/orders'" />
    <h2 class="p-big bold">
      #000
    </h2>
    <p>{{ count }}</p>
    <p>{{ menus }}</p>
    <p>{{ orderInfo }}</p>
  </section>
  
</template>

<script>
import { db } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";

export default {
  components: {
    BackButton
  },

  data() {
    return {
      shopInfo: {},
      menus: [],
      orderInfo: {},
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
    const order_detacher = db.doc(`restaurants/${this.restaurantId()}/orders/${this.orderId()}`).onSnapshot((order) => {
      if (order.exists) {
        const order_data = order.data();
        this.orderInfo = order_data;
      }
    });
    this.detacher = [
      restaurant_detacher,
      menu_detacher,
      order_detacher
    ];
  },
  destroyed() {
    this.detacher.map((detacher) => {
      detacher();
    });
  },
  computed: {
    count() {
      if (this.orderInfo.order) {
        return Object.keys(this.orderInfo.order).length;
      }
      return 0;
    }
  },
  methods: {
  }
};
</script>

<style lang="scss">
</style>
