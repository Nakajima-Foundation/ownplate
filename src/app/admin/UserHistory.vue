<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button
            :url="`/admin/restaurants/${restaurantId()}/orders/` + orderId"
          />
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

      <!-- Notifications -->
      <div class="mt-4 lg:mt-0 flex-shrink-0">
        <notification-index :shopInfo="shopInfo" />
      </div>
    </div>

    <div v-if="orders[0] && orders[0].phoneNumber" class="mt-4 text-center">
      <div class="text-xs font-bold">
        {{ $t("sms.phonenumber") }}
      </div>
      <div class="text-base mt-1">
        <div>
          <a :href="nationalPhoneURI" class="text-base font-bold">{{
            nationalPhoneNumber
          }}</a>
        </div>
        <div class="text-base">{{ orders[0].name }}</div>
      </div>
      <div>
        {{ $t("order.orderTimes") }}:
        {{ $tc("order.orderTimesUnit", userLog.counter || 0) }} /
        {{ $t("order.cancelTimes") }}:
        {{ $tc("order.cancelTimesUnit", userLog.cancelCounter || 0) }}
      </div>
      <div>
        {{ $t("order.lastOrder") }}:
        {{
          userLog.lastOrder
            ? moment(userLog.lastOrder.toDate()).format("YYYY/MM/DD HH:mm")
            : "--"
        }}
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
  </div>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import { midNight } from "@/utils/dateUtils";
import OrderedInfo from "@/app/admin/Order/OrderedInfo";
import BackButton from "@/components/BackButton";
import { order_status } from "@/config/constant";
import moment from "moment";
import NotificationIndex from "./Notifications/Index";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";

export default {
  components: {
    OrderedInfo,
    BackButton,
    NotificationIndex,
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
      limit: 30,
      last: undefined,
      orders: [],
      userLog: {},
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
    this.next();

    this.getUserLog();
  },
  computed: {
    fileName() {
      return this.$t("order.history");
    },
    uid() {
      return this.$route.params.userId;
    },
    orderId() {
      return this.$route.query.orderId;
    },
    phoneNumber() {
      return (
        this.orders[0] &&
        this.orders[0].phoneNumber &&
        parsePhoneNumber(this.orders[0].phoneNumber)
      );
    },
    nationalPhoneNumber() {
      return formatNational(this.phoneNumber);
    },
    nationalPhoneURI() {
      return formatURL(this.phoneNumber);
    },
  },
  methods: {
    async getUserLog() {
      const res = await db
        .doc(`restaurants/${this.restaurantId()}/userLog/${this.uid}`)
        .get();
      if (res.exists) {
        this.userLog = res.data();
      }
    },
    async next() {
      let query = db
        .collection(`restaurants/${this.restaurantId()}/orders`)
        .where("uid", "==", this.uid)
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
      orders.forEach((order) => {
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
    orderSelected(order) {
      this.$router.push({
        path:
          "/admin/restaurants/" + this.restaurantId() + "/orders/" + order.id,
      });
    },
  },
};
</script>
