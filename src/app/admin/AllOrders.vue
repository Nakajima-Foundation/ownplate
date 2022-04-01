<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/restaurants/" />
      </div>

      <!-- Title -->
      <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
        <span class="text-base font-bold">
          {{ $t("order.allOrders") }}
        </span>
      </div>
    </div>

    <!-- Order Status -->
    <div class="mx-6 mt-6">
      <b-select v-model="orderState">
        <option
          v-for="status in orderStatus"
          :value="status.index"
          :key="status.index"
        >
          {{ status.key ? $t("order.status." + status.key) : "----" }}
        </option>
      </b-select>
    </div>

    <!-- Orders -->
    <div class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4">
      <ordered-info
        v-for="order in filteredOrders"
        :key="order.id"
        :isSuperView="true"
        @selected="orderSelected($event)"
        :order="order"
      />
    </div>

    <!-- More -->
    <div class="mx-6 mt-6 text-center">
      <b-button @click="nextLoad" class="b-reset-tw">
        <div
          class="inline-flex justify-center items-center w-48 h-9 px-4 rounded-full bg-black bg-opacity-5"
        >
          <div class="text-sm font-bold text-op-teal">
            {{ $t("admin.order.more") }}
          </div>
        </div>
      </b-button>
    </div>

    <!-- Download -->
    <div class="mx-6 mt-6 text-center">
      <download-csv
        :data="tableData"
        :fields="fields"
        :fieldNames="fieldNames"
        :fileName="fileName"
      >
        <b-button class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal mr-2">save_alt</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.report.download-csv") }}
            </div>
          </div>
        </b-button>
      </download-csv>
    </div>
  </div>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";
import { order_status, order_status_keys } from "~/plugins/constant.js";
import { nameOfOrder } from "~/plugins/strings.js";
import DownloadCsv from "~/components/DownloadCSV";

export default {
  components: {
    OrderedInfo,
    DownloadCsv,
    BackButton,
  },
  metaInfo() {
    return {
      title: ["Admin All Order", this.defaultTitle].join(" / "),
    };
  },
  data() {
    return {
      orders: [],
      orderState: 0,
      isLoading: false,
      last: null,
      restaurants: {},
    };
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
    orderStatus() {
      return Object.keys(order_status)
        .filter((key) => {
          return [
            "order_placed", // by user and stripe
            "order_accepted", // by restaurant
            "ready_to_pickup", // by restaurant and stripe
            "transaction_complete", // by restaurant (optional)
            "order_canceled", // by restaurant or user
          ].includes(key);
        })
        .map((key) => {
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
      return "hello";
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
            return count + this.arrayOrNumSum(order);
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
          .where("ownerUid", "==", this.uid)
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
