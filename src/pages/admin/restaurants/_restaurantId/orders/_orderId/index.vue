<template>
  <section class="section" style="background-color:#fffafa">
    <back-button :url="'/admin/restaurants/' + restaurantId() + '/orders'" />
    <h2 class="p-big bold">
      #000
    </h2>
    <ordered-item v-for="id in ids" :key="id" :item="item(id)" />
  </section>
  
</template>

<script>
import { db } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import OrderedItem from "~/components/OrderedItem";

export default {
  components: {
    BackButton,
    OrderedItem
  },

  data() {
    return {
      shopInfo: {},
      menus: {},
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
        const menuList = menu.docs.map(this.doc2data("menu"));
        this.menus = {};
        menuList.map((menu)=>{
          this.menus[menu.id] = menu;
        });
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
    ids() {
      return this.orderInfo.order ? Object.keys(this.orderInfo.order) : [];
    },
    count() {
      return this.ids ? this.ids.length : 0;
    }
  },
  methods: {
    item(id) {
      return {
        count: this.orderInfo.order[id],
        menu: this.menus[id]
      }
    }
  }
};
</script>

<style lang="scss">
</style>
