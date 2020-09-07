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
              <back-button url="/admin/restaurants/" class="m-t-24 m-r-16" />

              <!-- Restaurant Profile -->
              <div class="is-inline-flex flex-center m-t-24">
                <div>
                  <img :src="resizedProfileImage(shopInfo, '600')" class="w-36 h-36 r-36 cover" />
                </div>
                <div class="t-h6 c-text-black-high m-l-8 flex-1">{{ shopInfo.restaurantName }}</div>
              </div>
            </div>

            <!-- Suspend and Notification -->
            <div class="level-right">
              <!-- Suspend Button -->
              <b-button
                tag="nuxt-link"
                :to="`/admin/restaurants/${restaurantId()}/suspend`"
                class="b-reset op-button-pill h-36 bg-form m-t-24 m-r-16"
              >
                <i class="material-icons c-primary m-l-8">remove_shopping_cart</i>
                <span class="c-primary t-button">{{ $t("admin.order.suspend") }}</span>
                <!-- # ToDO: Show number of suspended items. -->
                <span class="t-button c-status-red">0</span>
              </b-button>

              <!-- Notification Settings -->
              <notification-index :shopInfo="shopInfo" />
            </div>
          </div>

          <!-- Date and Sound -->
          <div class="level">
            <!-- Select Date -->
            <div class="level-left">
              <b-select v-model="dayIndex" class="m-t-24">
                <option v-for="day in lastSeveralDays" :value="day.index" :key="day.index">
                  {{ $d(day.date, "short") }} {{ orderCounter[moment(day.date).format("YYYY-MM-DD")] }}
                  <span
                    v-if="day.index === pickUpDaysInAdvance"
                  >{{ $t("date.today") }}</span>
                </option>
              </b-select>
            </div>

            <div class="level-right"></div>
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
          <!-- Orders -->
          <div class="columns is-gapless is-multiline">
            <ordered-info
              v-for="order in orders"
              :key="order.id"
              @selected="orderSelected($event)"
              :order="order"
            />
          </div>
          <div class="m-t-24">
            <nuxt-link
              :to="`/admin/restaurants/${this.restaurantId()}/history`"
            >{{$t("admin.order.history")}}</nuxt-link>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
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
        orders = orders.sort((order0, order1) => {
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
