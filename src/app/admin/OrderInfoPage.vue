<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <div class="mt-6 mx-6 lg:flex lg:items-center">
        <!-- Back and Preview -->
        <div class="flex space-x-4">
          <div class="flex-shrink-0">
            <back-button :url="parentUrl" />
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

        <!-- Suspend Button -->
        <div class="mt-4 lg:mt-0 lg:mr-4 flex-shrink-0">
          <b-button
            tag="nuxt-link"
            :to="`/admin/restaurants/${restaurantId()}/suspend`"
            class="b-reset-tw"
          >
            <div
              v-if="this.shopInfo.suspendUntil"
              class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-red-700 bg-opacity-5"
            >
              <i class="material-icons text-lg text-red-700 mr-2"
                >remove_shopping_cart</i
              >
              <div class="text-sm font-bold text-red-700">
                {{ $t("admin.order.suspending") }}
              </div>
            </div>

            <div
              v-else
              class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
            >
              <i class="material-icons text-lg text-op-teal mr-2"
                >remove_shopping_cart</i
              >
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.order.suspendSettings") }}
              </div>
            </div>
          </b-button>
        </div>

        <!-- Notifications -->
        <div class="mt-4 lg:mt-0 flex-shrink-0">
          <notification-index :shopInfo="shopInfo" />
        </div>
      </div>

      <!-- Body -->
      <div
        v-if="orderInfo.status === order_status.transaction_hide"
        class="mt-6 mx-6"
      >
        <div class="bg-white rounded-lg shadow p-4">
          <div>{{ $t("order.status.transaction_hide") }}</div>
        </div>
      </div>

      <div v-else class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <div class="bg-white shadow rounded-lg p-4">
            <!-- Order ID, Total, Payment, and Tips -->
            <div class="text-center">
              <div class="inline-flex justify-center items-center">
                <div class="text-4xl">
                  {{ orderName }}
                </div>

                <div class="ml-4">
                  <div class="text-xs">
                    {{ $t("order.totalCharge") }}
                  </div>

                  <div v-if="hasStripe" class="text-base">
                    <a :href="search" target="stripe">
                      <div>{{ $n(orderInfo.totalCharge, "currency") }}</div>
                      <div
                        :class="
                          'text-xs font-bold stripe_' + orderInfo.payment.stripe
                        "
                      >
                        {{
                          $t("order.status.stripe_" + orderInfo.payment.stripe)
                        }}
                      </div>
                    </a>
                  </div>

                  <div v-else class="text-base">
                    <div>{{ $n(orderInfo.totalCharge, "currency") }}</div>
                    <div class="text-xs font-bold text-yellow-500">
                      {{ $t("order.status.onsitePayment") }}
                    </div>
                  </div>

                  <div
                    v-if="orderInfo.tip"
                    class="text-xs font-bold text-blue-500"
                  >
                    {{ $t("order.includingTip") }}
                    {{ $n(orderInfo.tip, "currency") }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Note for Payment Completion -->
            <div
              v-if="paymentIsNotCompleted"
              class="mt-4 bg-yellow-500 bg-opacity-10 rounded-lg p-4 text-sm font-bold text-yellow-500"
            >
              {{ $t("admin.order.paymentIsNotCompleted") }}
            </div>



            <!-- Cancel Button -->
            <div class="mt-6 text-center">
              <b-button
                class="b-reset-tw"
                v-if="isValidTransition('order_canceled') && (paymentIsNotCompleted || !hasStripe)"
                @click="openCancel()"
              >
                <div
                  class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
                >
                  <i class="material-icons text-lg mr-2 text-red-700">delete</i>
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("admin.order.cancelButton") }}
                  </div>
                </div>
              </b-button>

              <b-button v-if="cancelStatus" class="b-reset-tw">
                <div
                  class="inline-flex justify-center items-center rounded-full h-16 w-64 bg-red-700 bg-opacity-10 text-red-700"
                >
                  <div>
                    <div class="text-base font-extrabold">
                      {{ $t("order." + cancelStatus) }}
                    </div>
                    <div class="text-xs">
                      {{ timeOfEvents[cancelStatus] }}
                    </div>
                  </div>
                </div>
              </b-button>
            </div>

            <!-- Cancel Popup-->
            <b-modal :active.sync="cancelPopup" :width="488" scroll="keep">
              <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
                <!-- Title -->
                <div class="text-xl font-bold text-black text-opacity-40">
                  {{ $t("admin.order.cancelTitle") }}
                </div>

                <!-- Message -->
                <div class="mt-6 text-base">
                  {{ $t("admin.order.cancelMessage") }}
                </div>

                <!-- Call -->
                <div v-if="orderInfo.phoneNumber" class="mt-6 text-center">
                  <div>
                    <a
                      :href="nationalPhoneURI"
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full border-2 border-op-teal"
                    >
                      <div class="text-base font-bold text-op-teal">
                        {{ nationalPhoneNumber }}
                      </div>
                    </a>
                  </div>
                  <div class="font-bold mt-2">
                    {{ orderInfo.name }}
                  </div>
                </div>

                <!-- Cancel -->
                <div class="mt-4 text-center">
                  <b-button
                    :loading="updating === 'order_canceled'"
                    @click="handleCancel"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                      <div class="text-base font-bold text-white">
                        {{ $t("admin.order.delete") }}
                      </div>
                    </div>
                  </b-button>
                  <div class="mt-2 text-sm font-bold text-red-700">
                    {{ $t("admin.order.deleteConfirm") }}
                  </div>
                </div>

                <!-- Close -->
                <div class="mt-6 text-center">
                  <a
                    @click="closeCancel()"
                    class="inline-flex justify-center items-center h-12 rounded-full px-6 bg-black bg-opacity-5"
                    style="min-width: 8rem;"
                  >
                    <div class="text-base font-bold text-black text-opacity-60">
                      {{ $t("menu.close") }}
                    </div>
                  </a>
                </div>
              </div>
            </b-modal>

            <!-- Pickup Time -->
            <div class="mt-6 text-center">
              <div class="text-xs font-bold">
                {{ $t("order.timeRequested") }}
              </div>
              <div class="text-base mt-1">
                {{ timeRequested }}
              </div>
              <div v-if="timeEstimated" class="mt-2">
                <div class="text-xs font-bold">
                  {{ $t("order.timeToPickup") }}
                </div>
                <div class="text-base mt-1">
                  {{ timeEstimated }}
                </div>
              </div>
            </div>

            <!-- Estimated Time Picker -->
            <div v-if="showTimePicker" class="mt-4 flex flex-col items-center">
              <div class="text-xs font-bold">
                {{ $t("order.timeToPickup") }}
              </div>
              <b-select class="mt-2" v-model="timeOffset">
                <option
                  v-for="time in estimatedTimes"
                  :value="time.offset"
                  :key="time.offset"
                  >{{ time.display }}</option
                >
              </b-select>
            </div>

            <!-- Phone Number -->
            <div v-if="orderInfo.phoneNumber" class="mt-4 text-center">
              <div class="text-xs font-bold">
                {{ $t("sms.phonenumber") }}
              </div>
              <div class="text-base mt-1">
                <div>
                  <a :href="nationalPhoneURI" class="text-base font-bold">{{
                    nationalPhoneNumber
                  }}</a>
                </div>
                <div class="text-base">{{ orderInfo.name }}</div>
              </div>
              <div>
                {{ $t("order.orderTimes") }}: {{ $tc("order.orderTimesUnit", userLog.counter || 0) }} /
                {{ $t("order.cancelTimes") }}: {{ $tc("order.cancelTimesUnit", userLog.cancelCounter || 0) }}
              </div>
              <div>
                {{ $t("order.lastOrder") }}: {{userLog.lastOrder ? moment(userLog.lastOrder.toDate()).format("YYYY/MM/DD HH:mm") : "--"}}
              </div>
            </div>
            <div class="mt-6 text-center">
              <nuxt-link :to="'/admin/restaurants/' + restaurantId() + '/userhistory/' + orderInfo.uid + '?orderId=' + orderId">
                <div
                  class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
                  >
                  <i class="material-icons text-lg text-op-teal mr-2">face</i>
                  <span class="text-sm font-bold text-op-teal">{{
                    $t("order.customerOrderHistory")
                    }}</span>
                </div>
              </nuxt-link>
            </div>

            <!-- Order Status -->
            <div>
              <div
                v-for="orderState in orderStates"
                :key="orderState"
                class="mt-4 text-center"
                >
                <b-button
                  :loading="updating === orderState"
                  :disabled="!isValidTransition(orderState)"
                  @click="handleChangeStatus(orderState)"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex justify-center items-center rounded-full h-16 w-64"
                    :class="classOf(orderState)"
                  >
                    <div>
                      <div class="text-base font-extrabold">
                        {{ $t("order.status." + orderState) }}
                      </div>
                      <div class="text-xs">
                        {{ timeOfEvents[orderState] }}
                      </div>
                    </div>
                  </div>
                </b-button>
              </div>
            </div>

            <!-- Payment Cancel Button -->
            <div class="mt-6 text-center">
              <b-button
                v-if="paymentIsNotCompleted"
                @click="openPaymentCancel"
                class="b-reset-tw"
                >
                <div
                  class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
                >
                  <i class="material-icons text-lg mr-2 text-red-700">credit_card</i>
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("admin.order.paymentCancelButton") }}
                  </div>
                </div>
              </b-button>
            </div>

            <!-- Payment Cancel Popup-->
            <b-modal :active.sync="paymentCancelPopup" :width="488" scroll="keep">
              <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
                <!-- Title -->
                <div class="text-xl font-bold text-black text-opacity-40">
                  {{ $t("admin.order.paymentCancelTitle") }}
                </div>

                <!-- Message -->
                <div class="mt-6 text-base">
                  {{ $t("admin.order.paymentCancelMessage") }}
                </div>

                <!-- Call -->
                <div v-if="orderInfo.phoneNumber" class="mt-6 text-center">
                  <div>
                    <a
                      :href="nationalPhoneURI"
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full border-2 border-op-teal"
                    >
                      <div class="text-base font-bold text-op-teal">
                        {{ nationalPhoneNumber }}
                      </div>
                    </a>
                  </div>
                  <div class="font-bold mt-2">
                    {{ orderInfo.name }}
                  </div>
                </div>

                <!-- Cancel -->
                <div class="mt-4 text-center">
                  <b-button
                    :loading="updating === 'payment_canceled'"
                    @click="handlePaymentCancel"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                      <div class="text-base font-bold text-white">
                        {{ $t("admin.order.paymentCancel") }}
                      </div>
                    </div>
                  </b-button>
                  <div class="mt-2 text-sm font-bold text-red-700">
                    {{ $t("admin.order.paymentCancelConfirm") }}
                  </div>
                </div>

                <!-- Close -->
                <div class="mt-6 text-center">
                  <a
                    @click="closePaymentCancel()"
                    class="inline-flex justify-center items-center h-12 rounded-full px-6 bg-black bg-opacity-5"
                    style="min-width: 8rem;"
                  >
                    <div class="text-base font-bold text-black text-opacity-60">
                      {{ $t("menu.close") }}
                    </div>
                  </a>
                </div>
              </div>
            </b-modal>


          </div>
        </div>

        <!-- Right -->
        <div class="mt-4 lg:mt-0">
          <div class="grid grid-cols-1 space-y-4">
            <!-- Message from customer -->
            <div v-if="hasMemo" class="bg-white rounded-lg p-4 shadow">
              <div class="text-xs font-bold text-black text-opacity-60">
                {{ $t("admin.order.messageFromCustomer") }}
              </div>
              <div class="mt-2 text-base">
                {{ orderInfo.memo }}
              </div>
            </div>

            <!-- Order Items -->
            <!-- # Not In Use -->
            <!-- <div class="grid grid-cols-1 space-y-2">
            <ordered-item
              v-for="(item, id) in orderItems"
              :key="id"
              :item="item"
            />
						</div> -->

            <!-- Order Details -->
            <order-info
              :orderItems="this.orderItems"
              :orderInfo="isOrderChange ? editable_order_info : this.orderInfo || {}"
              :editable="isOrderChange"
              :editedAvailableOrders="editedAvailableOrders"
              @input="updateEnable"
              ></order-info>
            <div>
              <div class="mt-4">
                <b-button
                  @click="toggleIsOrderChange"
                  class="b-reset-tw"
                  >
                  <div
                    class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                    <div class="text-base font-bold text-white">
                      {{ isOrderChange ? $t("admin.order.cancelOrderChange") : $t("admin.order.willOrderChange") }}
                    </div>
                  </div>
                </b-button>
                <b-button
                  @click="handleOrderChange"
                  class="b-reset-tw"
                  v-if="isOrderChange"
                  >
                  <div
                    class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                    <div class="text-base font-bold text-white">
                      {{ $t("admin.order.confirmOrderChange") }}
                    </div>
                  </div>
                </b-button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { db, functions, firestore } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import OrderedItem from "~/app/admin/Order/OrderedItem";
import {
  order_status,
  possible_transitions,
  timeEventMapping
} from "~/plugins/constant.js";
import { nameOfOrder } from "~/plugins/strings.js";
import {
  parsePhoneNumber,
  formatNational,
  formatURL
} from "~/plugins/phoneutil.js";
import { stripeConfirmIntent, stripeCancelIntent, stripePaymentCancelIntent } from "~/plugins/stripe.js";
import moment from "moment-timezone";
import NotFound from "~/components/NotFound";
import { ownPlateConfig } from "~/config/project";
import NotificationIndex from "./Notifications/Index";
import { formatOption } from "~/plugins/strings.js";
import OrderInfo from "~/app/user/Order/OrderInfo";

import * as analyticsUtil from "~/plugins/analytics";

export default {
  components: {
    BackButton,
    OrderedItem,
    NotificationIndex,
    OrderInfo,
    NotFound
  },
  head() {
    return {
      title: this.shopInfo.restaurantName ?
        ["Admin Order Info", this.shopInfo.restaurantName , this.defaultTitle].join(" / ") : this.defaultTitle
    }
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
      paymentCancelPopup: false,
      notFound: false,
      timeOffset: 0,
      shopOwner: null,
      userLog: {},
      isOrderChange: false,
      editedAvailableOrders: [],
    };
  },
  // if user is not signined, render login
  // if user is not owner, render 404
  // if restaurant don't have order, render 404.

  async created() {
    if (!this.checkAdminPermission()) {
      return;
    }

    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(
        restaurant => {
          if (restaurant.exists) {
            const restaurant_data = restaurant.data();
            if (restaurant_data.uid === this.ownerUid) {
              this.shopInfo = restaurant_data;
              return;
            }
          }
          this.notFound = true;
        },
        error => {
          this.notFound = true;
        }
      );
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
  watch: {
    orderInfo() {
      db.doc(`restaurants/${this.restaurantId()}/userLog/${this.orderInfo.uid}`).get().then((res) => {
        if (res.exists) {
          this.userLog = res.data();
        }
      });
    },
    orderItems() {
      Object.keys(this.orderItems).map(key => {
        this.editedAvailableOrders[key] = true;
      });
    },
  },
  computed: {
    ownerUid() {
      return this.$store.getters.isSubAccount ? this.$store.getters.parentId : this.$store.getters.uidAdmin;
    },
    isOwner() {
      return !this.$store.getters.isSubAccount;
    },
    hasMemo() {
      return this.orderInfo && !this.isEmpty(this.orderInfo.memo);
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
    paymentIsNotCompleted() {
      return (
        // this.hasStripe && this.orderInfo.status < order_status.ready_to_pickup
        this.hasStripe && this.orderInfo.payment.stripe === "pending"
      );
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
      return this.shopOwner && !!this.shopOwner.hidePrivacy
        ? [
            "order_placed",
            "order_accepted",
            "ready_to_pickup",
            "transaction_complete",
            "transaction_hide"
          ]
        : [
            "order_placed",
            "order_accepted",
            "ready_to_pickup",
            "transaction_complete"
          ]; // no longer "cooking_completed"
    },
    order_status() {
      return order_status;
    },
    // for editable order
    edited_available_order_info() {
      const ret = []
      Object.keys(this.editedAvailableOrders).forEach((key) => {
        if (this.editedAvailableOrders[key]) {
          const indexes  = this.orderItems[key]?.orderIndex;
          if (indexes) {
            ret.push({menuId: indexes[0], index: Number(indexes[1])});
          }
        }
      });
      return ret;
    },
    editable_order_info() {
      const menuObj = this.orderInfo.menuItems;
      const multiple = this.regionMultiple;
      const ret = this.edited_available_order_info.reduce((tmp, info) => {
        const { menuId, index } = info;
        const menu = menuObj[menuId];
        if (menu.tax === "alcohol") {
          tmp.alcohol_sub_total = tmp.alcohol_sub_total + this.orderInfo.prices[menuId][index];
        } else {
          tmp.food_sub_total = tmp.food_sub_total + this.orderInfo.prices[menuId][index];
        };
        return tmp;
      }, {sub_total: 0, tax: 0, food_sub_total: 0, alcohol_sub_total: 0});
      ret.sub_total = ret.food_sub_total + ret.alcohol_sub_total;

      const { alcoholTax, foodTax, inclusiveTax } = this.shopInfo;
      if (inclusiveTax) {
        ret.food_tax = Math.round((ret.food_sub_total * (1 - 1 / (1 + foodTax / 100))) * multiple) / multiple;
        ret.alcohol_tax = Math.round((alcohol_sub_total * (1 - 1 / (1 + alcoholTax / 100))) * multiple) / multiple;
        ret.tax = food_tax + alcohol_tax;
        ret.total = ret.sub_total;
      } else {
        ret.food_tax = Math.round(ret.food_sub_total * foodTax / 100 * multiple) / multiple;
        ret.alcohol_tax = Math.round(ret.alcohol_sub_total * alcoholTax / 100 * multiple) / multiple;
        ret.tax = ret.food_tax + ret.alcohol_tax;
        ret.total = ret.sub_total + ret.tax;
      }
      return Object.assign({}, this.orderInfo, ret);
    },
  },
  methods: {
    updateEnable(value) {
      this.$set(this.editedAvailableOrders, value[0],  value[1]);
    },
    toggleIsOrderChange() {
      this.isOrderChange = !this.isOrderChange;
    },
    timeStampToText(timestamp) {
      if (timestamp) {
        return this.$d(timestamp.toDate(), "long");
      }
      return "";
    },
    isValidTransition(newStatus) {
      const newStatusValue = order_status[newStatus];
      return this.possibleTransitions[newStatusValue];
      /*
      return (
        this.possibleTransitions[newStatusValue] ||
        (newStatusValue === this.orderInfo.status &&
          newStatus !== "order_canceled")
      );
      */
    },
    async handleStripe() {
      //console.log("handleComplete with Stripe", orderId);
      try {
        // this.updating = "ready_to_pickup";
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
          error,
          message2: "errorPage.code.stripe.confirm2",
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
      this.updating = statusKey;
      if ((newStatus === order_status.ready_to_pickup || newStatus === order_status.order_accepted) && this.paymentIsNotCompleted) {
        this.handleStripe();
        return;
      }
      const orderUpdate = functions.httpsCallable("orderUpdate");
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
    async handleOrderChange() {
      this.$store.commit("setAlert", {
        title: "admin.order.confirmOrderChange",
        callback: async () => {
          const timezone = moment.tz.guess();
          const orderChange = functions.httpsCallable("orderChange");
          try {
            const params = {
              restaurantId: this.restaurantId() + this.forcedError("update"),
              orderId: this.orderId,
              newOrder: this.edited_available_order_info,
              timezone,
            };
            console.log(params);

            const { data } = await orderChange(params);
            console.log("update", data);
            // this.$router.push(this.parentUrl);
          } catch (error) {
            console.error(error.message, error.details);
            this.$store.commit("setErrorMessage", {
              code: "order.update",
              error
            });
          } finally {
            this.updating = "";
          }
        }
      });
    },
    async handlePaymentCancel() {
      console.log("handlePaymentCancel");

      try {
        this.updating = "payment_canceled";
        const { data } = await stripePaymentCancelIntent({
          restaurantId: this.restaurantId() + this.forcedError("cancel"),
          orderId: this.orderId
        });
        // this.sendRedunded();
        console.log("paymentCancel", data);
        this.$router.push(this.parentUrl);
      } catch (error) {
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "stripe.cancel",
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
    },
    openPaymentCancel() {
      console.log("openPaymentCancel");
      this.paymentCancelPopup = true;
    },
    closePaymentCancel() {
      console.log("closePaymentCancel");
      this.paymentCancelPopup = false;
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
