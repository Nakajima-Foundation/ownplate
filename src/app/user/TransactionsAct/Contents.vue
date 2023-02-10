<template>
  <div>
    <!-- Transactions Act Popup-->
    <div>
      <div class="omx-2 rounded-lg bg-white p-6 shadow-lg">
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-40">
          {{ $t("transactionsAct.title") }}
        </div>

        <!-- Body -->
        <div class="mt-6">
          <!-- Seller Name -->
          <div>
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.sellerName") }}
            </div>

            <div class="mt-1 text-base">
              {{ shopInfo.restaurantName }}
            </div>
          </div>

          <!-- Representative -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.representative") }}
            </div>

            <div class="mt-1 text-base">
              {{ shopInfo.ownerName || "---" }}
            </div>
          </div>

          <!-- Address -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.address") }}
            </div>

            <div class="mt-1 text-base">
              {{ shopInfo.state }} {{ shopInfo.city }}
              {{ shopInfo.streetAddress }}
            </div>
          </div>

          <!-- Hours -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.hours") }}
            </div>

            <div class="mt-1 text-base">
              <template v-for="(day, key) in days">
                <div class="flex px-2 py-1 text-sm">
                  <div class="w-16">{{ $t("week.short." + day) }}</div>
                  <div class="flex-1">
                    <template v-if="(shopInfo.businessDay || {})[key]">
                      <template v-for="data in (shopInfo.openTimes || {})[key]">
                        <template v-if="validDate(data)">
                          {{ num2time(data.start) }} - {{ num2time(data.end) }}
                          <br />
                        </template>
                      </template>
                    </template>
                    <template v-else>{{ $t("shopInfo.closed") }}</template>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.phone") }}
            </div>

            <div class="mt-1 text-base">
              {{ nationalPhoneNumber }}
            </div>
          </div>

          <!-- Sales Price -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.price") }}
            </div>

            <div class="mt-1 text-base">
              {{ $t("transactionsAct.priceDescription") }}
            </div>
          </div>

          <!-- Other Required Fees -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.otherFees") }}
            </div>

            <div class="mt-2 text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.takeoutTitle") }}
            </div>

            <div class="mt-1 text-base">
              {{ $t("transactionsAct.otherFeesDescription") }}
            </div>

            <template v-if="shopInfo.enableDelivery">
              <div class="mt-2 text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.deliveryTitle") }}
              </div>

              <div class="mt-1 text-base">
                {{ $t("transactionsAct.otherFeesDescriptionDelivery") }}
              </div>
            </template>
          </div>
          <!-- Payment Period and Method -->
          <div class="mt-4">
            <!--for omochikaeri-->
            <div v-if="!isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.payment") }}
              </div>
              <ul class="ml-5 mt-1 list-outside list-disc">
                <li v-if="showPayment">
                  {{ $t("transactionsAct.paymentDescriptionCard") }}
                </li>
                <li v-if="inStorePayment">
                  {{ $t("transactionsAct.paymentDescriptionStore") }}
                </li>
                <li>{{ $t("transactionsAct.paymentDescriptionCardNote") }}</li>
              </ul>
            </div>
            <!--for MobileOrder-->
            <div v-if="isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.paymentMo") }}
              </div>
              <ul class="ml-5 mt-1 list-outside list-disc">
                <li v-if="showPayment">
                  {{ $t("transactionsAct.paymentDescriptionCardMo") }}
                </li>
                <li>
                  {{ $t("transactionsAct.paymentDescriptionCardNoteMo") }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Delivery Time -->
          <div class="mt-4">
            <!--for omochikaeri-->
            <div v-if="!isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.delivery") }}
              </div>

              <div class="mt-1 text-base">
                {{ $t("transactionsAct.deliveryDescription") }}
              </div>
            </div>

            <!--for MobileOrder-->
            <div v-if="isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.deliveryMo") }}
              </div>

              <div class="mt-1 text-base">
                {{ $t("transactionsAct.deliveryDescriptionMo") }}
              </div>
            </div>
          </div>

          <!-- Cancellation -->
          <div class="mt-4">
            <!--for omochikaeri-->
            <div v-if="!isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.cancellation") }}
              </div>
              <ul class="ml-5 mt-1 list-outside list-disc">
                <li>{{ $t("transactionsAct.cancellationDescription1") }}</li>
                <li v-if="!isInMo">
                  {{ $t("transactionsAct.cancellationDescription4") }}
                </li>
                <li>
                  {{ $t("transactionsAct.cancellationDescription2") }}
                  <ul class="mb-2 list-outside list-none">
                    <div
                      class="mt-2 text-sm font-bold text-black text-opacity-30"
                    >
                      {{ $t("transactionsAct.takeoutTitle") }}
                    </div>
                    <li>
                      {{
                        $t("transactionsAct.cancellationTakeoutDescription1")
                      }}
                    </li>
                    <div
                      v-if="shopInfo.enableDelivery"
                      class="mt-2 text-sm font-bold text-black text-opacity-30"
                    >
                      {{ $t("transactionsAct.deliveryTitle") }}
                    </div>
                    <li v-if="shopInfo.enableDelivery">
                      -
                      {{
                        $t("transactionsAct.cancellationDeliveryDescription1")
                      }}
                    </li>
                    <li v-if="shopInfo.enableDelivery">
                      -
                      {{
                        $t("transactionsAct.cancellationDeliveryDescription2")
                      }}
                    </li>
                    <li v-if="shopInfo.enableDelivery">
                      -
                      {{
                        $t("transactionsAct.cancellationDeliveryDescription3")
                      }}
                    </li>
                  </ul>
                </li>
                <li>{{ $t("transactionsAct.cancellationDescription3") }}</li>
              </ul>
            </div>

            <!--for MobileOrder-->
            <div v-if="isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.cancellationMo") }}
              </div>
              <ul class="ml-5 mt-1 list-outside list-disc">
                <li>{{ $t("transactionsAct.cancellationDescription1Mo") }}</li>
                <li>
                  {{ $t("transactionsAct.cancellationDescription2Mo") }}
                </li>
                <li>
                  {{ $t("transactionsAct.cancellationTakeoutDescriptionMo") }}
                </li>
                <li>{{ $t("transactionsAct.cancellationDescription3Mo") }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 text-center">
          <a
            @click="closeTransactionsAct()"
            class="inline-flex h-12 items-center justify-center rounded-full bg-black bg-opacity-5 px-6"
            style="min-width: 8rem"
          >
            <div class="text-base font-bold text-black text-opacity-60">
              {{ $t(closeButton) }}
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, PropType } from "vue";

import { daysOfWeek } from "@/config/constant";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { isNull, useNationalPhoneNumber, useIsInMo, num2time } from "@/utils/utils";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { PaymentInfo } from "@/models/paymentInfo";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: true,
    },
    closeButton: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const isInMo = useIsInMo();

    const restaurantsId = props.shopInfo.restaurantId;
    const days = daysOfWeek;
    const paymentInfo = ref<PaymentInfo>({});

    const uid = props.shopInfo.uid;

    onSnapshot(doc(db, `/admins/${uid}/public/payment`), (snapshot) => {
      paymentInfo.value = snapshot.data() || {};
    });

    const { nationalPhoneNumber } = useNationalPhoneNumber(props.shopInfo);

    const inStorePayment = computed(() => {
      return paymentInfo.value.inStore;
    });
    const showPayment = computed(() => {
      return paymentInfo.value.stripe;
    });
    const validDate = (date: any) => {
      return !isNull(date.start) && !isNull(date.end);
    };
    const closeTransactionsAct = () => {
      ctx.emit("closeTransactionsAct");
    };

    return {
      restaurantsId,
      days,
      paymentInfo,

      showPayment,
      inStorePayment,
      validDate,

      isInMo,

      closeTransactionsAct, // call by parent

      nationalPhoneNumber,

      num2time,
    };
  },
});
</script>
