<template>
  <div>
    <!-- Restaurant Details -->
    <div class="m-t-24">
      <div class="t-h6 c-text-black-disabled">
        {{ $t("shopInfo.restaurantDetails") }}
      </div>

      <div class="bg-surface r-8 d-low m-t-8 p-b-24">
        <!-- Restaurant Location -->
        <div v-if="hasLocation">
          <GMap
            ref="gMap"
            :cluster="{ options: { styles: 'clusterStyle' } }"
            :options="{ fullscreenControl: false, styles: 'mapStyle' }"
            :zoom="18"
            @loaded="updateMap"
          ></GMap>

          <div class="m-t-16 m-l-16 m-r-16">
            <a
              target="_blank"
              :href="
                'https://www.google.com/maps/search/?api=1&query=' +
                  this.shopInfo.location.lat +
                  ',' +
                  this.shopInfo.location.lng +
                  '&query_place_id=' +
                  this.shopInfo.place_id
              "
              class="p-font-middle"
            >
              <div class="op-button-text">
                <i class="material-icons">place</i>
                <span v-if="region === 'JP'"
                  >〒{{ this.shopInfo.zip }} {{ this.shopInfo.state }}
                  {{ this.shopInfo.city }}
                  {{ this.shopInfo.streetAddress }}</span
                >
                <span v-else
                  >{{ this.shopInfo.streetAddress }}, {{ this.shopInfo.city }},
                  {{ this.shopInfo.state }} {{ this.shopInfo.zip }}</span
                >
              </div>
            </a>
          </div>
        </div>
        <div v-else class="h-8"></div>

        <!-- Restaurant Phone Number -->
        <div class="m-t-8 m-l-16 m-r-16">
          <a v-if="phoneUrl" :href="phoneUrl">
            <div class="op-button-text">
              <i class="material-icons">phone</i>
              <span>{{ nationalPhoneNumber }}</span>
            </div>
          </a>
          <div v-else class="op-button-text">
            <i class="material-icons">phone</i>
            <span>{{ nationalPhoneNumber }}</span>
          </div>
        </div>

        <!-- Minimum Available Time -->
        <div
          class="m-t-8 m-l-16 m-r-16 bg-status-blue-bg r-8 p-l-16 p-r-16 p-t-8 p-b-8"
        >
          <div class="t-subtitle2 c-text-black-medium">
            {{ $t("shopInfo.minimumAvailableTime") }}
          </div>
          <div class="t-body2">
            {{ minimumAvailableTime }}
          </div>
        </div>

        <!-- More Info Button -->
        <div class="align-center p-t-16">
          <div
            @click="toggleMoreInfo()"
            class="op-button-pill bg-form w-128 t-subtitle2"
          >
            <div v-if="moreInfo">{{ $t("shopInfo.viewLess") }}</div>
            <div v-else>{{ $t("shopInfo.viewMore") }}</div>
          </div>
        </div>

        <!-- More Info -->
        <div v-if="moreInfo">
          <!-- Restaurant Website -->
          <div v-if="hasUrl" class="m-t-8 m-l-16 m-r-16">
            <a target="_blank" :href="this.shopInfo.url">
              <div class="op-button-text">
                <i class="material-icons">language</i>
                <span>{{ this.shopInfo.url }}</span>
              </div>
            </a>
          </div>

          <!-- Restaurant LINE -->
          <div v-if="hasLineUrl" class="m-t-8 m-l-16 m-r-16">
            <a target="_blank" :href="this.shopInfo.lineUrl">
              <div class="op-button-text" style="color:#4EC263;">
                <i class="fab fa-line fa-lg m-r-8"></i>
                <span>{{ this.shopInfo.lineUrl }}</span>
              </div>
            </a>
          </div>

          <!-- Restaurant Instagram -->
          <div v-if="hasInstagramUrl" class="m-t-8 m-l-16 m-r-16">
            <a target="_blank" :href="this.shopInfo.instagramUrl">
              <div class="op-button-text" style="color:#DD2A7B;">
                <i class="fab fa-instagram fa-lg m-r-8"></i>
                <span>{{ this.shopInfo.instagramUrl }}</span>
              </div>
            </a>
          </div>

          <!-- Transactions Act -->
          <div class="m-t-8 m-l-16 m-r-16">
            <transactions-act></transactions-act>
          </div>

          <!-- Restaurant Hours -->
          <div class="m-l-16 m-r-16 m-t-16">
            <div class="t-subtitle2 c-text-black-medium p-l-8">
              {{ $t("shopInfo.hours") }}
            </div>
            <template v-for="(day, key) in days">
              <div
                class="cols p-l-8 p-r-8 p-t-4 p-b-4 r-4 t-body2"
                :style="
                  weekday == key % 7
                    ? { 'background-color': 'rgba(104, 159, 56, 0.1)' }
                    : {}
                "
              >
                <div class="w-64">{{ $t("week.short." + day) }}</div>
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
                    <span class="c-status-green">Open</span>
                  </template>
                </div>
              </div>
            </template>
          </div>

          <!-- Payment Method -->
          <div class="m-t-8 m-l-16 m-r-16">
            <div class="t-subtitle2 c-text-black-medium p-l-8">
              {{ $t("shopInfo.paymentMethod") }}
            </div>
            <div class="is-inline-flex flex-center m-l-8">
              <span class="t-body2">
                <span v-if="showPayment">{{
                  $t("shopInfo.onlinePayment")
                }}</span>
                <span v-if="showPayment && inStorePayment">/</span>
                <span v-if="inStorePayment">{{
                  $t("shopInfo.onsitePayment")
                }}</span>
                <span v-if="!showPayment && !inStorePayment">{{
                  $t("shopInfo.noPaymentMethod")
                }}</span>
              </span>
            </div>
          </div>

          <!-- Temporary Closure -->
          <div
            class="m-t-8 m-l-16 m-r-16"
            v-if="
                  temporaryClosure.length > 0
            "
          >
            <div class="t-subtitle2 c-text-black-medium p-l-8">
              {{ $t("shopInfo.temporaryClosure") }}
            </div>
            <div
              class="flex-center m-l-8"
              v-for="(day, key) in temporaryClosure"
            >
              <span class="t-body2">
                {{ moment(day.toDate()).format("YYYY/MM/DD") }}
                {{
                  $t(
                    "week.short." +
                      days[Number(moment(day.toDate()).format("e")) || 7]
                  )
                }} </span
              ><br />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { daysOfWeek } from "~/plugins/constant.js";
import {
  parsePhoneNumber,
  formatNational,
  formatURL
} from "~/plugins/phoneutil.js";
import { ownPlateConfig } from "@/config/project";
import TransactionsAct from "~/app/user/TransactionsAct";

import { db } from "~/plugins/firebase.js";
import { releaseConfig } from "~/plugins/config.js";

import PickupMixin from "../Order/pickupMixin";

import moment from "moment";

export default {
  mixins: [PickupMixin],
  components: {
    TransactionsAct
  },
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
    paymentInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    const d = new Date();
    return {
      moreInfo: false,
      url: this.shareUrl(),
      days: daysOfWeek,
      weekday: d.getDay(),
      today: d
    };
  },
  computed: {

    temporaryClosure() {
      const now = Date.now();
      return (this.shopInfo.temporaryClosure || []).filter((day) => {
        return day.seconds + 3600 * 24 > now / 1000;
      });;
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
      return !releaseConfig.hidePayment && this.stripeAccount;
    },
    stripeAccount() {
      return this.paymentInfo.stripe;
    },
    inStorePayment() {
      return this.paymentInfo.inStore;
    },
    minimumAvailableTime() {
      const time = this.availableDays[0]?.times[0]?.display;
      const date = this.availableDays[0]?.date;
      moment.locale(this.$i18n.locale);
      if (!this.isNull(time) && !this.isNull(date)) {
        this.$emit("noAvailableTime", false);
        return [moment(date).format("MM/DD (ddd)"), time].join(" ");
      } else {
        this.$emit("noAvailableTime", true);
        return this.$t("shopInfo.noAvailableTime");
      }
    }
  },
  mounted() {
    this.updateMap();
  },
  methods: {
    toggleMoreInfo() {
      this.moreInfo = !this.moreInfo;
    },
    updateMap() {
      if (this.hasLocation) {
        if (this.$refs.gMap && this.$refs.gMap.map) {
          const location = this.shopInfo.location;
          //console.log(location);
          if (location) {
            this.$refs.gMap.map.setCenter(location);
            const marker = new google.maps.Marker({
              position: new google.maps.LatLng(location.lat, location.lng),
              title: this.shopInfo.restaurantName,
              map: this.$refs.gMap.map
            });
          }
        }
      }
    },
    validDate(date) {
      return !this.isNull(date.start) && !this.isNull(date.end);
    }
  }
};
</script>
<style type="scss" scped>
.GMap__Wrapper {
  width: 100%;
  height: 160px;
  border-radius: 8px 8px 0 0;
}
</style>
