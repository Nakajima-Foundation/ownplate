<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button :url="`/admin/restaurants/`" />
        </div>
        <div class="flex-shrink-0">
          <router-link :to="'/r/' + restaurantId()">
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">launch</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.viewPage")
              }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Photo and Name -->
      <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 rounded-full bg-black bg-opacity-10 mr-4">
            <img
              :src="resizedProfileImage(shopInfo, '600')"
              class="w-9 h-9 rounded-full object-cover"
            />
          </div>
          <div class="text-base font-bold">
            {{ shopInfo.restaurantName }}
          </div>
        </div>
      </div>

      <!-- Suspend Button -->
      <div class="mt-4 lg:mt-0 lg:mr-4 flex-shrink-0">
        <b-button
          tag="router-link"
          :to="`/admin/restaurants/${restaurantId()}/suspend`"
          class="b-reset-tw"
        >
          <div
            v-if="this.shopInfo.suspendUntil"
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-red-700 bg-opacity-5"
          >
            <i class="material-icons text-lg text-red-700 mr-2"
              >remove_shopping_cart</i
            >
            <div class="text-sm font-bold text-red-700">
              {{ $t("admin.order.suspending") }}
            </div>
          </div>

          <div
            v-else
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal mr-2"
              >remove_shopping_cart</i
            >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.suspendSettings") }}
            </div>
          </div>
        </b-button>
      </div>

      <!-- Notifications -->
      <div class="mt-4 lg:mt-0 flex-shrink-0">
        <notification-index :shopInfo="shopInfo" />
      </div>
    </div>

    <!-- Orders -->
    <div class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4">
      <ordered-info
        v-for="order in orders"
        :key="order.id"
        @selected="orderSelected($event)"
        :order="order"
        :isSuperView="true"
      />
    </div>

    <!-- More -->
    <div class="mx-6 mt-6 text-center" v-if="last !== undefined">
      <b-button :disabled="last === null" @click="next" class="b-reset-tw">
        <div
          class="inline-flex justify-center items-center w-48 h-9 px-4 rounded-full bg-black bg-opacity-5"
        >
          <div class="text-sm font-bold text-op-teal">
            {{ $t("admin.order.more") }}
          </div>
        </div>
      </b-button>
    </div>

    <!-- More -->
    <div class="mx-6 mt-6 text-center" v-if="last !== undefined">
      <b-button :disabled="last === null" @click="all" class="b-reset-tw">
        <div
          class="inline-flex justify-center items-center w-48 h-9 px-4 rounded-full bg-black bg-opacity-5"
        >
          <div class="text-sm font-bold text-op-teal">
            {{ $t("admin.order.all") }}
          </div>
        </div>
      </b-button>
    </div>

    <!-- Download Orders -->
    <div class="mx-6 mt-6 text-center">
      <download-orders :orders="orders" v-if="shopOwner" />
    </div>

    <!-- Download Report -->
    <div class="mx-6 mt-6 text-center">
      <report-details
        :orders="orders"
        :fileName="fileName"
        :hideTable="true"
        :withStatus="true"
        :shopInfo="shopInfo"
        v-if="shopOwner"
      />
    </div>
  </div>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import { midNight } from "@/utils/dateUtils";
import OrderedInfo from "@/app/admin/Order/OrderedInfo";
import BackButton from "@/components/BackButton";
import { order_status } from "@/config/constant";
import moment from "moment";
import DownloadOrders from "@/components/DownloadOrders";
import NotificationIndex from "./Notifications/Index";
import ReportDetails from "@/app/admin/Order/ReportDetails";

import {
  getShopOwner
} from "@/utils/utils";

export default {
  components: {
    OrderedInfo,
    BackButton,
    NotificationIndex,
    DownloadOrders,
    ReportDetails,
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Order History",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  data() {
    return {
      shopInfo: {},
      limit: 60,
      last: undefined,
      orders: [],
      shopOwner: null,
    };
  },
  async created() {
    this.checkAdminPermission();
    const restaurantDoc = await db
      .doc(`restaurants/${this.restaurantId()}`)
      .get();
    if (!restaurantDoc.exists) {
      // todo not found
      return;
    }
    this.shopInfo = restaurantDoc.data();
    this.shopOwner = await getShopOwner(this.$store.getters.uidAdmin);
    this.next();
  },
  computed: {
    fileName() {
      return this.$t("order.history");
    },
  },
  methods: {
    async next() {
      let query = db
        .collection(`restaurants/${this.restaurantId()}/orders`)
        .orderBy("timePlaced", "desc")
        .limit(this.limit);
      if (this.last) {
        query = query.startAfter(this.last);
      }
      const docs = (await query.get()).docs;
      this.last = docs.length == this.limit ? docs[this.limit - 1] : null;
      const orders = docs
        .map(this.doc2data("order"))
        .filter((a) => a.status !== order_status.transaction_hide);

      const customers = {};
      if (this.shopInfo.isEC || this.shopInfo.enableDelivery) {
        const ids = orders.map((order) => order.id);
        await Promise.all(
          this.arrayChunk(ids, 10).map(async (arr) => {
            try {
              const cuss = await db
                .collectionGroup("customer")
                .where("restaurantId", "==", this.restaurantId())
                .where("orderId", "in", arr)
                .get();
              cuss.docs.map((cus) => {
                const data = cus.data();
                customers[data.orderId] = data;
              });
            } catch (e) {
              console.log(e);
            }
          })
        );
      }

      orders.forEach((order) => {
        order.customerInfo = order.customerInfo || customers[order.id] || {};
        order.timePlaced = order.timePlaced.toDate();
        if (order.timeEstimated) {
          order.timeEstimated = order.timeEstimated.toDate();
        }
        if (order.timeConfirmed) {
          order.timeConfirmed = order.timeConfirmed.toDate();
        }
        this.orders.push(order);
      });
    },
    async all() {
      while (this.last) {
        await this.next();
      }
    },
    orderSelected(order) {
      this.$router.push({
        path:
          "/admin/restaurants/" + this.restaurantId() + "/orders/" + order.id,
      });
    },
  },
};
</script>
