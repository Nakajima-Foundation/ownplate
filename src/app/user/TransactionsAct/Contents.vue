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
            <!--ToDo 以下、おもちかえりorMOで表示の出し分け-->
            <!--for omochikaeri-->
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

            <!--for MobileOrder-->
            <div v-if="false">
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
            <!--ToDo 以下、おもちかえりorMOで表示の出し分け-->
            <!--for omochikaeri-->
            <div class="text-sm font-bold text-black text-opacity-30">
              {{ $t("transactionsAct.delivery") }}
            </div>

            <div class="text-base mt-1">
              {{ $t("transactionsAct.deliveryDescription") }}
            </div>

            <!--for MobileOrder-->
            <div v-if="false">
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
            <!--ToDo 以下、おもちかえりorMOで表示の出し分け-->
            <!--for omochikaeri-->
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
                    {{ $t("transactionsAct.cancellationTakeoutDescription1") }}
                  </div>
                  <li>
                    {{ $t("transactionsAct.cancellationTakeoutDescription2") }}
                  </li>
                  <div
                    v-if="isDelivery"
                    class="text-sm font-bold text-black text-opacity-30 mt-2"
                  >
                    {{ $t("transactionsAct.cancellationDeliveryDescription1") }}
                  </div>
                  <li v-if="isDelivery">
                    -
                    {{ $t("transactionsAct.cancellationDeliveryDescription2") }}
                  </li>
                  <li v-if="isDelivery">
                    -
                    {{ $t("transactionsAct.cancellationDeliveryDescription3") }}
                  </li>
                  <li v-if="isDelivery">
                    -
                    {{ $t("transactionsAct.cancellationDeliveryDescription4") }}
                  </li>
                </ul>
              </li>
              <li>{{ $t("transactionsAct.cancellationDescription3") }}</li>
            </ul>

            <!--for MobileOrder-->
            <div v-if="false">
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
import { daysOfWeek } from "@/config/constant";
import { db } from "@/plugins/firebase";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";

export default {
  data() {
    return {
      restaurantsId: this.restaurantId(),
      days: daysOfWeek,
      notFound: null,
      paymentInfo: {},
      transactionsActPopup: false,
    };
  },
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
  created() {
    const uid = this.shopInfo.uid;
    db.doc(`/admins/${uid}/public/payment`)
      .get()
      .then((snapshot) => {
        this.paymentInfo = snapshot.data() || {};
      });
  },
  computed: {
    // BUGBUG: We need to determine what we want to diplay for EU
    nationalPhoneNumber() {
      if (!this.shopInfo.phoneNumber) {
        return "";
      }
      const number = this.parsedNumber;
      if (number) {
        return formatNational(number);
      }
      console.log("parsing failed, return as-is");
      return this.shopInfo.phoneNumber;
    },
    parsedNumber() {
      const countryCode = this.shopInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.shopInfo.phoneNumber);
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    showPayment() {
      return this.stripeAccount;
    },
    stripeAccount() {
      return this.paymentInfo.stripe;
    },
    inStorePayment() {
      return this.paymentInfo.inStore;
    },
  },
  methods: {
    validDate(date) {
      return !this.isNull(date.start) && !this.isNull(date.end);
    },
    openTransactionsAct() {
      this.transactionsActPopup = true;
    },
    closeTransactionsAct() {
      this.transactionsActPopup = false;
    },
  },
};
</script>
