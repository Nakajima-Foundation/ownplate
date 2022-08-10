<template>
  <div>
    <!-- Transactions Act Popup-->
    <b-modal :active.sync="transactionsActPopup" :width="488" scroll="keep">
      <div class="omx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
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

            <div class="text-base mt-1">
              {{ shopInfo.restaurantName }}
            </div>
          </div>

          <!-- Representative -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.representative") }}
            </div>

            <div class="text-base mt-1">
              {{ shopInfo.ownerName || "---" }}
            </div>
          </div>

          <!-- Address -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.address") }}
            </div>

            <div class="text-base mt-1">
              {{ shopInfo.state }} {{ shopInfo.city }}
              {{ shopInfo.streetAddress }}
            </div>
          </div>

          <!-- Hours -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.hours") }}
            </div>

            <div class="text-base mt-1">
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

            <div class="text-base mt-1">
              {{ nationalPhoneNumber }}
            </div>
          </div>

          <!-- Sales Price -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.price") }}
            </div>

            <div class="text-base mt-1">
              {{ $t("transactionsAct.priceDescription") }}
            </div>
          </div>

          <!-- Other Required Fees -->
          <div class="mt-4">
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.otherFees") }}
            </div>

            <div class="text-base mt-1">
              {{ $t("transactionsAct.otherFeesDescription") }}
            </div>
          </div>
          <!-- Payment Period and Method -->
          <div class="mt-4">
            <!--for omochikaeri-->
            <div v-if="!isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.payment") }}
              </div>
              <ul class="list-disc list-outside ml-5 mt-1">
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
              <ul class="list-disc list-outside ml-5 mt-1">
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

              <div class="text-base mt-1">
                {{ $t("transactionsAct.deliveryDescription") }}
              </div>
            </div>

            <!--for MobileOrder-->
            <div v-if="!isInMo">
              <div class="text-sm font-bold text-black text-opacity-30">
                {{ $t("transactionsAct.deliveryMo") }}
              </div>

              <div class="text-base mt-1">
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
              <ul class="list-disc list-outside ml-5 mt-1">
                <li>{{ $t("transactionsAct.cancellationDescription1") }}</li>
                <li>
                  {{ $t("transactionsAct.cancellationDescription2") }}
                  <ul class="list-none list-outside mb-2">
                    <div
                      class="text-sm font-bold text-black text-opacity-30 mt-2"
                    >
                      {{
                        $t("transactionsAct.cancellationTakeoutDescription1")
                      }}
                    </div>
                    <li>
                      {{
                        $t("transactionsAct.cancellationTakeoutDescription2")
                      }}
                    </li>
                    <div
                      v-if="isDelivery"
                      class="text-sm font-bold text-black text-opacity-30 mt-2"
                    >
                      {{
                        $t("transactionsAct.cancellationDeliveryDescription1")
                      }}
                    </div>
                    <li v-if="isDelivery">
                      -
                      {{
                        $t("transactionsAct.cancellationDeliveryDescription2")
                      }}
                    </li>
                    <li v-if="isDelivery">
                      -
                      {{
                        $t("transactionsAct.cancellationDeliveryDescription3")
                      }}
                    </li>
                    <li v-if="isDelivery">
                      -
                      {{
                        $t("transactionsAct.cancellationDeliveryDescription4")
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
              <ul class="list-disc list-outside ml-5 mt-1">
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
            class="inline-flex justify-center items-center h-12 rounded-full px-6 bg-black bg-opacity-5"
            style="min-width: 8rem"
          >
            <div class="text-base font-bold text-black text-opacity-60">
              {{ $t("menu.close") }}
            </div>
          </a>
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script>
import { defineComponent, ref, computed } from "@vue/composition-api";

import { daysOfWeek } from "@/config/constant";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { isNull, useNationalPhoneNumber, useIsInMo } from "@/utils/utils";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, ctx) {
    const isInMo = useIsInMo(ctx.root);

    const restaurantsId = props.shopInfo.restaurantId;
    const days = daysOfWeek;
    const paymentInfo = ref({});
    const transactionsActPopup = ref(false);

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
    const validDate = (date) => {
      return !isNull(date.start) && !isNull(date.end);
    };
    const openTransactionsAct = () => {
      transactionsActPopup.value = true;
    };
    const closeTransactionsAct = () => {
      transactionsActPopup.value = false;
    };

    return {
      restaurantsId,
      days,
      paymentInfo,
      transactionsActPopup,

      showPayment,
      inStorePayment,
      validDate,

      isInMo,

      openTransactionsAct,
      closeTransactionsAct, // call by parent

      nationalPhoneNumber,
    };
  },
});
</script>
