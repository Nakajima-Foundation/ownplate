<template>
  <div class="column is-one-third">
    <div class="m-t-8 m-r-8">
      <!-- For Admin -->
      <div
        v-if="!restaurant"
        @click="$emit('selected', order)"
        class="touchable bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16"
      >
        <div class="cols flex-center">
          <!-- Order Status -->
          <div>
            <order-status :order="order" />
          </div>

          <!-- Time Stamp -->
          <div class="t-caption c-text-black-medium align-right flex-1">{{ timestamp || "0:00pm"}}</div>
        </div>

        <div class="cols flex-center m-t-8">
          <!-- Order ID -->
          <div class="t-h6 c-text-black-high">{{ orderName }}</div>

          <!-- User Name/Phone -->
          <div class="t-body1 c-text-black-medium align-right flex-1">
            <div class="is-inline-block m-r-8" v-if="order.name">{{ order.name }}</div>
            <div class="is-inline-block" v-if="!order.name && phoneNumber">{{ nationalPhoneNumber }}</div>
          </div>
        </div>

        <div class="cols flex-center m-t-8">
          <!-- Order Count -->
          <div
            class="t-body2 c-text-black-medium m-r-8"
          >{{$tc('sitemenu.orderCounter', totalCount, {count: totalCount})}}</div>

          <!-- Total -->
          <div class="t-body2 c-text-black-high m-r-8">{{ $n(order.totalCharge, 'currency') }}</div>

          <!-- Stripe Status -->
          <div v-if="hasStripe" class="m-r-8">
            <i :class="'fab fa-cc-stripe stripe_'+order.payment.stripe"></i>
          </div>

          <!-- Tip -->
          <div
            v-if="order.tip"
            class="t-caption c-status-green"
          >( {{$t('order.includingTip')}} {{ $n(order.tip, 'currency') }} )</div>
        </div>
      </div>

      <!-- For User -->
      <div
        v-if="restaurant"
        @click="$emit('selected', order)"
        class="touchable bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16"
      >
        <div class="cols flex-center">
          <!-- Order Status -->
          <div>
            <order-status :order="order" />
          </div>

          <!-- Time Stamp -->
          <div class="t-caption c-text-black-medium align-right flex-1">{{ timestamp || "0:00pm"}}</div>
        </div>

        <div class="cols flex-center m-t-8">
          <!-- Restaurant Profile -->
          <div class="m-r-8">
            <img :src="resizedProfileImage(restaurant, '600')" class="w-48 h-48 r-48 cover" />
          </div>

          <div class="flex-1">
            <!-- Restaurant Name -->
            <div class="t-body1 c-text-black-high">{{restaurant.restaurantName}}</div>
            <div class="cols flex-center">
              <!-- Order Count -->
              <div
                class="t-body2 c-text-black-medium m-r-8"
              >{{$tc('sitemenu.orderCounter', totalCount, {count: totalCount})}}</div>

              <!-- Total -->
              <div class="t-body2 c-text-black-high m-r-8">{{ $n(order.totalCharge, 'currency') }}</div>

              <!-- Stripe Status -->
              <div>
                <i v-if="hasStripe" :class="'fab fa-cc-stripe stripe_'+order.payment.stripe"></i>
              </div>

              <!-- Order ID -->
              <div class="t-body2 c-text-black-high flex-1 align-right">{{ orderName }}</div>
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
        return Object.keys(this.order.order).reduce((count, id) => {
          return count + this.order.order[id];
        }, 0);
      }
      return 0;
    }
  },
  mounted() {}
};
</script>
