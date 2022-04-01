<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button url="/admin/restaurants/" />
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

    <!-- Date -->
    <div class="mx-6 mt-6">
      <b-select v-model="dayIndex">
        <option
          v-for="day in lastSeveralDays"
          :value="day.index"
          :key="day.index"
        >
          {{ $d(day.date, "short") }}
          {{ orderCounter[moment(day.date).format("YYYY-MM-DD")] }}
          <span v-if="day.index === pickUpDaysInAdvance">{{
            $t("date.today")
          }}</span>
        </option>
      </b-select>
    </div>

    <!-- Orders -->
    <div class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4">
      <ordered-info
        v-for="order in orders"
        :key="order.id"
        @selected="orderSelected($event)"
        :order="order"
      />
    </div>

    <!-- Go to History -->
    <div class="mx-6 mt-6">
      <router-link :to="`/admin/restaurants/${this.restaurantId()}/history`"
        ><div
          class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
        >
          <div class="text-sm font-bold text-op-teal">
            {{ $t("admin.order.history") }}
          </div>
        </div></router-link
      >
    </div>
  </div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import { midNight } from "~/plugins/dateUtils.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";
import BackButton from "~/components/BackButton";
import { order_status } from "~/plugins/constant.js";
import moment from "moment";

import NotificationIndex from "./Notifications/Index";

export default {
  components: {
    OrderedInfo,
    BackButton,
    NotificationIndex
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName ?
        ["Admin Order List", this.shopInfo.restaurantName , this.defaultTitle].join(" / ") : this.defaultTitle
    }
  },
  data() {
    return {
      shopInfo: {},
      orders: [],
      dayIndex: 0,
      order_detacher: () => {}
    };
  },
  watch: {
    dayIndex() {
      this.updateQueryDay();
      this.dateWasUpdated();
    },
    "$route.query.day"() {
      this.updateDayIndex();
    }
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
    this.dayIndex = this.getPickUpDaysInAdvance();

    if (this.$route.query.day) {
      this.updateDayIndex();
    }
    this.dateWasUpdated();
  },
  destroyed() {
    this.order_detacher();
  },
  computed: {
    orderCounter() {
      return this.lastSeveralDays.reduce((tmp, day) => {
        const count = (
          this.$store.state.orderObj[moment(day.date).format("YYYY-MM-DD")] ||
          []
        ).length;
        if (count > 0) {
          tmp[moment(day.date).format("YYYY-MM-DD")] = "(" + count + ")";
        }
        return tmp;
      }, {});
    },
    pickUpDaysInAdvance() {
      return this.getPickUpDaysInAdvance();
    },
    lastSeveralDays() {
      return Array.from(Array(10 + this.pickUpDaysInAdvance).keys()).map(
        index => {
          const date = midNight(this.pickUpDaysInAdvance - index);
          return { index, date };
        }
      );
    }
  },
  methods: {
    updateDayIndex() {
      const dayIndex =
        this.lastSeveralDays.findIndex(day => {
          return (
            moment(day.date).format("YYYY-MM-DD") === this.$route.query.day
          );
        }) || 0;
      this.dayIndex = dayIndex > 0 ? dayIndex : 0;
    },
    updateQueryDay() {
      const day = moment(this.lastSeveralDays[this.dayIndex].date).format(
        "YYYY-MM-DD"
      );
      this.$router.push({
        path: "/admin/restaurants/" + this.restaurantId() + "/orders?day=" + day
      });
    },
    dateWasUpdated() {
      this.order_detacher();
      let query = db
        .collection(`restaurants/${this.restaurantId()}/orders`)
        .where("timePlaced", ">=", this.lastSeveralDays[this.dayIndex].date);
      if (this.dayIndex > 0) {
        query = query.where(
          "timePlaced",
          "<",
          this.lastSeveralDays[this.dayIndex - 1].date
        );
      }
      this.order_detacher = query.onSnapshot(result => {
        let orders = result.docs.map(this.doc2data("order"));
        orders = orders
          .filter(a => a.status !== order_status.transaction_hide)
          .sort((order0, order1) => {
            if (order0.status === order1.status) {
              return (order0.timeEstimated || order0.timePlaced) >
                (order1.timeEstimated || order1.timePlaced)
                ? -1
                : 1;
            }
            return order0.status < order1.status ? -1 : 1;
          });
        this.orders = orders.map(order => {
          order.timePlaced = order.timePlaced.toDate();
          if (order.timeEstimated) {
            order.timeEstimated = order.timeEstimated.toDate();
          }
          return order;
        });
      });
    },
    orderSelected(order) {
      this.$router.push({
        path:
          "/admin/restaurants/" + this.restaurantId() + "/orders/" + order.id
      });
    },
    getPickUpDaysInAdvance() {
      return this.isNull(this.shopInfo.pickUpDaysInAdvance)
        ? 3
        : this.shopInfo.pickUpDaysInAdvance;
    }
  }
};
</script>
