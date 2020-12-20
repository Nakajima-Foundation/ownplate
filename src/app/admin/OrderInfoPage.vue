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
      <div class="columns is-gapless" v-if="orderInfo.status === order_status.transaction_hide">
        <div class="column is-narrow w-24"></div>
        <div class="column">
          <div class="m-l-24 m-r-24">
            <div class="bg-surface r-8 d-low p-l-24 p-r-24 p-t-24 p-b-24 m-t-24">
              <div>{{ $t("order.status.transaction_hide") }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns is-gapless" v-else>
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

                <!-- Message from customer -->
                <div v-if="hasMemo" class="m-t-16 bg-form">
                  <div class="t-caption c-text-black-medium align-center">
                    {{$t('admin.order.messageFromCustomer')}}
                  </div>
                  <div class="t-body1 m-t-4">
                    <div>{{orderInfo.memo}}</div>
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
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="column">
          <div class="m-l-24 m-r-24">
            <div class="m-t-24">
              <!-- Order Items -->
              <ordered-item v-for="(item, id) in orderItems" :key="id" :item="item" />
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
import { order_status, possible_transitions, timeEventMapping } from "~/plugins/constant.js";
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

import * as analyticsUtil from '~/plugins/analytics';

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
      updating: "",
      shopInfo: {},
      menuObj: {},
      orderInfo: {},
      canceling: false,
      detacher: [],
      cancelPopup: false,
      notFound: false,
      timeOffset: 0,
      shopOwner: null,
    };
  },
  // if user is not signined, render login
  // if user is not owner, render 404
  // if restaurant don't have order, render 404.
  
  async created() {
    if (!this.checkAdminPermission()) {
      return ;
    }

    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(restaurant => {
        if (restaurant.exists) {
          const restaurant_data = restaurant.data();
          if (restaurant_data.uid === this.user.uid) {
            this.shopInfo = restaurant_data;
            return;
          }
        }
        this.notFound = true;
      }, error => {
          this.notFound = true;
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
            console.log(order_data);
          } else {
            this.notFound = true;
          }
        },
        error: error => {
          console.error("error", error.message);
          this.notFound = true;
        }
      });
    this.detacher = [restaurant_detacher, menu_detacher, order_detacher];
    this.shopOwner = await this.getShopOwner(this.$store.getters.uidAdmin);
  },
  destroyed() {
    this.detacher.map(detacher => {
      detacher();
    });
  },
  computed: {
    hasMemo() {
      return this.orderInfo && !this.isEmpty(this.orderInfo.memo)
    },
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
      return this.getOrderItems(this.orderInfo, this.menuObj);
    },
    timeOfEvents() {
      const mapping = Object.keys(timeEventMapping).reduce((tmp, key) => {
        tmp[key] = this.timeStampToText(this.orderInfo[timeEventMapping[key]]);
        return tmp;
      }, {});
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
    orderId() {
      return this.$route.params.orderId;
    },
    parentUrl() {
      const day = this.orderInfo.timePlaced
        ? moment(this.orderInfo.timePlaced.toDate()).format("YYYY-MM-DD")
        : null;
      return `/admin/restaurants/${this.restaurantId()}/orders?day=${day}`;
    },
    orderStates() {
      return this.shopOwner && !!this.shopOwner.hidePrivacy ?
        [
          "order_placed",
          "order_accepted",
          "ready_to_pickup",
          "transaction_complete",
          "transaction_hide"
        ]
        :
        [
          "order_placed",
          "order_accepted",
          "ready_to_pickup",
          "transaction_complete"
        ];        ; // no longer "cooking_completed"
    },
    order_status() {
      return order_status;
    },
    paymentIsNotCompleted() {
      return this.hasStripe && this.orderInfo.status <  order_status.ready_to_pickup 
    },
  },
  methods: {
    timeStampToText(timestamp) {
      if (timestamp) {
        return this.$d(timestamp.toDate(), "long");
      }
      return "";
    },
    isValidTransition(newStatus) {
      const newStatusValue = order_status[newStatus];
      return (
        this.possibleTransitions[newStatusValue] ||
        (newStatusValue === this.orderInfo.status &&
          newStatus !== "order_canceled")
      );
    },
    async handleStripe() {
      //console.log("handleComplete with Stripe", orderId);
      try {
        this.updating = "ready_to_pickup";
        const { data } = await stripeConfirmIntent({
          restaurantId: this.restaurantId() + this.forcedError("confirm"),
          orderId: this.orderId
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
    },
    async handleChangeStatus(statusKey) {
      const timezone = moment.tz.guess();
      const newStatus = order_status[statusKey];
      if (newStatus === this.orderInfo.status) {
        console.log("same status - no need to process");
        return;
      }
      if ((newStatus === order_status.ready_to_pickup) && this.hasStripe) {
        this.handleStripe();
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
    sendRedunded() {
      analyticsUtil.sendRedunded(
        this.orderInfo,
        this.orderId,
        this.shopInfo,
        this.restaurantId()
      );
      console.log(this.orderItems);
    },
    async handleCancel() {
      console.log("handleCancel");

      try {
        this.updating = "order_canceled";
        const { data } = await stripeCancelIntent({
          restaurantId: this.restaurantId() + this.forcedError("cancel"),
          orderId: this.orderId
        });
        this.sendRedunded();
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
