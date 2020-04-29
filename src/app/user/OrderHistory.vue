<template>
  <section class="section">
    <h2>Order History</h2>
    <ordered-info
      v-for="order in orders"
      :key="order.id"
      @selected="orderSelected($event)"
      :order="order"
    />
  </section>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";

export default {
  components: {
    OrderedInfo
  },
  data() {
    return {
      detatcher: () => {},
      orders: []
    };
  },
  async created() {
    console.log("created", this.uid);
    if (this.uid) {
      db.collectionGroup("orders")
        .where("uid", "==", this.uid)
        .onSnapshot(snapshot => {
          this.orders = snapshot.docs.map(doc => {
            const order = doc.data();
            console.log(doc.ref.path.split("/")[1]);
            order.restaurantId = doc.ref.path.split("/")[1];
            order.id = doc.id;
            // HACK: Remove it later
            order.timePlaced =
              (order.timePlaced && order.timePlaced.toDate()) || new Date();
            return order;
          });
        });
    }
  },
  destroyed() {
    this.detatcher();
  },
  computed: {
    uid() {
      return this.$store.getters.uidUser;
    }
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
