<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Location -->
    <div v-if="hasLocation">
      <div>
        <a target="_blank" :href="mapQuery">
          <img
            :src="`https://maps.googleapis.com/maps/api/staticmap?center=${this.shopInfo.location.lat},${this.shopInfo.location.lng}&zoom=16&size=800x${this.mapWidth}&scale=2&maptype=roadmap&markers=color:red%7Clabel:G%7C${this.shopInfo.location.lat},${this.shopInfo.location.lng}&key=${gmapKey}`"
            class="w-full object-cover lg:rounded-lg"
          />
        </a>
      </div>
      <div class="mt-4 mx-4 pb-2">
        <a target="_blank" :href="mapQuery">
          <a class="inline-flex justify-center items-center">
            <i class="material-icons text-lg text-op-teal mr-2">place</i>
            <div class="text-sm font-bold text-op-teal">
              <div v-if="region === 'JP'">
                〒{{ this.shopInfo.zip }} {{ this.shopInfo.state }}
                {{ this.shopInfo.city }}
                {{ this.shopInfo.streetAddress }}
              </div>
              <div v-else>
                {{ this.shopInfo.streetAddress }}, {{ this.shopInfo.city }},
                {{ this.shopInfo.state }} {{ this.shopInfo.zip }}
              </div>
            </div>
          </a>
        </a>
      </div>
    </div>
    <div v-else class="h-4"></div>

    <div class="p-4 pt-0">
      <!-- Restaurant Phone Number -->
      <div>
        <template v-if="phoneUrl">
          <a :href="phoneUrl">
            <div class="inline-flex justify-center items-center">
              <i class="material-icons text-lg text-op-teal mr-2">phone</i>
              <div class="text-sm font-bold text-op-teal">
                {{ nationalPhoneNumber }}
              </div>
            </div>
          </a>
        </template>
        <template v-else>
          <div class="inline-flex justify-center items-center">
            <i class="material-icons text-lg mr-2">phone</i>
            <div class="text-sm font-bold">{{ nationalPhoneNumber }}</div>
          </div>
        </template>
      </div>

      <!-- Minimum Available Time -->
      <div
        class="mt-2 px-4 py-2 rounded-lg bg-blue-500 bg-opacity-10"
        v-if="!shopInfo.isEC"
      >
        <div class="text-sm font-bold">
          {{ $t("shopInfo." + (isDelivery ? "delivery" : "takeout")) }}:{{
            $t("shopInfo.minimumAvailableTime")
          }}
        </div>
        <div class="text-sm">
          {{ minimumAvailableTime }}
        </div>
      </div>

      <!-- More Info Button -->
      <div class="mt-4 text-center">
        <a
          @click="toggleMoreInfo()"
          class="inline-flex justify-center items-center h-9 w-32 rounded-full bg-black bg-opacity-5"
        >
          <div class="text-sm font-bold text-op-teal">
            <template v-if="moreInfo">{{ $t("shopInfo.viewLess") }}</template>
            <template v-else>{{ $t("shopInfo.viewMore") }}</template>
          </div>
        </a>
      </div>

      <!-- More Info -->
      <div v-if="moreInfo">
        <!-- Restaurant Website -->
        <div v-if="hasUrl" class="mt-4">
          <a
            target="_blank"
            :href="this.shopInfo.url"
            class="inline-flex justify-center items-center"
          >
            <i class="material-icons text-lg text-op-teal mr-2">language</i>
            <div class="text-sm font-bold text-op-teal">
              {{ this.shopInfo.url }}
            </div>
          </a>
        </div>

        <!-- Restaurant LINE -->
        <div v-if="hasLineUrl" class="mt-2">
          <a
            target="_blank"
            :href="this.shopInfo.lineUrl"
            class="inline-flex justify-center items-center"
          >
            <i class="fab fa-line text-lg mr-2" style="color: #4ec263"></i>
            <div class="text-sm font-bold" style="color: #4ec263">
              {{ this.shopInfo.lineUrl }}
            </div>
          </a>
        </div>

        <!-- Restaurant Instagram -->
        <div v-if="hasInstagramUrl" class="mt-2">
          <a
            target="_blank"
            :href="this.shopInfo.instagramUrl"
            class="inline-flex justify-center items-center"
          >
            <i class="fab fa-instagram text-lg mr-2" style="color: #dd2a7b"></i>
            <div class="text-sm font-bold" style="color: #dd2a7b">
              {{ this.shopInfo.instagramUrl }}
            </div>
          </a>
        </div>

        <!-- Transactions Act -->
        <div class="mt-2">
          <transactions-act></transactions-act>
        </div>

        <!-- Restaurant Hours -->
        <div class="mt-2">
          <div class="text-sm font-bold">
            {{ $t("shopInfo.hours") }}
          </div>

          <div class="mt-1">
            <template v-for="(day, key) in days">
              <div
                class="flex px-2 py-1 rounded text-sm"
                :class="
                  weekday == key % 7
                    ? isTodayTemporaryClosure
                      ? 'bg-red-700 bg-opacity-10'
                      : 'bg-green-600 bg-opacity-10'
                    : ''
                "
              >
                <div class="w-16">{{ $t("week.short." + day) }}</div>
                <div class="flex-1">
                  <template v-if="shopInfo.businessDay[key]">
                    <template v-for="data in shopInfo.openTimes[key]">
                      <template v-if="validDate(data)">
                        {{ num2time(data.start) }} - {{ num2time(data.end) }}
                        <br />
                      </template>
                    </template>
                  </template>
                  <template v-else>{{ $t("shopInfo.closed") }}</template>
                </div>
                <div>
                  <template v-if="isOpen[key]">
                    <div
                      v-if="isTodayTemporaryClosure"
                      class="font-bold text-red-700"
                    >
                      {{ $t("shopInfo.temporaryClosure") }}
                    </div>
                    <div v-else class="font-bold text-green-600">Open</div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="mt-2">
          <div class="text-sm font-bold">
            {{ $t("shopInfo.paymentMethod") }}
          </div>

          <div class="mt-1 ml-1">
            <div class="text-sm">
              <span v-if="showPayment">{{ $t("shopInfo.onlinePayment") }}</span>
              <span v-if="showPayment && inStorePayment">/</span>
              <span v-if="inStorePayment">{{
                $t("shopInfo.onsitePayment")
              }}</span>
              <span v-if="!showPayment && !inStorePayment">{{
                $t("shopInfo.noPaymentMethod")
              }}</span>
            </div>
          </div>
        </div>

        <!-- Temporary Closure -->
        <div v-if="temporaryClosure.length > 0" class="mt-2">
          <div class="text-sm font-bold">
            {{ $t("shopInfo.temporaryClosure") }}
          </div>

          <div class="mt-1 ml-1">
            <div v-for="(day, key) in dispTemporaryClosure" class="text-sm">
              {{ moment(day.toDate()).format("YYYY/MM/DD") }}
              {{
                $t(
                  "week.short." +
                    days[Number(moment(day.toDate()).format("e")) || 7]
                )
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { daysOfWeek } from "@/config/constant";
import { parsePhoneNumber, formatNational, formatURL } from "~/utils/phoneutil";
import { ownPlateConfig } from "@/config/project";
import TransactionsAct from "@/app/user/TransactionsAct";

import { db } from "~/plugins/firebase";

import PickupMixin from "@/mixins/pickupMixin";

import moment from "moment";

export default {
  mixins: [PickupMixin],
  components: {
    TransactionsAct,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    paymentInfo: {
      type: Object,
      required: true,
    },
    isDelivery: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    const d = new Date();
    return {
      moreInfo: false,
      url: this.shareUrl(),
      days: daysOfWeek,
      weekday: d.getDay(),
      today: d,
    };
  },
  computed: {
    mapWidth() {
      // two rows
      if (window.innerWidth > 1024) {
        return 200;
      }
      if (window.innerWidth > 600) {
        return 150;
      }
      return 300;
    },
    dispTemporaryClosure() {
      const now = Date.now();
      return (this.shopInfo.temporaryClosure || []).filter((day) => {
        return day.seconds + 3600 * 24 > now / 1000;
      });
    },
    isTodayTemporaryClosure() {
      const res = this.dispTemporaryClosure.find((day) => {
        return (
          moment(day.toDate()).format("YYYYMMDD") ===
          moment().format("YYYYMMDD")
        );
      });
      return !!res;
    },
    phoneUrl() {
      const number = this.parsedNumber;
      if (number) {
        return formatURL(number);
      }
      return "";
    },
    // BUGBUG: We need to determine what we want to diplay for EU
    nationalPhoneNumber() {
      const number = this.parsedNumber;
      if (number) {
        return formatNational(number);
      }
      console.log("parsing failed, return as-is");
      return this.shopInfo.phoneNumber;
    },
    parsedNumber() {
      //console.log("countryCode", this.shopInfo.countryCode);
      const countryCode = this.shopInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.shopInfo.phoneNumber);
      } catch (error) {
        return null;
      }
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    isOpen() {
      return Object.keys(this.days).reduce((tmp, day) => {
        if (this.weekday === Number(day) && this.shopInfo.businessDay[day]) {
          // get now and compaire
          const res = this.shopInfo.openTimes[day].reduce((tmp, time) => {
            const now = this.today.getHours() * 60 + this.today.getMinutes();
            const ret = now >= time.start && now <= time.end;
            tmp = tmp || ret;
            return tmp;
          }, false);
          tmp[day] = res;
        } else {
          tmp[day] = false;
        }
        return tmp;
      }, {});
    },
    hasLocation() {
      return (
        this.shopInfo.location &&
        this.shopInfo.location.lat &&
        this.shopInfo.location.lng
      );
    },
    hasUrl() {
      return this.shopInfo.url;
    },
    hasLineUrl() {
      return this.shopInfo.lineUrl;
    },
    hasInstagramUrl() {
      return this.shopInfo.instagramUrl;
    },
    region() {
      return ownPlateConfig.region;
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
    minimumAvailableTime() {
      // const days = this.availableDays;
      const days = this.isDelivery
        ? this.deliveryAvailableDays
        : this.availableDays;
      const time = days[0]?.times[0]?.display;
      const date = days[0]?.date;
      moment.locale(this.$i18n.locale);
      if (!this.isNull(time) && !this.isNull(date)) {
        this.$emit("noAvailableTime", false);
        return [moment(date).format("MM/DD (ddd)"), time].join(" ");
      } else {
        this.$emit("noAvailableTime", true);
        return this.$t("shopInfo.noAvailableTime");
      }
    },
    mapQuery() {
      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        this.shopInfo.location.lat +
        "," +
        this.shopInfo.location.lng +
        "&query_place_id=" +
        this.shopInfo.place_id
      );
    },
  },
  methods: {
    toggleMoreInfo() {
      this.moreInfo = !this.moreInfo;
    },
    validDate(date) {
      return !this.isNull(date.start) && !this.isNull(date.end);
    },
  },
};
</script>
