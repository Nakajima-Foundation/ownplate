<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mt-6 mx-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="'/admin/restaurants/'"
        :showSuspend="true"
        />

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
      <div
        class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <template v-for="order in orders">
          <router-link
            :to="'/admin/restaurants/' + restaurantId() + '/orders/' + order.id"
            :key="order.id"
          >
            <ordered-info :key="order.id" :order="order" />
          </router-link>
        </template>
      </div>

      <!-- Go to History -->
      <div class="mx-6 mt-6">
        <router-link :to="`/admin/restaurants/${restaurantId()}/history`"
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
  </div>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import { midNight } from "@/utils/dateUtils";
import { order_status } from "@/config/constant";
import moment from "moment";

import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { doc2data, isNull } from "@/utils/utils";

export default {
  components: {
    OrderedInfo,
    NotFound,
    AdminHeader,
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Order List",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      orders: [],
      dayIndex: 0,
      order_detacher: () => {},
      notFound: null,
    };
  },
  watch: {
    dayIndex() {
      this.updateQueryDay();
      this.dateWasUpdated();
    },
    "$route.query.day"() {
      this.updateDayIndex();
    },
  },
  async created() {
    this.checkAdminPermission();
    if (!this.checkShopAccount(this.shopInfo)) {
      this.notFound = true;
      return true;
    }
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
        (index) => {
          const date = midNight(this.pickUpDaysInAdvance - index);
          return { index, date };
        }
      );
    },
  },
  methods: {
    updateDayIndex() {
      const dayIndex =
        this.lastSeveralDays.findIndex((day) => {
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
      if (this.$route.query.day !== day) {
        this.$router.push({
          path:
            "/admin/restaurants/" + this.restaurantId() + "/orders?day=" + day,
        });
      }
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
      this.order_detacher = query.onSnapshot((result) => {
        this.orders = result.docs
          .map(doc2data("order"))
          .filter((a) => a.status !== order_status.transaction_hide)
          .sort((order0, order1) => {
            if (order0.status === order1.status) {
              return (order0.timeEstimated || order0.timePlaced) >
                (order1.timeEstimated || order1.timePlaced)
                ? -1
                : 1;
            }
            return order0.status < order1.status ? -1 : 1;
          })
          .map((order) => {
            order.timePlaced = order.timePlaced.toDate();
            if (order.timeEstimated) {
              order.timeEstimated = order.timeEstimated.toDate();
            }
            return order;
          });
      });
    },
    getPickUpDaysInAdvance() {
      return isNull(this.shopInfo.pickUpDaysInAdvance)
        ? 3
        : this.shopInfo.pickUpDaysInAdvance;
    },
  },
};
</script>
