<template>
  <div>
    <!-- For Admin -->
    <div
      v-if="!restaurant"
      @click="$emit('selected', order)"
      class="cursor-pointer rounded-lg bg-white shadow"
    >
      <!-- Order Status -->
      <div class="p-2">
        <div
          class="rounded p-1 text-center text-xs font-bold"
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

        <div class="text-right text-xs">
          {{ timestamp || "0:00pm" }}
        </div>
      </div>

      <!-- Order ID and User Name/Phone -->
      <div class="flex items-center px-2 pt-2">
        <div class="text-xl font-bold">
          {{ orderName }}
        </div>

        <div class="flex-1 text-right text-base">
          <div v-if="order.name && !isInMo">
            <i
              class="fab fa-line mr-2 text-lg"
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
              class="fab fa-line mr-2 text-lg"
              style="color: #4ec263"
              v-if="order.isLiff"
            />
            LINE
          </div>
        </div>
      </div>

      <!-- Order Count, Total, and Tip -->
      <div class="flex items-center p-2">
        <div class="mr-2 text-sm">
          {{ $tc("sitemenu.orderCounter", totalCount, { count: totalCount }) }}
        </div>

        <div class="mr-2 text-sm">
          {{ $n(order.totalCharge, "currency") }}
        </div>

        <div class="mr-2 text-sm" v-if="order.isDelivery">
          <i class="material-icons"> delivery_dining </i>
        </div>
        <!--ToDo ピックアップ注文の場合にアイコンを表示する-->
        <div class="mr-2 text-sm text-green-600" v-if="false">
          <i class="material-icons"> local_mall </i>
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
      class="cursor-pointer rounded-lg bg-white shadow"
    >
      <!-- Order Status -->
      <div class="p-2">
        <div
          class="rounded p-1 text-center text-xs font-bold"
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

        <div class="text-right text-xs">
          {{ timestamp || "0:00pm" }}
          <!-- # ToDo: Want to show not only time but also date for the user -->
        </div>
      </div>

      <!-- Restaurant Photo and Name, Order Count, Total, and Order ID -->
      <div class="flex items-center p-2">
        <div class="mr-2">
          <img
            :src="resizedProfileImage(restaurant, '600')"
            class="h-12 w-12 rounded-full object-cover"
          />
        </div>
        <div class="flex-1">
          <div class="text-base">
            {{ restaurant.restaurantName }}
          </div>

          <div class="flex items-center">
            <div class="mr-2 text-sm">
              {{
                $tc("sitemenu.orderCounter", totalCount, {
                  count: totalCount,
                })
              }}
            </div>

            <div class="mr-2 text-sm">
              {{ $n(order.totalCharge, "currency") }}
            </div>
            <div class="mr-2 text-sm" v-if="order.isDelivery">
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
import { defineComponent, ref, computed } from "@vue/composition-api";

import { nameOfOrder } from "@/utils/strings";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";

import { order_status, order_status_keys } from "@/config/constant";
import { arrayOrNumSum, convOrderStateForText } from "@/utils/utils";

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
    isInMo: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, ctx) {
    const restaurant = ref(null);
    if (props.order.restaurantId) {
      getDoc(doc(db, `restaurants/${props.order.restaurantId}`)).then(
        (snapshot) => {
          restaurant.value = snapshot.data();
        }
      );
    }

    const statusKey = computed(() => {
      return order_status_keys[props.order.status];
    });
    const hasStripe = computed(() => {
      return props.order.payment && props.order.payment.stripe;
    });
    const timestamp = computed(() => {
      const time = props.order.timeEstimated || props.order.timePlaced;
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
    });
    const totalCount = computed(() => {
      if (props.order.order) {
        return Object.values(props.order.order).reduce((count, order) => {
          return count + arrayOrNumSum(order);
        }, 0);
      }
      return 0;
    });
    const paymentIsNotCompleted = computed(() => {
      return (
        hasStripe.value && props.order.status < order_status.ready_to_pickup
      );
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

      convOrderStateForText,
    };
  },
});
</script>
