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
            <!-- Back Button and Restaurant Profile -->
            <div>
              <!-- Back Button -->
              <back-button :url="parentUrl" class="m-t-24" />

              <!-- Restaurant Profile -->
              <div class="is-inline-flex flex-center m-l-16 m-t-24">
                <div>
                  <img :src="shopInfo.restProfilePhoto" class="w-36 h-36 r-36 cover" />
                </div>
                <div class="t-h6 c-text-black-high m-l-8">{{ shopInfo.restaurantName }}</div>
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
                  <div class="is-inline-flex">
                    <!-- Order ID -->
                    <div class="t-h4 c-text-black-high">{{orderName}}</div>

                    <!-- Total Charge -->
                    <div class="m-l-16">
                      <div class="t-caption c-text-black-medium">{{$t('order.totalCharge')}}</div>
                      <div class="t-body1 c-textl-black-high is-inline-flex flex-center">
                        <div>{{$n(orderInfo.totalCharge, 'currency')}}</div>
                        <div v-if="hasStripe" class="m-l-4">
                          <i :class="'fab fa-cc-stripe stripe_'+orderInfo.payment.stripe"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cancel Button -->
                <div class="m-t-24 align-center">
                  <b-button
                    class="b-reset op-button-pill h-36 bg-status-red-bg"
                    :disabled="!isValidTransition('order_canceled')"
                    @click="openCancel()"
                  >
                    <i class="material-icons c-status-red s-18 m-l-8">delete</i>
                    <span class="c-status-red t-button">{{ $t("admin.order.cancelButton" )}}</span>
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
                  <div class="t-caption c-text-black-medium">{{$t('order.timeToPickup')}}</div>
                  <div class="t-body1 c-textl-black-high m-t-4">{{timePlaced}}</div>
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
                  >{{ $t("order.status." + orderState) }}</b-button>
                </div>
                <div class="align-center m-t-24">
                  <b-button
                    class="op-button-medium w-256"
                    :class="classOf('customer_picked_up')"
                    :loading="updating==='customer_picked_up'"
                    :disabled="!isValidTransition('customer_picked_up')"
                    @click="handleComplete()"
                  >{{ $t("order.status." + 'customer_picked_up') }}</b-button>
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
          </div>
        </div>
        <!-- Right Gap -->
        <div class="column is-narrow w-24"></div>
      </div>
    </template>
  </div>
</template>

<script>
import { db, functions } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import OrderedItem from "~/app/admin/Order/OrderedItem";
import { order_status } from "~/plugins/constant.js";
import { nameOfOrder } from "~/plugins/strings.js";
import {
  parsePhoneNumber,
  formatNational,
  formatURL
} from "~/plugins/phoneutil.js";
import { stripeConfirmIntent, stripeCancelIntent } from "~/plugins/stripe.js";
import moment from "moment-timezone";
import NotFound from "~/components/NotFound";

export default {
  components: {
    BackButton,
    OrderedItem,
    NotFound
  },

  data() {
    return {
      orderStates: ["order_placed", "order_accepted", "cooking_completed"],
      updating: "",
      shopInfo: {},
      menuObj: {},
      orderInfo: {},
      canceling: false,
      detacher: [],
      cancelPopup: false,
      notFound: false
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
    timePlaced() {
      if (!this.orderInfo.timePlaced) {
        return "";
      }
      const date = this.orderInfo.timePlaced.toDate();
      return this.$d(date, "long");
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
    possibleTransition() {
      switch (this.orderInfo.status) {
        case order_status.order_placed:
          return {
            order_accepted: true,
            cooking_completed: true,
            order_canceled: true
          };
        case order_status.order_accepted:
          return {
            cooking_completed: true,
            order_canceled: true
          };
        case order_status.cooking_completed:
          return {
            order_accepted: true,
            order_canceled: true,
            customer_picked_up: true // both paid and unpaid
          };
        case order_status.customer_picked_up:
          return {
            order_refunded: true
          };
      }
      return {};
    },
    isValidTransition(newStatus) {
      return (
        this.possibleTransition()[newStatus] ||
        (order_status[newStatus] === this.orderInfo.status &&
          newStatus !== "order_canceled")
      );
    },
    // NOTE: Exact same code in the order/_orderId/index.vue for the user.
    // This is intentional because we may want to present it differently to admins.
    specialRequest(key) {
      const option = this.orderInfo.options && this.orderInfo.options[key];
      if (option) {
        return option.filter(choice => choice).join(", ");
      }
      return "";
    },
    async handleComplete() {
      if (this.hasStripe) {
        const orderId = this.$route.params.orderId;
        //console.log("handleComplete with Stripe", orderId);
        try {
          this.updating = "customer_picked_up";
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
        this.handleChangeStatus("customer_picked_up");
      }
    },
    async handleChangeStatus(statusKey) {
      const timezone = moment.tz.guess();
      const newStatus = order_status[statusKey];
      if (newStatus === this.orderInfo.status) {
        return;
      }
      const orderUpdate = functions.httpsCallable("orderUpdate");
      this.updating = statusKey;
      try {
        const { data } = await orderUpdate({
          restaurantId: this.restaurantId() + this.forcedError("update"),
          orderId: this.orderId,
          status: newStatus,
          timezone
        });
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
