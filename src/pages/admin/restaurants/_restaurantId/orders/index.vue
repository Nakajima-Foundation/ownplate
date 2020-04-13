<template>
  <section class="section" style="background-color:#fffafa">
    <back-button url="/admin/restaurants/" />
    <h2 class="p-big bold">{{ shopInfo.restaurantName }}</h2>
    <div>
      <ordered-info
        v-for="order in orders"
        :key="order.id"
        @selected="orderSelected($event)"
        :order="order"
      />
    </div>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import OrderedInfo from "~/components/OrderedInfo";
import BackButton from "~/components/BackButton";
import { order_status } from "~/plugins/constant.js";

export default {
  components: {
    OrderedInfo,
    BackButton
  },
  data() {
    return {
      shopInfo: {},
      orders: [],
      detachers: []
    };
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        if (restaurant.exists) {
          const restaurant_data = restaurant.data();
          this.shopInfo = restaurant_data;
        }
      });
    const order_detacher = db
      .collection(`restaurants/${this.restaurantId()}/orders`)
      .orderBy("status")
      .where("status", ">=", order_status.customer_paid)
      .orderBy("timePaid")
      .onSnapshot(result => {
        if (!result.empty) {
          let orders = result.docs.map(this.doc2data("order"));
          this.orders = orders.map(order => {
            order.timePaid =
              (order.timePaid && order.timePaid.toDate()) || new Date();
            return order;
          });
        }
      });
    this.detachers = [restaurant_detacher, order_detacher];
  },
  destroyed() {
    if (this.detachers) {
      this.detachers.map(detacher => {
        detacher();
      });
    }
  },
  computed: {},
  methods: {
    orderSelected(order) {
      this.$router.push({
        path:
          "/admin/restaurants/" + this.restaurantId() + "/orders/" + order.id
      });
    }
  }
};
</script>

<style lang="scss">
</style>
