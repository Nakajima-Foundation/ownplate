<template>
  <div>
    <!-- For Admin -->
    <div
      v-if="!restaurant"
      @click="$emit('selected', order)"
      class="bg-white rounded-lg shadow cursor-pointer"
    >
      <!-- Order Status -->
      <div class="p-2">
        <div
          class="text-xs font-bold rounded p-1 text-center"
          :class="statusKey"
        >
          {{ $t("order.status." + convOrderStateForText(statusKey, order)) }}
        </div>
      </div>

      <!-- Payment Status and Time Stamp -->
      <div class="flex items-center px-2">
        <div class="flex-1 text-xs font-bold">
          <div v-if="hasStripe" :class="'stripe_' + order.payment.stripe">
            {{ $t("order.status.stripe_" + order.payment.stripe) }}
          </div>
          <div v-else class="text-yellow-500">
            {{ $t("order.status.onsitePayment") }}
          </div>
        </div>

        <div class="text-xs text-right">
          {{ timestamp || "0:00pm" }}
        </div>
      </div>

      <!-- Order ID and User Name/Phone -->
      <div class="flex items-center px-2 pt-2">
        <div class="text-xl font-bold">
          {{ orderName }}
        </div>

        <div class="flex-1 text-right text-base">
          <div v-if="order.name">
            <i
              class="fab fa-line text-lg mr-2"
              style="color: #4ec263"
              v-if="order.isLiff"
            />
            {{ order.name }}
          </div>

          <div v-else-if="phoneNumber">
            {{ nationalPhoneNumber }}
          </div>

          <div v-else>
            <i
              class="fab fa-line text-lg mr-2"
              style="color: #4ec263"
              v-if="order.isLiff"
            />
            LINE
          </div>
        </div>
      </div>

      <!-- Order Count, Total, and Tip -->
      <div class="flex items-center p-2">
        <div class="text-sm mr-2">
          {{ $tc("sitemenu.orderCounter", totalCount, { count: totalCount }) }}
        </div>

        <div class="text-sm mr-2">
          {{ $n(order.totalCharge, "currency") }}
        </div>

        <div class="text-sm mr-2" v-if="order.isDelivery">
          <i class="material-icons"> delivery_dining </i>
        </div>
        <div
          v-if="order.tip"
          class="flex-1 text-right text-xs font-bold text-blue-500"
        >
          {{ $t("order.includingTip") }} {{ $n(order.tip, "currency") }}
        </div>
      </div>
    </div>

    <!-- For User -->
    <div
      v-if="restaurant"
      @click="$emit('selected', order)"
      class="bg-white rounded-lg shadow cursor-pointer"
    >
      <!-- Order Status -->
      <div class="p-2">
        <div
          class="text-xs font-bold rounded p-1 text-center"
          :class="statusKey"
        >
          {{ $t("order.status." + convOrderStateForText(statusKey, order)) }}
        </div>
      </div>

      <!-- Payment Status and Time Stamp -->
      <div class="flex items-center px-2">
        <div class="flex-1 text-xs font-bold">
          <div v-if="hasStripe" :class="'stripe_' + order.payment.stripe">
            {{ $t("order.status.stripe_" + order.payment.stripe) }}
          </div>
          <div v-else class="text-yellow-500">
            {{ $t("order.status.onsitePayment") }}
          </div>
        </div>

        <div class="text-xs text-right">
          {{ timestamp || "0:00pm" }}
          <!-- # ToDo: Want to show not only time but also date for the user -->
        </div>
      </div>

      <!-- Restaurant Photo and Name, Order Count, Total, and Order ID -->
      <div class="flex items-center p-2">
        <div class="mr-2">
          <img
            :src="resizedProfileImage(restaurant, '600')"
            class="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div class="flex-1">
          <div class="text-base">
            {{ restaurant.restaurantName }}
          </div>

          <div class="flex items-center">
            <div class="text-sm mr-2">
              {{
                $tc("sitemenu.orderCounter", totalCount, {
                  count: totalCount,
                })
              }}
            </div>

            <div class="text-sm mr-2">
              {{ $n(order.totalCharge, "currency") }}
            </div>
            <div class="text-sm mr-2" v-if="order.isDelivery">
              <i class="material-icons"> delivery_dining </i>
            </div>

            <div class="flex-1 text-right text-sm font-bold">
              {{ orderName }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {
  defineComponent,
  ref,
  computed,
} from "@vue/composition-api";
  
import { nameOfOrder } from "@/utils/strings";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";
import { db } from "@/plugins/firebase";
import { order_status, order_status_keys } from "@/config/constant";
import { arrayOrNumSum } from "@/utils/utils";

export default defineComponent({
  props: {
    order: {
      type: Object,
      required: true,
    },
    isSuperView: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, ctx) {
    const restaurant = ref(null)
    if (props.order.restaurantId) {
      db.doc(`restaurants/${props.order.restaurantId}`)
        .get().then(snapshot => {
          restaurant.value = snapshot.data();
        });
    }

    const statusKey = computed(() => {
      return order_status_keys[props.order.status];
    })
    const hasStripe = computed(() => {
      return props.order.payment && props.order.payment.stripe;
    })
    const timestamp = computed(() => { 
      const time = props.order.timeEstimated || props.order.timePlaced;
      //const date = `${time.getMonth() + 1}/${time.getDate()} `;
      //return date + this.num2time(time.getHours() * 60 + time.getMinutes());
      if (props.isSuperView) {
        return ctx.root.$d(time, "long");
      } else {
        return ctx.root.$d(time, "time");
      }
    });
    const phoneNumber = computed(() => { 
      return props.order.phoneNumber
        ? parsePhoneNumber(props.order.phoneNumber)
        : "";
    });
    const nationalPhoneNumber = computed(() => {
      return phoneNumber.value === "" ? "" : formatNational(phoneNumber.value);
    });
    const orderName = computed(() => {
      return nameOfOrder(props.order);
    })
    const totalCount = computed(() => { 
      if (props.order.order) {
        return Object.values(props.order.order).reduce((count, order) => {
          return count + arrayOrNumSum(order);
        }, 0);
      }
      return 0;
    });
    const paymentIsNotCompleted = computed(() => {
      return hasStripe.value && props.order.status < order_status.ready_to_pickup;
    });

    return {
      restaurant,
      statusKey,
      hasStripe,
      timestamp,
      phoneNumber,
      nationalPhoneNumber,
      orderName,
      totalCount,
      paymentIsNotCompleted,
    }
  },
});
</script>
