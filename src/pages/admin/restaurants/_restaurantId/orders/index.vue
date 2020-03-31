<template>
  <section class="section" style="background-color:#fffafa">
    <back-button url="/admin/restaurants/" />
    <h2 class="p-big bold">
      {{ shopInfo.restaurantName }}
    </h2>
    <div>
      <ordered-item 
        v-for="order in orders" 
        :key="order.id"
        @selected = "orderSelected($event)" 
        :order="order" />
    </div>
  </section>
  
</template>

<script>
import { db } from "~/plugins/firebase.js";
import OrderedItem from "~/components/OrderedItem";
import BackButton from "~/components/BackButton";

export default {
  components: {
    OrderedItem,
    BackButton
  },
  data() {
    return {
      shopInfo: {},
      orders: []
    }
  },
  created() {
    const restaurant_detacher = db.doc(`restaurants/${this.restaurantId()}`).onSnapshot((restaurant) => {
      if (restaurant.exists) {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data;
        console.log(this.shopInfo);
      }
    });
    const order_detacher = db.collection(`restaurants/${this.restaurantId()}/orders`).onSnapshot((orders) => {
      if (!orders.empty) {
        this.orders = orders.docs.map(this.doc2data("order"));
      }
    });
    this.detachers = [
      restaurant_detacher,
      order_detacher
    ]
  },
  destroyed() {
    if (this.detachers) {
      this.detachers.map((detacher) => {
        detacher();
      });
    }
  },
  computed: {
  },
  methods: {
    orderSelected(order) {
      console.log(order)
      this.$router.push({
        path: '/admin/restaurants/' + this.restaurantId() + '/orders/' + order.id
      });
    }
  }
};
</script>

<style lang="scss">
</style>
