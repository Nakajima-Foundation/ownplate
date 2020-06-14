<template>
  <div>
    <!-- Order Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Back Button and Restaurant Profile -->
          <div>
            <!-- Back Button -->
            <back-button url="/admin/restaurants/" class="m-t-24" />

            <!-- Restaurant Profile -->
            <div class="is-inline-flex flex-center m-l-16 m-t-24">
              <div>
                <img :src="shopInfo.restProfilePhoto" class="w-36 h-36 r-36 cover" />
              </div>
              <div class="t-h6 c-text-black-high m-l-8">{{ shopInfo.restaurantName }}</div>
            </div>
          </div>

          <!-- Date and Sound -->
          <div class="level">
            <!-- Select Date -->
            <div class="level-left">
              <b-select v-model="dayIndex" class="m-t-24">
                <option v-for="day in lastSeveralDays" :value="day.index" :key="day.index">
                  {{ $d(day.date, "short") }}
                  <span v-if="day.index === 0">{{ $t("date.today") }}</span>
                </option>
              </b-select>
            </div>

            <div class="level-right">
              <!-- Notification Settings Button -->
              <div class="op-button-pill bg-form m-t-24" @click="openNotificationSettings()">
                <i class="material-icons">settings</i>
                <span class="t-button">
                  {{
                  $t("admin.order.notificationSettings")
                  }}
                </span>

                <span v-if="notification_data.soundOn">
                  <i class="material-icons c-status-green s-18">volume_up</i>
                  <span v-if="notification_data.infinityNotification">
                    <i class="material-icons c-status-green s-18">repeat</i>
                  </span>
                  <span v-else>
                    <i class="material-icons c-status-green s-18">looks_one</i>
                  </span>
                </span>
                <i v-else class="material-icons c-status-red s-18">volume_off</i>
              </div>

              <!-- Notification Settings Popup-->
              <notification-settings
                :notification_data="notification_data"
                :NotificationSettingsPopup="NotificationSettingsPopup"
                @close="closeNotificationSettings"
                />
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
          <!-- Orders -->
          <div class="columns is-gapless is-multiline">
            <ordered-info
              v-for="order in orders"
              :key="order.id"
              @selected="orderSelected($event)"
              :order="order"
            />
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

import NotificationSettings from "./Notifications/NotificationSettings";

export default {
  components: {
    OrderedInfo,
    BackButton,
    NotificationSettings,
  },
  data() {
    return {
      shopInfo: {},
      orders: [],
      dayIndex: 0,
      restaurant_detacher: () => {},
      order_detacher: () => {},
      NotificationSettingsPopup: false,
      notification_data: {
        soundOn: null,
        infinityNotification: null,
        uid: this.$store.getters.uidAdmin,
        createdAt: firestore.FieldValue.serverTimestamp()
      },
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
    this.restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        if (restaurant.exists) {
          const restaurant_data = restaurant.data();
          this.shopInfo = restaurant_data;
        }
      });
    if (this.$route.query.day) {
      this.updateDayIndex();
    }
    this.dateWasUpdated();

    const notification = await db
      .doc(`restaurants/${this.restaurantId()}/private/notifications`)
      .get();
    if (notification.exists) {
      this.notification_data = Object.assign(
        this.notification_data,
        notification.data()
      );
    }
  },
  destroyed() {
    this.restaurant_detacher();
    this.order_detacher();
  },
  computed: {
    lastSeveralDays() {
      return Array.from(Array(10).keys()).map(index => {
        const date = midNight(-index);
        return { index, date };
      });
    },
  },
  methods: {
    openNotificationSettings() {
      this.NotificationSettingsPopup = true;
    },
    closeNotificationSettings() {
      this.NotificationSettingsPopup = false;
    },
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
            return order0.timePlaced > order1.timePlaced ? -1 : 1;
          }
          return order0.status < order1.status ? -1 : 1;
        });
        this.orders = orders.map(order => {
          order.timePlaced =
            (order.timePlaced && order.timePlaced.toDate()) || new Date();
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
  }
};
</script>
