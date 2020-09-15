<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <template v-else>
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
                <back-button :url="parentUrl" class="m-t-24 m-r-16" />

                <!-- Restaurant Profile -->
                <div class="is-inline-flex flex-center m-t-24">
                  <div>
                    <img :src="resizedProfileImage(shopInfo, '600')" class="w-36 h-36 r-36 cover" />
                  </div>
                  <div class="t-h6 c-text-black-high m-l-8 flex-1">{{ shopInfo.restaurantName }}</div>
                </div>
              </div>
              <!-- Notification Settings -->
              <div class="level-right">
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

        <!-- Left Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <div class="bg-surface r-8 d-low p-l-24 p-r-24 p-t-24 p-b-24 m-t-24">
              <!-- Order Overview -->
              <div>
                <div class="align-center">
                  <div class="is-inline-flex flex-center">
                    <!-- Order ID -->
                    <div class="t-h4 c-text-black-high">{{orderName}}</div>

                    <!-- Total Charge -->
                    <div class="m-l-16">
                      <div class="t-caption c-text-black-medium">{{$t('order.totalCharge')}}</div>
                      <div
                        v-if="hasStripe"
                        class="t-body1 c-textl-black-high is-inline-flex flex-center"
                      >
                        <a :href="search" target="stripe">
                          <span>{{$n(orderInfo.totalCharge, 'currency')}}</span>
                          <i :class="'fab fa-cc-stripe stripe_'+orderInfo.payment.stripe"></i>
                        </a>
                      </div>
                      <div v-else class="t-body1 c-textl-black-high is-inline-flex flex-center">
                        <div>{{$n(orderInfo.totalCharge, 'currency')}}</div>
                      </div>

                      <!-- Tip -->
                      <div
                        v-if="orderInfo.tip"
                        class="t-caption c-status-green"
                      >( {{$t('order.includingTip')}} {{$n(orderInfo.tip, 'currency')}} )</div>
                    </div>
                  </div>
                </div>

                <!-- Cancel Button -->
                <div class="m-t-24 align-center">
                  <b-button
                    class="b-reset op-button-pill h-36 bg-status-red-bg"
                    v-if="isValidTransition('order_canceled')"
                    @click="openCancel()"
                  >
                    <i class="material-icons c-status-red s-18 m-l-8">delete</i>
                    <span class="c-status-red t-button">{{ $t("admin.order.cancelButton" )}}</span>
                  </b-button>
                  <b-button v-if="cancelStatus" class="op-button-medium w-256">
                    <div class="c-status-red">{{$t('order.'+cancelStatus)}}</div>
                    <div class="t-caption c-text-black-medium">{{timeOfEvents[cancelStatus]}}</div>
                  </b-button>
                </div>

                <!-- Cancel Popup-->
                <b-modal :active.sync="cancelPopup" :width="488" scroll="keep">
                  <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
                    <div class="t-h6 c-text-black-disabled">{{$t("admin.order.cancelTitle")}}</div>
                    <div
                      class="t-body1 c-text-black-high m-t-24"
                    >{{$t("admin.order.cancelMessage")}}</div>
                    <!-- CTA: Call -->
                    <div v-if="orderInfo.phoneNumber" class="m-t-24 align-center">
                      <div>
                        <a :href="nationalPhoneURI">
                          <div class="op-button-small w-256 secondary">{{nationalPhoneNumber}}</div>
                        </a>
                      </div>
                      <div class="t-subtitle2 c-text-black-medium m-t-8">{{orderInfo.name}}</div>
                    </div>
                    <!-- CTA: Cancel -->
                    <div class="align-center m-t-16">
                      <b-button
                        class="b-reset op-button-small d-low bg-status-red w-256"
                        :loading="updating==='order_canceled'"
                        @click="handleCancel"
                      >
                        <span class="c-text-white-full">{{$t("admin.order.delete")}}</span>
                      </b-button>
                      <div
                        class="t-subtitle2 c-status-red m-t-8"
                      >{{$t("admin.order.deleteConfirm")}}</div>
                    </div>
                    <!-- CTA: Close -->
                    <div class="m-t-24 align-center">
                      <div
                        class="op-button-small tertiary"
                        @click="closeCancel()"
                      >{{$t('menu.close')}}</div>
                    </div>
                  </div>
                </b-modal>

                <!-- Pickup Time -->
                <div class="m-t-24 align-center">
                  <div class="t-caption c-text-black-medium">{{$t('order.timeRequested')}}</div>
                  <div class="t-body1 c-textl-black-high m-t-4">{{timeRequested}}</div>
                  <div v-if="timeEstimated" class="m-t-4">
                    <div class="t-caption c-text-black-medium">{{$t('order.timeToPickup')}}</div>
                    <div class="t-body1 c-textl-black-high m-t-4">{{timeEstimated}}</div>
                  </div>
                </div>

                <!-- Estimated Time Picker -->
                <div v-if="showTimePicker" class="m-t-8">
                  <div
                    class="t-subtitle2 c-text-black-medium align-center"
                  >{{$t('order.timeToPickup')}}</div>
                  <b-select class="m-t-8 align-center" v-model="timeOffset">
                    <option
                      v-for="time in estimatedTimes"
                      :value="time.offset"
                      :key="time.offset"
                    >{{ time.display }}</option>
                  </b-select>
                </div>

                <!-- Phone Number -->
                <div v-if="orderInfo.phoneNumber" class="align-center m-t-16">
                  <div class="t-caption c-text-black-medium">{{$t('sms.phonenumber')}}</div>
                  <div class="t-body1 m-t-4">
                    <div>
                      <a :href="nationalPhoneURI">{{nationalPhoneNumber}}</a>
                    </div>
                    <div>{{orderInfo.name}}</div>
                  </div>
                </div>
              </div>

              <!-- Order Status -->
              <div>
                <div
                  v-for="orderState in orderStates"
                  :key="orderState"
                  class="align-center m-t-24"
                >
                  <b-button
                    class="op-button-medium w-256"
                    :class="classOf(orderState)"
                    :loading="updating===orderState"
                    :disabled="!isValidTransition(orderState)"
                    @click="handleChangeStatus(orderState)"
                  >
                    <div>{{ $t("order.status." + orderState) }}</div>
                    <div class="t-caption c-text-black-medium">{{timeOfEvents[orderState]}}</div>
                  </b-button>
                </div>
                <div class="align-center m-t-24">
                  <b-button
                    class="op-button-medium w-256"
                    :class="classOf('ready_to_pickup')"
                    :loading="updating==='ready_to_pickup'"
                    :disabled="!isValidTransition('ready_to_pickup')"
                    @click="handleComplete()"
                  >
                    <div>{{ $t("order.status." + 'ready_to_pickup') }}</div>
                    <div class="t-caption c-text-black-medium">{{timeOfEvents['ready_to_pickup']}}</div>
                  </b-button>
                </div>
                <div class="align-center m-t-24">
                  <b-button
                    class="op-button-medium w-256"
                    :class="classOf('transaction_complete')"
                    :loading="updating==='transaction_complete'"
                    :disabled="!isValidTransition('transaction_complete')"
                    @click="handleChangeStatus('transaction_complete')"
                  >
                    <div>{{ $t("order.status.transaction_complete") }}</div>
                    <div
                      class="t-caption c-text-black-medium"
                    >{{timeOfEvents['transaction_complete']}}</div>
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <div class="m-t-24">
              <!-- Order Items -->
              <ordered-item v-for="id in ids" :key="id" :item="items[id]" />
            </div>
            <div class="m-t-24">
              <!-- Details -->
              <div class="t-h6 c-text-black-disabled">{{ $t("order.details") }}</div>
              <order-info :orderItems="this.orderItems" :orderInfo="this.orderInfo || {}"></order-info>
            </div>
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>
    </template>
  </div>
</template>

<script>
import { db, functions, firestore } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import OrderedItem from "~/app/admin/Order/OrderedItem";
import { order_status, possible_transitions } from "~/plugins/constant.js";
import { nameOfOrder } from "~/plugins/strings.js";
import {
  parsePhoneNumber,
  formatNational,
  formatURL
} from "~/plugins/phoneutil.js";
import { stripeConfirmIntent, stripeCancelIntent } from "~/plugins/stripe.js";
import moment from "moment-timezone";
import NotFound from "~/components/NotFound";
import { ownPlateConfig } from "~/config/project";
import NotificationIndex from "./Notifications/Index";
import { formatOption } from "~/plugins/strings.js";
import OrderInfo from "~/app/user/Order/OrderInfo";

export default {
  components: {
    BackButton,
    OrderedItem,
    NotificationIndex,
    OrderInfo,
    NotFound
  },

  data() {
    return {
      orderStates: ["order_placed", "order_accepted"], // no longer "cooking_completed"
      updating: "",
      shopInfo: {},
      menuObj: {},
      orderInfo: {},
      canceling: false,
      detacher: [],
      cancelPopup: false,
      notFound: false,
      timeOffset: 0
    };
  },

  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        if (restaurant.exists) {
          const restaurant_data = restaurant.data();
          this.shopInfo = restaurant_data;
        }
      });
    const menu_detacher = db
      .collection(`restaurants/${this.restaurantId()}/menus`)
      .onSnapshot(menu => {
        if (!menu.empty) {
          const menuList = menu.docs.map(this.doc2data("menu"));
          this.menuObj = this.array2obj(menuList);
        }
      });
    const order_detacher = db
      .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
      .onSnapshot({
        next: order => {
          if (order.exists) {
            const order_data = order.data();
            this.orderInfo = order_data;
          }
        },
        error: error => {
          console.error("error", error.message);
          this.notFound = true;
        }
      });
    this.detacher = [restaurant_detacher, menu_detacher, order_detacher];
  },
  destroyed() {
    this.detacher.map(detacher => {
      detacher();
    });
  },
  computed: {
    possibleTransitions() {
      return possible_transitions[this.orderInfo.status] || {};
    },
    cancelStatus() {
      if (this.orderInfo.status === order_status.order_canceled) {
        if (this.orderInfo.orderCustomerCanceledAt) {
          return "order_canceled_by_customer";
        }
        return "order_canceled_by_restaurant";
      }
      return false;
    },
    orderItems() {
      if (this.orderInfo.order && this.orderInfo.menuItems) {
        return Object.keys(this.orderInfo.order).map(key => {
          const num = this.orderInfo.order[key];
          return {
            item: this.orderInfo.menuItems[key],
            count: num,
            id: key,
            options:
              (this.orderInfo.options && this.orderInfo.options[key]) || []
          };
        });
      }
      return [];
    },
    timeOfEvents() {
      const mapping = {
        order_placed: this.timeStampToText(this.orderInfo.orderPlacedAt),
        order_accepted: this.timeStampToText(this.orderInfo.orderAcceptedAt),
        cooking_completed: this.timeStampToText(
          this.orderInfo.orderCookingCompletedAt
        ),
        ready_to_pickup: this.timeStampToText(this.orderInfo.timeConfirmed),
        order_canceled_by_restaurant: this.timeStampToText(
          this.orderInfo.orderRestaurantCanceledAt
        ),
        order_canceled_by_customer: this.timeStampToText(
          this.orderInfo.orderCustomerCanceledAt
        ),
        transaction_complete: this.timeStampToText(
          this.orderInfo.transactionCompletedAt
        )
      };
      console.log(this.orderInfo);
      //console.log(mapping);
      return mapping;
    },
    search() {
      const value = encodeURIComponent(
        this.orderInfo.description || this.orderName
      );
      return `${ownPlateConfig.stripe.search}?query=${value}`;
    },
    showTimePicker() {
      return this.orderInfo.status === order_status.order_placed;
    },
    estimatedTimes() {
      if (!this.orderInfo.timePlaced) {
        return [];
      }
      const time = this.orderInfo.timePlaced.toDate().getTime();
      return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120].map(offset => {
        const date = new Date(time + offset * 60000);
        return {
          offset,
          display: `${this.$d(date, "time")}`
        };
      });
    },
    timeRequested() {
      if (!this.orderInfo.timePlaced) {
        return "";
      }
      const date = this.orderInfo.timePlaced.toDate();
      return this.$d(date, "long");
    },
    timeEstimated() {
      if (this.orderInfo.timeEstimated) {
        const date = this.orderInfo.timeEstimated.toDate();
        return this.$d(date, "long");
      }
      return undefined; // backward compatibility
    },
    hasStripe() {
      return this.orderInfo.payment && this.orderInfo.payment.stripe;
    },
    phoneNumber() {
      return (
        this.orderInfo &&
        this.orderInfo.phoneNumber &&
        parsePhoneNumber(this.orderInfo.phoneNumber)
      );
    },
    nationalPhoneNumber() {
      return formatNational(this.phoneNumber);
    },
    nationalPhoneURI() {
      return formatURL(this.phoneNumber);
    },
    orderName() {
      return nameOfOrder(this.orderInfo);
    },
    ids() {
      return this.orderInfo.order ? Object.keys(this.orderInfo.order) : [];
    },
    count() {
      return this.ids ? this.ids.length : 0;
    },
    orderId() {
      return this.$route.params.orderId;
    },
    parentUrl() {
      const day = this.orderInfo.timePlaced
        ? moment(this.orderInfo.timePlaced.toDate()).format("YYYY-MM-DD")
        : null;
      return `/admin/restaurants/${this.restaurantId()}/orders?day=${day}`;
    },
    items() {
      return Object.keys(this.orderInfo.order).reduce((ret, id) => {
        ret[id] = {
          count: this.orderInfo.order[id],
          option: this.specialRequest(id),
          menu: this.menuObj[id] || {}
        };
        return ret;
      }, {});
    }
  },
  methods: {
    timeStampToText(timestamp) {
      if (timestamp) {
        return this.$d(timestamp.toDate(), "long");
      }
      return "";
    },
    displayOption(option) {
      return formatOption(option, price => this.$n(price, "currency"));
    },
    isValidTransition(newStatus) {
      const newStatusValue = order_status[newStatus];
      return (
        this.possibleTransitions[newStatusValue] ||
        (newStatusValue === this.orderInfo.status &&
          newStatus !== "order_canceled")
      );
    },
    // NOTE: Exact same code in the order/_orderId/index.vue for the user.
    // This is intentional because we may want to present it differently to admins.
    specialRequest(key) {
      const options = this.orderInfo.options && this.orderInfo.options[key];
      if (options) {
        console.log("***", options);
        return options
          .filter(option => option)
          .map(option => this.displayOption(option))
          .join(", ");
      }
      return "";
    },
    async handleComplete() {
      if (this.orderInfo.status === order_status.ready_to_pickup) {
        return; // no need to call the server
      }
      if (this.hasStripe) {
        const orderId = this.$route.params.orderId;
        //console.log("handleComplete with Stripe", orderId);
        try {
          this.updating = "ready_to_pickup";
          const { data } = await stripeConfirmIntent({
            restaurantId: this.restaurantId() + this.forcedError("confirm"),
            orderId
          });
          console.log("confirm", data);
          this.$router.push(this.parentUrl);
        } catch (error) {
          console.error(error.message, error.details);
          this.$store.commit("setErrorMessage", {
            code: "stripe.confirm",
            error
          });
        } finally {
          this.updating = "";
        }
      } else {
        this.handleChangeStatus("ready_to_pickup");
      }
    },
    async handleChangeStatus(statusKey) {
      const timezone = moment.tz.guess();
      const newStatus = order_status[statusKey];
      if (newStatus === this.orderInfo.status) {
        console.log("same status - no need to process");
        return;
      }
      const orderUpdate = functions.httpsCallable("orderUpdate");
      this.updating = statusKey;
      try {
        const params = {
          restaurantId: this.restaurantId() + this.forcedError("update"),
          orderId: this.orderId,
          status: newStatus,
          timezone
        };
        if (this.timeOffset > 0) {
          const time = this.orderInfo.timePlaced.toDate().getTime();
          const date = new Date(time + this.timeOffset * 60000);
          params.timeEstimated = firestore.Timestamp.fromDate(date);
        }
        const { data } = await orderUpdate(params);
        console.log("update", data);
        this.$router.push(this.parentUrl);
      } catch (error) {
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "order.update",
          error
        });
      } finally {
        this.updating = "";
      }
    },
    async handleCancel() {
      console.log("handleCancel");
      try {
        this.updating = "order_canceled";
        const { data } = await stripeCancelIntent({
          restaurantId: this.restaurantId() + this.forcedError("cancel"),
          orderId: this.orderId
        });
        console.log("cancel", data);
        this.$router.push(this.parentUrl);
      } catch (error) {
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "order.cancel",
          error
        });
      } finally {
        this.updating = "";
      }
    },
    classOf(statusKey) {
      if (order_status[statusKey] == this.orderInfo.status) {
        return statusKey;
      }
      return "light";
    },
    openCancel() {
      this.cancelPopup = true;
    },
    closeCancel() {
      this.cancelPopup = false;
    }
  }
};
</script>

<style lang="scss">
.light {
  @extend .bg-form;
  border: none;
}
</style>
