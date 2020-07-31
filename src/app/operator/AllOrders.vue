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
  async mounted() {
    if (!this.$store.state.user || (this.$store.getters.isNotSuperAdmin && this.$store.getters.isNotOperator)) {
      this.$router.push("/");
    }
  },
  created() {
    this.detatcher = db
      .collectionGroup("orders")
      .orderBy("timePlaced", "desc")
      .limit(100)
      .onSnapshot(snapshot => {
        this.orders = snapshot.docs.map(doc => {
          const order = doc.data();
          order.restaurantId = doc.ref.path.split("/")[1];
          order.id = doc.id;
          order.timePlaced = order.timePlaced.toDate();
          if (order.timeEstimated) {
            order.timeEstimated = order.timeEstimated.toDate();
          }
          return order;
        });
        console.log("***", this.orders);
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  methods: {
    orderSelected(order) {
      // We are re-using the end-user view of this order for now.
      this.$router.push({
        path: "/r/" + order.restaurantId + "/order/" + order.id
      });
    }
  }
};
</script>
