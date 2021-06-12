<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button :url="`/admin/restaurants/${restaurantId()}/orders`" />
        </div>
        <div class="flex-shrink-0">
          <nuxt-link :to="'/r/' + restaurantId()">
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">launch</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.viewPage")
              }}</span>
            </div>
          </nuxt-link>
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

    <!-- Title -->
    <div class="mt-6 mx-6 text-xl font-bold text-black text-opacity-30">
      {{ $t("admin.order.suspendSettings") }}
    </div>

    <!-- Date -->
    <div class="mt-4 mx-6 text-sm font-bold text-black text-opacity-60">
      {{ $t("admin.order.suspendNewOrders") }}
      <span v-if="date">: {{ $d(date.date, "short") }}</span>
    </div>

    <!-- Suspend and Unsuspend  -->
    <div class="mt-6 mx-6">
      <div v-if="!suspendUntil">
        <b-button
          v-for="time in availableTimes"
          :key="time.time"
          @click="handleSuspend(time.time)"
          class="b-reset-tw mr-4 mb-4"
        >
          <div
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal mr-2">alarm_off</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.suspendUntil", { display: time.display }) }}
            </div>
          </div>
        </b-button>

        <div class="mt-4">
          <b-button
            v-if="availableTimes.length > 0"
            class="b-reset-tw"
            @click="handleSuspend(24 * 60)"
          >
            <div
              class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
            >
              <i class="material-icons text-lg text-op-teal mr-2">alarm_off</i>
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.order.suspendForAllDay") }}
              </div>
            </div>
          </b-button>
        </div>
      </div>

      <div v-else>
        <div class="mt-4 p-4 bg-red-700 bg-opacity-10 rounded-lg text-center">
          <div class="text-base font-bold text-red-700">
            {{ $t("admin.order.suspending") }}
          </div>
          <div class="text-sm font-bold text-red-700 mt-2">
            {{ $t("admin.order.unsuspendAt") }} {{ suspendUntil }}
          </div>
        </div>

        <div class="mt-4">
          <b-button class="b-reset-tw" @click="handleRemove">
            <div
              class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
            >
              <i class="material-icons text-lg text-op-teal mr-2">alarm_on</i>
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.order.unsuspend") }}
              </div>
            </div>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import PickupMixin from "~/app/user/Order/pickupMixin";
import firebase from "firebase/app";

import NotificationIndex from "./Notifications/Index";

export default {
  mixins: [PickupMixin],
  components: {
    BackButton,
    NotificationIndex
  },
  data() {
    return {
      shopInfo: {},
      menus: [],
      date: null,
      titles: [],
      detacher: [],
      notFound: null
    };
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data;
        if (
          restaurant.exists &&
          !restaurant.data().deletedFlag &&
          restaurant.data().publicFlag
        ) {
          this.notFound = false;
        } else {
          this.notFound = true;
        }
      });
    const menu_detacher = db
      .collection(`restaurants/${this.restaurantId()}/menus`)
      .where("deletedFlag", "==", false)
      .where("publicFlag", "==", true)
      .onSnapshot(menu => {
        if (!menu.empty) {
          this.menus = menu.docs
            .filter(a => {
              const data = a.data();
              return data.validatedFlag === undefined || data.validatedFlag;
            })
            .map(this.doc2data("menu"));
        }
      });
    const title_detacher = db
      .collection(`restaurants/${this.restaurantId()}/titles`)
      .onSnapshot(title => {
        if (!title.empty) {
          this.titles = title.docs.map(this.doc2data("title"));
        }
      });
    this.detacher = [restaurant_detacher, menu_detacher, title_detacher];
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map(detacher => {
        detacher();
      });
    }
  },
  computed: {
    availableTimes() {
      // Note: availableDays will change if we change shopInfo.suspendUntil.
      // This logic works because we use availableDays when suspendUntil is not set or too old.
      if (this.availableDays.length > 0) {
        this.date = this.availableDays[0];
        console.log(this.date.date);
        const times = this.date.times;
        return times.slice(1, 13); // first twelve time slots (except first) regardless of the time
      } else {
        this.date = null;
      }
      return [];
    },
    itemsObj() {
      return this.array2obj(this.menus.concat(this.titles));
    },
    menuLists() {
      const list = this.shopInfo.menuLists || [];
      return list;
    },
    suspendUntil() {
      if (this.shopInfo.suspendUntil) {
        const time = this.shopInfo.suspendUntil.toDate();
        if (time < new Date()) {
          return false;
        }
        return this.$d(time, "time");
      }
      return false;
    }
  },
  methods: {
    async handleSuspend(time) {
      const date = new Date(this.date.date);
      date.setHours(time / 60);
      date.setMinutes(time % 60);
      const ts = firebase.firestore.Timestamp.fromDate(date);
      console.log(ts);
      this.$store.commit("setLoading", true);
      await db.doc(`restaurants/${this.restaurantId()}`).update({
        suspendUntil: ts
      });
      this.$store.commit("setLoading", false);
    },
    async handleRemove() {
      this.$store.commit("setLoading", true);
      await db.doc(`restaurants/${this.restaurantId()}`).update({
        suspendUntil: null
      });
      this.$store.commit("setLoading", false);
    }
  }
};
</script>
