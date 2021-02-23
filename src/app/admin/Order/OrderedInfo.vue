<template>
  <div class="column is-one-third">
    <div class="m-t-8 m-r-8">
      <!-- For Admin -->
      <div
        v-if="!restaurant"
        @click="$emit('selected', order)"
        class="touchable bg-surface r-8 d-low"
      >
        <!-- Order Status -->
        <div class="p-l-8 p-r-8 p-t-8 p-b-8">
          <div
            class="t-overline p-l-8 p-r-8 p-t-4 p-b-4 r-4 align-center"
            :class="statusKey"
          >
            {{ $t("order.status." + statusKey) }}
          </div>
        </div>

        <div class="cols flex-center p-l-8 p-r-8">
          <!-- Order Status -->
          <!-- <div>
            <order-status :order="order" />
          </div> -->

          <!-- Payment Status -->
          <div>
            <div
              v-if="hasStripe"
              :class="'t-overline stripe_' + order.payment.stripe"
            >
              {{ $t("order.status.stripe_" + order.payment.stripe) }}
            </div>
            <div v-else class="t-overline c-status-amber">
              {{ $t("order.status.onsitePayment") }}
            </div>
          </div>

          <!-- Time Stamp -->
          <div class="t-caption c-text-black-medium align-right flex-1">
            {{ timestamp || "0:00pm" }}
          </div>
        </div>

        <div class="cols flex-center p-t-8 p-l-8 p-r-8">
          <!-- Order ID -->
          <div class="t-h6 c-text-black-high">{{ orderName }}</div>

          <!-- User Name/Phone -->
          <div class="t-body1 c-text-black-medium align-right flex-1">
            <div class="is-inline-block" v-if="order.name">
              {{ order.name }}
            </div>

            <div class="is-inline-block" v-if="!order.name && phoneNumber">
              {{ nationalPhoneNumber }}
            </div>
          </div>
        </div>

        <div class="cols flex-center p-t-8 p-l-8 p-r-8 p-b-8">
          <!-- Order Count -->
          <div class="t-body2 c-text-black-medium m-r-8">
            {{
              $tc("sitemenu.orderCounter", totalCount, { count: totalCount })
            }}
          </div>

          <!-- Total -->
          <div class="t-body2 c-text-black-high m-r-8">
            {{ $n(order.totalCharge, "currency") }}
          </div>

          <!-- Tip -->
          <div
            v-if="order.tip"
            class="t-overline c-status-blue flex-1 align-right"
          >
            {{ $t("order.includingTip") }} {{ $n(order.tip, "currency") }}
          </div>
        </div>
      </div>

      <!-- For User -->
      <div
        v-if="restaurant"
        @click="$emit('selected', order)"
        class="touchable bg-surface r-8 d-low"
      >
        <!-- Order Status -->
        <div class="p-l-8 p-r-8 p-t-8 p-b-8">
          <div
            class="t-overline p-l-8 p-r-8 p-t-4 p-b-4 r-4 align-center"
            :class="statusKey"
          >
            {{ $t("order.status." + statusKey) }}
          </div>
        </div>

        <div class="cols flex-center p-l-8 p-r-8">
          <!-- Order Status -->
          <!-- <div>
            <order-status :order="order" />
          </div> -->

          <!-- Payment Status -->
          <div>
            <div
              v-if="hasStripe"
              :class="'t-overline stripe_' + order.payment.stripe"
            >
              {{ $t("order.status.stripe_" + order.payment.stripe) }}
            </div>
            <div v-else class="t-overline c-status-amber">
              {{ $t("order.status.onsitePayment") }}
            </div>
          </div>

          <!-- Time Stamp -->
          <div class="t-caption c-text-black-medium align-right flex-1">
            {{ timestamp || "0:00pm" }}
            <!-- # ToDo: Want to show not only time but also date for the user -->
          </div>
        </div>

        <div class="cols flex-center p-t-8 p-l-8 p-r-8 p-b-8">
          <!-- Restaurant Profile -->
          <div class="m-r-8">
            <img
              :src="resizedProfileImage(restaurant, '600')"
              class="w-12 h-12 r-48 cover"
            />
          </div>

          <div class="flex-1">
            <!-- Restaurant Name -->
            <div class="t-body1 c-text-black-high">
              {{ restaurant.restaurantName }}
            </div>
            <div class="cols flex-center">
              <!-- Order Count -->
              <div class="t-body2 c-text-black-medium m-r-8">
                {{
                  $tc("sitemenu.orderCounter", totalCount, {
                    count: totalCount
                  })
                }}
              </div>

              <!-- Total -->
              <div class="t-body2 c-text-black-high m-r-8">
                {{ $n(order.totalCharge, "currency") }}
              </div>

              <!-- Order ID -->
              <div class="t-subtitle2 c-text-black-high flex-1 align-right">
                {{ orderName }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderStatus from "~/app/admin/Order/OrderStatus";
import { nameOfOrder } from "~/plugins/strings.js";
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";
import { db } from "~/plugins/firebase.js";
import { order_status, order_status_keys } from "~/plugins/constant.js";

export default {
  components: {
    OrderStatus
  },
  data() {
    return {
      restaurant: null
    };
  },
  props: {
    order: {
      type: Object,
      required: true
    },
    isSuperView: {
      type: Boolean,
      required: false
    }
  },
  async created() {
    if (this.order.restaurantId) {
      const snapshot = await db
        .doc(`restaurants/${this.order.restaurantId}`)
        .get();
      this.restaurant = snapshot.data();
    }
  },
  computed: {
    statusKey() {
      return order_status_keys[this.order.status];
    },
    hasStripe() {
      return this.order.payment && this.order.payment.stripe;
    },
    timestamp() {
      const time = this.order.timeEstimated || this.order.timePlaced;
      //const date = `${time.getMonth() + 1}/${time.getDate()} `;
      //return date + this.num2time(time.getHours() * 60 + time.getMinutes());
      if (this.isSuperView) {
        return this.$d(time, "long");
      } else {
        return this.$d(time, "time");
      }
    },
    phoneNumber() {
      return this.order.phoneNumber && parsePhoneNumber(this.order.phoneNumber);
    },
    nationalPhoneNumber() {
      return formatNational(this.phoneNumber);
    },
    orderName() {
      return nameOfOrder(this.order);
    },
    totalCount() {
      if (this.order.order) {
        return Object.values(this.order.order).reduce((count, order) => {
          return count + this.arrayOrNumSum(order);
        }, 0);
      }
      return 0;
    },
    paymentIsNotCompleted() {
      return this.hasStripe && this.order.status < order_status.ready_to_pickup;
    }
  }
};
</script>
