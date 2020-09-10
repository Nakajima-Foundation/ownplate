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
              <back-button
                :url="`/admin/restaurants/${restaurantId()}/orders`"
                class="m-t-24 m-r-16"
              />

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
              :isSuperView="true"
            />
          </div>
          <div class="m-t-24" v-if="last !== undefined">
            <b-button class="b-reset h-36 r-36 bg-form" :disabled="last === null" @click="next">
              <span class="p-l-16 p-r-16">{{ $t('admin.order.more') }}</span>
            </b-button>
          </div>
          <download-orders :orders="orders" />
          <report-details
            :orders="orders"
            :fileName="fileName"
            :hideTable="true"
            :withStatus="true"
          />
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
import DownloadOrders from "~/components/DownloadOrders";
import NotificationIndex from "./Notifications/Index";
import ReportDetails from "~/app/admin/Order/ReportDetails";

export default {
  components: {
    OrderedInfo,
    BackButton,
    NotificationIndex,
    DownloadOrders,
    ReportDetails
  },
  data() {
    return {
      shopInfo: {},
      limit: 30,
      last: undefined,
      orders: []
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
  },
  computed: {
    fileName() {
      return this.$t("order.history");
    }
  },
  methods: {
    async next() {
      let query = db
        .collection(`restaurants/${this.restaurantId()}/orders`)
        .orderBy("timePlaced", "desc")
        .limit(this.limit);
      if (this.last) {
        query = query.startAfter(this.last);
      }
      const docs = (await query.get()).docs;
      this.last = docs.length == this.limit ? docs[this.limit - 1] : null;
      const orders = docs.map(this.doc2data("order"));
      orders.forEach(order => {
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
          "/admin/restaurants/" + this.restaurantId() + "/orders/" + order.id
      });
    }
  }
};
</script>
