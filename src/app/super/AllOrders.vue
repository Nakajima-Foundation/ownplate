<template>
  <div>
    <!-- Order Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Nav Bar -->
          <div class="level">
            <!-- Back Button and Restaurant Profile -->
            <div class="level-left flex-1">
              <!-- Back Button -->
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>      
    <!-- Order Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-16 m-t-24">
          <back-button :url="backUrl" />
          <h2>All Orders</h2>
          <b-select v-model="orderState" class="m-t-24">
            <option v-for="status in orderStatus" :value="status.index" :key="status.index">
              {{status.key ? $t("order.status." + status.key) : "----"}}
            </option>
          </b-select>
          <!-- Orders -->
          <div class="columns is-gapless is-multiline">
            <ordered-info
              v-for="order in filteredOrders"
              :key="order.id"
              :isSuperView="true"
              @selected="orderSelected($event)"
              :order="order"
              />
            <button @click="nextLoad">next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";
import { order_status } from "~/plugins/constant.js";
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
      orderState: 0,
      isLoading: false,
      last: null
    };
  },
  async mounted() {
    this.superPermissionCheck();
  },
  computed: {
    orderStatus () {
      return Object.keys(order_status).map(key => {
        return {
          index: order_status[key],
          key: key === "error" ?  "" : key,
        };
      });
    },
    filteredOrders() {
      return this.orders.filter(order => {
        if (this.orderState === 0) {
          return true;
        }
        return order.status === this.orderState;
      });
    },
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
