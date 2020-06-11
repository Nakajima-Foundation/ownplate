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
                  {{ $d(day.date, "short" )}}
                  <span v-if="day.index===0">{{$t('date.today')}}</span>
                </option>
              </b-select>
            </div>
            <!-- Sound ON/OFF -->
            <div class="level-right">
              <div @click="soundToggle()" class="is-inline-block m-r-16 m-t-16">
                <div v-if="soundOn" class="op-button-pill bg-status-green-bg">
                  <i class="material-icons c-status-green s-18 m-r-8">volume_up</i>
                  <span class="c-status-green t-button">{{$t("admin.order.soundOn")}}</span>
                </div>
                <div v-else class="op-button-pill bg-status-red-bg">
                  <i class="material-icons c-status-red s-18 m-r-8">volume_off</i>
                  <span class="c-status-red t-button">{{$t("admin.order.soundOff")}}</span>
                </div>
              </div>
              <b-select v-model="soundIndex" class="m-t-24">
                <option v-for="(soundFile, index) in soundFiles" :value="index" :key="index">
                  {{ $t(soundFile.nameKey)}}
                </option>
              </b-select>

              <b-button class="b-reset h-36 r-36 bg-form m-r-16 m-t-16" @click="soundPlay()">
                <span class="p-l-16 p-r-16">
                  <span class="c-primary t-button">
                    <i class="material-icons c-primary s-18 m-r-8">play_arrow</i>
                    {{ $t('admin.order.soundTest') }}
                  </span>
                </span>
              </b-button>
              <router-link
                v-if="isLineEnabled"
                class="op-button-pill bg-status-green-bg m-t-16"
                :to="`/admin/restaurants/${restaurantId()}/line`"
              >
                <i class="fab fa-line m-r-8 c-status-green" style="font-size:24px" />
                <span class="c-status-green t-button">{{$t("admin.order.line")}}</span>
              </router-link>
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
      soundIndex: 0, // for debug
      soundFiles: soundFiles,
      soundOn: false,
      mySound: null,
      watchingOrder: false,
      shopInfo: {},
      orders: [],
      dayIndex: 0,
      restaurant_detacher: () => {},
      order_detacher: () => {},
      notification_data: {
        uid: this.$store.getters.uidAdmin,
        createdAt: firestore.FieldValue.serverTimestamp()
      }
    };
  },
  watch: {
    async soundIndex() {
      await db.doc(`restaurants/${this.restaurantId()}/private/sound`).set({
        index: this.soundIndex
      });
      this.$store.commit("setSoundFile", soundFiles[this.soundIndex].file);
    },
    dayIndex() {
      this.updateQueryDay();
      this.dateWasUpdated();
    },
    "$route.query.day"() {
      this.updateDayIndex();
    },
    soundOn() {
      this.$store.commit("setSoundOn", this.soundOn);
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

    const sound = (await db.doc(`restaurants/${this.restaurantId()}/private/sound`).get()).data();
    if (sound) {
      this.soundIndex = sound.index;
    }

    if (this.$route.query.day) {
      this.updateDayIndex();
    }
    this.dateWasUpdated();

    const notification = await db
      .doc(`restaurants/${this.restaurantId()}/private/notifications`)
      .get();
    if (notification.exists) {
      this.notification_data = notification.data();
      this.soundOn = this.notification_data.soundOn;
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
    enableSound() {
      return this.$store.state.soundEnable;
    }
  },
  methods: {
    async soundToggle() {
      this.soundOn = !this.soundOn;
      this.notification_data.soundOn = this.soundOn;
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
      this.watchingOrder = false;
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
        if (this.watchingOrder) {
          this.soundPlay();
        }
        this.watchingOrder = true;
      });
    },
    orderSelected(order) {
      this.$router.push({
        path:
          "/admin/restaurants/" + this.restaurantId() + "/orders/" + order.id
      });
    },
    soundPlay() {
      this.$store.commit("pingOrderEvent");
      console.log("order: call play");
    },
  }
};
</script>
