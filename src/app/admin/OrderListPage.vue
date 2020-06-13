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
                <img
                  :src="shopInfo.restProfilePhoto"
                  class="w-36 h-36 r-36 cover"
                />
              </div>
              <div class="t-h6 c-text-black-high m-l-8">
                {{ shopInfo.restaurantName }}
              </div>
            </div>
          </div>

          <!-- Date and Sound -->
          <div class="level">
            <!-- Select Date -->
            <div class="level-left">
              <b-select v-model="dayIndex" class="m-t-24">
                <option
                  v-for="day in lastSeveralDays"
                  :value="day.index"
                  :key="day.index"
                >
                  {{ $d(day.date, "short") }}
                  <span v-if="day.index === 0">{{ $t("date.today") }}</span>
                </option>
              </b-select>
            </div>

            <div class="level-right">
              <!-- Notification Settings Button -->
              <div
                class="op-button-pill bg-form m-t-24"
                @click="openNotificationSettings()"
              >
                <i class="material-icons">settings</i>
                <span class="t-button">{{
                  $t("admin.order.notificationSettings")
                }}</span>

                <span v-if="notification_data.soundOn">
                  <i class="material-icons c-status-green s-18">volume_up</i>
                  <span v-if="notification_data.infinityNotification"
                    ><i class="material-icons c-status-green s-18"
                      >repeat</i
                    ></span
                  >
                  <span v-else
                    ><i class="material-icons c-status-green s-18"
                      >looks_one</i
                    ></span
                  >
                </span>
                <i v-else class="material-icons c-status-red s-18"
                  >volume_off</i
                >
              </div>

              <!-- Notification Settings Popup-->
              <b-modal
                :active.sync="NotificationSettingsPopup"
                :width="488"
                scroll="keep"
              >
                <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
                  <!-- Title -->
                  <div class="t-h6 c-text-black-disabled">
                    {{ $t("admin.order.notificationSettings") }}
                  </div>
                  <!-- Body -->
                  <div>
                    <!-- Sound ON/OFF -->
                    <div
                      @click="soundToggle()"
                      class="is-inline-block m-r-16 m-t-16"
                    >
                      <div
                        v-if="notification_data.soundOn"
                        class="op-button-pill bg-status-green-bg"
                      >
                        <i class="material-icons c-status-green s-18"
                          >volume_up</i
                        >
                        <span class="c-status-green t-button">{{
                          $t("admin.order.soundOn")
                        }}</span>
                      </div>
                      <div v-else class="op-button-pill bg-status-red-bg">
                        <i class="material-icons c-status-red s-18"
                          >volume_off</i
                        >
                        <span class="c-status-red t-button">{{
                          $t("admin.order.soundOff")
                        }}</span>
                      </div>
                    </div>

                    <!-- Sound ON Settings -->
                    <div
                      v-if="notification_data.soundOn"
                      class="r-16 p-l-16 p-r-16 p-t-16 p-b-16 m-t-16"
                      style="border: 2px solid rgba(0,0,0,0.1); "
                    >
                      <!-- Infinity Notification ON/OFF -->
                      <div
                        @click="infinityNotificationToggle()"
                        class="is-inline-block"
                      >
                        <div
                          v-if="notification_data.infinityNotification"
                          class="op-button-pill bg-status-green-bg"
                        >
                          <i class="material-icons c-status-green s-18"
                            >repeat</i
                          >
                          <span class="c-status-green t-button">{{
                            $t("admin.order.infinityNotificationOn")
                          }}</span>
                        </div>
                        <div v-else class="op-button-pill bg-status-green-bg">
                          <i class="material-icons c-status-green s-18"
                            >looks_one</i
                          >
                          <span class="c-status-green t-button">{{
                            $t("admin.order.infinityNotificationOff")
                          }}</span>
                        </div>
                      </div>

                      <!-- Sound Type and Test -->
                      <div class="cols flex-center m-t-16">
                        <!-- Sound Type -->
                        <b-select v-model="soundIndex" class="m-r-16">
                          <option
                            v-for="(soundFile, index) in soundFiles"
                            :value="index"
                            :key="index"
                          >
                            {{ $t(soundFile.nameKey) }}
                          </option>
                        </b-select>

                        <!-- Sound Test -->
                        <b-button
                          class="b-reset op-button-pill bg-form"
                          @click="soundPlay()"
                        >
                          <i class="material-icons c-primary s-18 m-l-8"
                            >play_arrow</i
                          >
                          <span class="c-primary t-button">{{
                            $t("admin.order.soundTest")
                          }}</span>
                        </b-button>
                      </div>
                    </div>

                    <!-- LINE Connection -->
                    <router-link
                      v-if="isLineEnabled"
                      class="op-button-pill bg-status-green-bg m-t-16"
                      :to="`/admin/restaurants/${restaurantId()}/line`"
                    >
                      <i
                        class="fab fa-line c-status-green"
                        style="font-size:24px"
                      />
                      <span class="c-status-green t-button">{{
                        $t("admin.order.line")
                      }}</span>
                    </router-link>
                  </div>

                  <!-- Action Buttons -->
                  <div class="m-t-24 align-center">
                    <div
                      class="op-button-small tertiary"
                      @click="closeNotificationSettings()"
                    >
                      {{ $t("menu.close") }}
                    </div>
                  </div>
                </div>
              </b-modal>
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

import { soundFiles } from "~/plugins/constant.js";

export default {
  components: {
    OrderedInfo,
    BackButton
  },
  data() {
    return {
      soundIndex: undefined, // for debug
      soundFiles: soundFiles,
      mySound: null,
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
      intervalTask: {},
      intervalTime: 60 // (seconds)
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
    async "notification_data.soundOn"() {
      this.$store.commit("setSoundOn", this.notification_data.soundOn);
      await this.saveNotificationData();
    },
    async "notification_data.infinityNotification"() {
      await this.saveNotificationData();
    },
    async soundIndex(newData, oldData) {
      this.notification_data.nameKey = soundFiles[this.soundIndex].nameKey;
      this.$store.commit("setSoundFile", soundFiles[this.soundIndex].file);
      // Ignore the very first change
      if (oldData !== undefined) {
        await this.saveNotificationData();
      }
    }
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
    let soundIndex = 0;
    if (notification.exists) {
      this.notification_data = Object.assign(
        this.notification_data,
        notification.data()
      );
      if (this.notification_data.nameKey) {
        const index = soundFiles.findIndex(
          data => data.nameKey === this.notification_data.nameKey
        );
        if (index >= 0) {
          soundIndex = 0;
        }
      }
    }
    this.soundIndex = soundIndex;
    this.intervalTask = setInterval(() => {
      if (this.notification_data.infinityNotification && this.hasNewOrder) {
        this.soundPlay();
      }
    }, 1000 * this.intervalTime);
  },
  destroyed() {
    this.restaurant_detacher();
    this.order_detacher();
    clearInterval(this.intervalTask);
  },
  computed: {
    lastSeveralDays() {
      return Array.from(Array(10).keys()).map(index => {
        const date = midNight(-index);
        return { index, date };
      });
    },
    enableSound() {
      return this.$store.state.soundEnable;
    },
    hasNewOrder() {
      return this.orders.some(order => {
        return order.status === order_status.order_placed;
      });
    }
  },
  methods: {
    openNotificationSettings() {
      this.NotificationSettingsPopup = true;
    },
    closeNotificationSettings() {
      this.NotificationSettingsPopup = false;
    },
    soundToggle() {
      this.notification_data.soundOn = !this.notification_data.soundOn;
    },
    infinityNotificationToggle() {
      this.notification_data.infinityNotification = !this.notification_data
        .infinityNotification;
    },
    async saveNotificationData() {
      this.notification_data.updatedAt = firestore.FieldValue.serverTimestamp();
      await db
        .doc(`restaurants/${this.restaurantId()}/private/notifications`)
        .set(this.notification_data);
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
