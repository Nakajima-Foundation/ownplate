<template>
  <section class="section" style="background-color:#fffafa">
    <back-button url="/admin/restaurants/" />
    <h2 class="p-big bold">{{ shopInfo.restaurantName }}</h2>
    <span :style=" enableSound ? {color: '#000000'}: {color: '#aaaaaa'} ">
      <span @click="soundToggle()"><b-icon :icon="soundOn ? 'volume-high' : 'volume-mute'" size="is-miadium"></b-icon></span>
    </span>
    <b-select v-model="dayIndex">
      <option v-for="day in lastSeveralDays" :value="day.index" :key="day.index">
        {{ $d(day.date, "short" )}}
        <span v-if="day.index===0">{{$t('date.today')}}</span>
      </option>
    </b-select>
    <div>
      <ordered-info
        v-for="order in orders"
        :key="order.id"
        @selected="orderSelected($event)"
        :order="order"
      />
    </div>
  </section>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import { midNight } from "~/plugins/dateUtils.js";
import OrderedInfo from "~/app/admin/Order/OrderedInfo";
import BackButton from "~/components/BackButton";
import { order_status } from "~/plugins/constant.js";
import moment from "moment";

export default {
  components: {
    OrderedInfo,
    BackButton
  },
  data() {
    return {
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
    if (this.$route.query.day) {
      this.updateDayIndex();
    }
    this.dateWasUpdated();

    const notification = await db.doc(`restaurants/${this.restaurantId()}/private/notifications`).get();
    if (notification.exists) {
      this.notification_data = notification.data();
      this.soundOn = this.notification_data.soundOn;
    };
    console.log(notification);
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
    },
  },
  methods: {
    async soundToggle() {
      console.log("HELLO");
      this.soundOn = !this.soundOn;
      this.notification_data.soundOn = this.soundOn;
      this.notification_data.updatedAt = firestore.FieldValue.serverTimestamp();
      await db.doc(`restaurants/${this.restaurantId()}/private/notifications`).set(this.notification_data);
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
    }
  }
};
</script>

<style lang="scss">
</style>
