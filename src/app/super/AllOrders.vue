<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Orders</h2>
    <ordered-info
      v-for="order in orders"
      :key="order.id"
      @selected="orderSelected($event)"
      :order="order"
    />
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";

export default {
  components: {
    OrderedInfo,
    BackButton
  },
  data() {
    return {
      orders: [],
      detacher: null
    };
  },
  created() {
    this.detatcher = db
      .collectionGroup("orders")
      .orderBy("timePlaced", "desc")
      .limit(25)
      .onSnapshot(snapshot => {
        this.orders = snapshot.docs.map(doc => {
          const order = doc.data();
          order.restaurantId = doc.ref.path.split("/")[1];
          order.id = doc.id;
          // HACK: Remove it later
          order.timePlaced =
            (order.timePlaced && order.timePlaced.toDate()) || new Date();
          return order;
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  methods: {
    orderSelected(order) {
      this.$router.push({
        path: "/r/" + order.restaurantId + "/order/" + order.id
      });
    }
  }
};
</script>
