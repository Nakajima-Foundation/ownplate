<template>
  <section class="section">
    <back-button :url="backUrl" />
    <h2>All Orders</h2>
    <ordered-info
      v-for="order in orders"
      :key="order.id"
      :isSuperView="true"
      @selected="orderSelected($event)"
      :order="order"
    />
    <button @click="nextLoad">next</button>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";

import superMixin from "./SuperMixin";

export default {
  mixins: [superMixin],
  components: {
    OrderedInfo,
    BackButton
  },
  data() {
    return {
      orders: [],
      isLoading: false,
      last: null
    };
  },
  async mounted() {
    this.superPermissionCheck();
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      if (!this.isLoading) {
        this.isLoading = true;
        let query = db
          .collectionGroup("orders")
          .orderBy("timePlaced", "desc")
          .limit(100);
        if (this.last) {
          query = query.startAfter(this.last);
        }
        const snapshot = await query.get();

        if (!snapshot.empty) {
          this.last = snapshot.docs[snapshot.docs.length - 1];
          snapshot.docs.forEach(doc => {
            const order = doc.data();
            order.restaurantId = doc.ref.path.split("/")[1];
            order.id = doc.id;
            order.timePlaced = order.timePlaced.toDate();
            if (order.timeEstimated) {
              order.timeEstimated = order.timeEstimated.toDate();
            }
            this.orders.push(order);
          });
        } else {
          this.last = null;
        }
      }
      this.isLoading = false;
    },
    async nextLoad() {
      if (this.last) {
        this.loadData();
      }
    },
    orderSelected(order) {
      // We are re-using the restaurant owner's view.
      this.$router.push({
        path: "/admin/restaurants/" + order.restaurantId + "/orders/" + order.id
      });
    }
  }
};
</script>
