<template>
  <div>
    <!-- Header Area -->
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
              <back-button
                :url="`/admin/restaurants/${restaurantId()}/orders`"
                class="m-t-24 m-r-16"
              />

              <!-- Restaurant Profile -->
              <div class="is-inline-flex flex-center m-t-24">
                <div>
                  <img :src="shopInfo.restProfilePhoto" class="w-36 h-36 r-36 cover" />
                </div>
                <div class="t-h6 c-text-black-high m-l-8 flex-1">{{ shopInfo.restaurantName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>

      <!-- Left Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <div class="t-h6 c-text-black-disabled m-t-24">{{ $t("admin.order.suspendSettings") }}</div>

          <!-- Suspend New Orders -->
          <div>
            <div
              class="t-subtitle2 c-text-black-medium m-t-16"
            >{{ $t("admin.order.suspendNewOrders") }}</div>
            <!-- # ToDo: Switch Suspend/Unsuspend buttons based on the status. -->
            <!-- Suspend Buttons -->
            <div v-if="true">
              <b-button
                v-for="time in availableTimes"
                :key="time.time"
                @click="handleSuspend(time.time)"
                class="b-reset op-button-pill bg-form m-t-16 m-r-16"
              >
                <i class="material-icons p-l-8 c-primary">alarm_off</i>
                <span
                  class="t-button p-r-8 c-primary"
                >{{$t("admin.order.suspendUntil", {display:time.display})}}</span>
              </b-button>
              <b-button
                class="b-reset op-button-pill bg-form m-t-16 m-r-16"
                @click="handleSuspend(24*60)"
              >
                <i class="material-icons p-l-8 c-primary">alarm_off</i>
                <span class="t-button p-r-8 c-primary">{{ $t("admin.order.suspendForAllDay") }}</span>
              </b-button>
            </div>

            <!-- Unsuspend Button -->
            <div v-else>
              <div class="bg-status-red-bg r-8 p-l-16 p-r-16 p-t-16 p-b-16 m-t-16 align-center">
                <div class="t-subtitle1 c-status-red">{{ $t("admin.order.suspending") }}</div>
                <div class="t-subtitle2 c-status-red">{{ $t("admin.order.unsuspendAt") }} 12:35 PM</div>
              </div>
              <b-button class="b-reset op-button-pill bg-form m-t-16 m-r-16">
                <i class="material-icons p-l-8 c-primary">alarm_on</i>
                <span class="t-button p-r-8 c-primary">{{ $t("admin.order.unsuspend") }}</span>
              </b-button>
            </div>
          </div>

          <!-- Suspend Individual Item -->
          <!-- # ToDo: Implement select/deselect all check boxes. -->
          <div v-if="false">
            <div
              class="t-subtitle2 c-text-black-medium m-t-24"
            >{{ $t("admin.order.suspendIndividualItem") }}</div>

            <!-- Suspend All Items -->
            <b-button class="b-reset op-button-pill bg-form m-t-16 m-r-16">
              <i class="material-icons p-l-8 c-primary">check_box</i>
              <span class="t-button p-r-8 c-primary">{{ $t("admin.order.suspendAllItems") }}</span>
            </b-button>

            <!-- Unsuspend All Items -->
            <b-button class="b-reset op-button-pill bg-form m-t-16 m-r-16">
              <i class="material-icons p-l-8 c-primary">check_box_outline_blank</i>
              <span class="t-button p-r-8 c-primary">{{ $t("admin.order.unsuspendAllItems") }}</span>
            </b-button>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column" v-if="false">
        <div class="m-l-24 m-r-24">
          <div class="m-t-24">
            <!-- Menu Items -->
            <template v-for="itemId in menuLists">
              <div v-if="itemsObj[itemId]" :key="itemId">
                <div
                  class="t-h6 c-text-black-disabled m-t-24"
                  v-if="itemsObj[itemId]._dataType === 'title'"
                >{{ itemsObj[itemId].name }}</div>
                <order-suspend-item
                  v-if="itemsObj[itemId]._dataType === 'menu'"
                  :item="itemsObj[itemId]"
                  :shopInfo="shopInfo"
                ></order-suspend-item>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import OrderSuspendItem from "~/app/admin/Order/OrderSuspendItem";
import PickupMixin from "~/app/user/Order/pickupMixin";
import * as firebase from "firebase/app";

export default {
  mixins: [PickupMixin],
  components: {
    OrderSuspendItem,
    BackButton
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
      if (this.availableDays.length > 0) {
        this.date = this.availableDays[0];
        console.log(this.date.date);
        const times = this.date.times;
        return times.splice(0, 6);
      }
      return [];
    },
    minimumCookTime() {
      return 5; // NOTE: overriding mixin's minimumCookTime, can not be zero
    },
    itemsObj() {
      return this.array2obj(this.menus.concat(this.titles));
    },
    menuLists() {
      const list = this.shopInfo.menuLists || [];
      return list;
    }
  },
  methods: {
    handleSuspend(time) {
      const date = new Date(this.date.date);
      const ts = firebase.firestore.Timestamp.fromDate(date);
      console.log(ts);
    }
  }
};
</script>
