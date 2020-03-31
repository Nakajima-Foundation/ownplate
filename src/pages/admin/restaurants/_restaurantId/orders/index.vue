<template>
  <section class="section" style="background-color:#fffafa">
    <back-button url="/admin/restaurants/" />
    <h2 class="p-big bold">
      Orders
    </h2>
    <div>
      <div>
        <ordered-item 
          v-for="order in orders" 
          :key="order.id"
          @selected = "orderSelected($event)" 
          :order="order" />
      </div>
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
      menus: [],
      orders: [{
        id:111,
        totalCount: 3,
        totalPrice: "$20.15",
        phone: "(333)444-5555",
        pickupTime: "4:41pm",
        title:"#0001"
      }, {
        id:222,
        totalCount: 12,
        totalPrice: "$120.30",
        phone: "(222)444-5555",
        pickupTime: "4:35pm",
        title:"#0002"
      }, {
        id:333,
        totalCount: 4,
        totalPrice: "$42.15",
        phone: "(444)444-5555",
        pickupTime: "4:30pm",
        title:"#0003"
      }]
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
    const menu_detacher = db.collection(`restaurants/${this.restaurantId()}/menus`).onSnapshot((menu) => {
      if (!menu.empty) {
        this.menus = menu.docs.map(this.doc2data("menu"));
        console.log(this.menus);
      }
    });
    const order_detacher = db.collection(`restaurants/${this.restaurantId()}/orders`).onSnapshot((orders) => {
      if (!orders.empty) {
        this.orders = orders.docs.map(this.doc2data("order"));
      }
    });
    this.detacher = [
      restaurant_detacher,
      menu_detacher,
      order_detacher
    ]
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
