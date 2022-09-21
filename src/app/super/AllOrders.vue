<template>
  <div>
    <!-- Order Body Area -->
    <div class="columns is-gapless">
      <!-- Center Column -->
      <div class="column">
        <div class="ml-6 mr-4 mt-6">
          <back-button :url="backUrl" />

          <h2>All Orders</h2>
          <o-select v-model="orderState" class="mt-6">
            <option
              v-for="status in orderStatus"
              :value="status.index"
              :key="status.index"
            >
              {{ status.key ? $t("order.status." + status.key) : "----" }}
            </option>
          </o-select>
          <!-- button -->
          <div>
            <div class="inline-flex mt-6">
              <div class="flex">
                <o-select v-model="monthValue">
                  <option v-for="(month, k) in months" :value="month" :key="k">
                    {{ month }}
                  </option>
                </o-select>
              </div>
              <div class="flex">
                <o-button @click="LoadTillMonth">Load</o-button>
                {{ isLoading ? "Loading..." : "" }}
              </div>
            </div>
          </div>

          <!-- Orders -->
          <div
            class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <div v-for="order in filteredOrders" :key="order.id">
              <ordered-info
                :isSuperView="true"
                @selected="orderSelected($event)"
                :order="order"
                :isInMo="false"
              />
              <router-link :to="`/s/restaurants/${order.restaurantId}`">
                {{ order.restaurant.restaurantName }}
              </router-link>
            </div>
          </div>
          <div>
            <o-button @click="nextLoad" class="rounded-full mt-4"
              >more</o-button
            >
          </div>

          <download-csv
            :data="tableData"
            :fields="fields"
            :fieldNames="fieldNames"
            :fileName="fileName"
          >
            <o-button class="h-9 rounded-full mt-4">
              <span class="pl-4 pr-4">
                <i class="material-icons c-primary s-18 mr-2">save_alt</i>
                <span class="c-primary t-button">{{
                  $t("admin.report.download-csv")
                }}</span>
              </span>
            </o-button>
          </download-csv>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/plugins/firebase";

import superMixin from "@/mixins/SuperMixin";
import moment from "moment";

import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import BackButton from "@/components/BackButton.vue";
import DownloadCsv from "@/components/DownloadCSV.vue";

import { order_status, order_status_keys } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { arrayOrNumSum } from "@/utils/utils";

export default {
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Orders"].join(" / "),
    };
  },
  mixins: [superMixin],
  components: {
    OrderedInfo,
    DownloadCsv,
    BackButton,
  },
  data() {
    const months = [0, 1, 2, 3, 4, 5].map((a) => {
      return moment().subtract(a, "month").format("YYYY-MM");
    });
    return {
      orders: [],
      orderState: 0,
      monthValue: months[0],
      isLoading: false,
      last: null,
      restaurants: {},
      months,
    };
  },
  async mounted() {
    this.superPermissionCheck();
  },
  computed: {
    orderStatus() {
      return Object.keys(order_status).map((key) => {
        return {
          index: order_status[key],
          key: key === "error" ? "" : key,
        };
      });
    },
    filteredOrders() {
      return this.orders.filter((order) => {
        if (this.orderState === 0) {
          return true;
        }
        return order.status === this.orderState;
      });
    },
    fileName() {
      return "super-all-orders";
    },
    fields() {
      return [
        "date",
        "restaurantName",
        "orderStatus",
        "total",
        "revenue",
        "name",
        "payment",
      ];
    },
    fieldNames() {
      return this.fields.map((field) => {
        return this.$t(`order.${field}`);
      });
    },
    tableData() {
      return this.filteredOrders.map((order) => {
        const time = order.timeEstimated || order.timePlaced;
        return {
          date: time ? this.moment(time).format("YYYY/MM/DD") : "",
          restaurantName: order.restaurant.restaurantName,
          orderStatus: this.$t(
            "order.status." + order_status_keys[order.status]
          ),
          revenue: order.totalCharge,
          total: Object.values(order.order).reduce((count, order) => {
            return count + arrayOrNumSum(order);
          }, 0),
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : "",
        };
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
          let i = 0;
          for (; i < snapshot.docs.length; i++) {
            const doc = snapshot.docs[i];
            const order = doc.data();
            order.restaurantId = doc.ref.path.split("/")[1];
            order.id = doc.id;
            order.timePlaced = order.timePlaced.toDate();
            if (!this.restaurants[order.restaurantId]) {
              const snapshot = await db
                .doc(`restaurants/${order.restaurantId}`)
                .get();
              this.restaurants[order.restaurantId] = snapshot.data();
            }
            order.restaurant = this.restaurants[order.restaurantId];
            if (order.timeEstimated) {
              order.timeEstimated = order.timeEstimated.toDate();
            }
            this.orders.push(order);
          }
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
    async LoadTillMonth() {
      const limit = moment(this.monthValue + "-01 00:00:00+09:00");
      while (
        moment(this.orders[this.orders.length - 1].timeCreated.toDate()) > limit
      ) {
        await this.loadData();
      }
    },
    orderSelected(order) {
      // We are re-using the restaurant owner's view.
      this.$router.push({
        path:
          "/admin/restaurants/" + order.restaurantId + "/orders/" + order.id,
      });
    },
  },
};
</script>
