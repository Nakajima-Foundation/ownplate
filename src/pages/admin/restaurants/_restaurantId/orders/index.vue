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
import { midNight } from "~/plugins/dateUtils.js";
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
    console.log(this.lastSeveralDays);
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
      .where("timePaid", ">=", midNight())
      .onSnapshot(result => {
        if (!result.empty) {
          let orders = result.docs.map(this.doc2data("order"));
          orders = orders.sort((order0, order1) => {
            if (order0.status === order1.status) {
              return order0.timePaid > order1.timePaid ? -1 : 1;
            }
            return order0.status < order1.status ? -1 : 1;
          });
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
  computed: {
    lastSeveralDays() {
      return Array.from(Array(10).keys()).map(index => {
        const date = midNight(-index);
        return { index, date };
      });
    }
  },
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
