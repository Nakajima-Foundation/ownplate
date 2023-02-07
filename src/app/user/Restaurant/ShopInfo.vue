<template>
  <div class="rounded-lg bg-white shadow">
    <!-- Location -->
    <div v-if="hasLocation">
      <div>
        <a target="_blank" :href="mapQuery">
          <img
            :src="`https://maps.googleapis.com/maps/api/staticmap?center=${shopInfo.location.lat},${shopInfo.location.lng}&zoom=16&size=800x${mapWidth}&scale=2&maptype=roadmap&markers=color:red%7Clabel:G%7C${shopInfo.location.lat},${shopInfo.location.lng}&key=${GAPIKey}`"
            class="w-full object-cover lg:rounded-lg"
          />
        </a>
      </div>
      <div class="mx-4 mt-4 pb-2">
        <a target="_blank" :href="mapQuery">
          <a class="inline-flex items-center justify-center">
            <i class="material-icons mr-2 text-lg text-op-teal">place</i>
            <div class="text-sm font-bold text-op-teal">
              <div v-if="region === 'JP'">
                〒{{ shopInfo.zip }} {{ shopInfo.state }}
                {{ shopInfo.city }}
                {{ shopInfo.streetAddress }}
              </div>
              <div v-else>
                {{ shopInfo.streetAddress }}, {{ shopInfo.city }},
                {{ shopInfo.state }} {{ shopInfo.zip }}
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
            <div class="inline-flex items-center justify-center">
              <i class="material-icons mr-2 text-lg text-op-teal">phone</i>
              <div class="text-sm font-bold text-op-teal">
                {{ nationalPhoneNumber }}
              </div>
            </div>
          </a>
        </template>
        <template v-else>
          <div class="inline-flex items-center justify-center">
            <i class="material-icons mr-2 text-lg">phone</i>
            <div class="text-sm font-bold">{{ nationalPhoneNumber }}</div>
          </div>
        </template>
      </div>

      <!-- Transactions Act -->
      <div class="mt-2">
        <transactions-act
          :shopInfo="shopInfo"
          :isDelivery="isDelivery"
        ></transactions-act>
      </div>
      
      <!-- Minimum Available Time -->
      <div
        class="mt-2 rounded-lg bg-blue-500 bg-opacity-10 px-4 py-2"
        v-if="!shopInfo.isEC"
      >
        <div class="text-sm font-bold">
          <template v-if="mode === 'mo'">
            {{ $t("shopInfo.mo.minimumAvailableTime") }}
          </template>
          <template v-else>
            {{ $t("shopInfo." + (isDelivery ? "delivery" : "takeout")) }}:{{
              $t("shopInfo.minimumAvailableTime")
            }}
          </template>
        </div>
        <div class="text-sm">
          {{ minimumAvailableTime }}
        </div>
      </div>

      <!-- More Info Button -->
      <div class="mt-4 text-center">
        <a
          @click="toggleMoreInfo()"
          class="inline-flex h-9 w-32 items-center justify-center rounded-full bg-black bg-opacity-5"
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
            :href="shopInfo.url"
            class="inline-flex items-center justify-center"
            rel="noopener noreferrer"
          >
            <i class="material-icons mr-2 text-lg text-op-teal">language</i>
            <div class="text-sm font-bold text-op-teal">
              {{ shopInfo.url }}
            </div>
          </a>
        </div>

        <!-- Restaurant LINE -->
        <div v-if="hasLineUrl" class="mt-2">
          <a
            target="_blank"
            :href="shopInfo.lineUrl"
            class="inline-flex items-center justify-center"
            rel="noopener noreferrer"
          >
            <i class="fab fa-line mr-2 text-lg" style="color: #4ec263"></i>
            <div class="text-sm font-bold" style="color: #4ec263">
              {{ shopInfo.lineUrl }}
            </div>
          </a>
        </div>

        <!-- Restaurant Instagram -->
        <div v-if="hasInstagramUrl" class="mt-2">
          <a
            target="_blank"
            :href="shopInfo.instagramUrl"
            class="inline-flex items-center justify-center"
            rel="noopener noreferrer"
          >
            <i class="fab fa-instagram mr-2 text-lg" style="color: #dd2a7b"></i>
            <div class="text-sm font-bold" style="color: #dd2a7b">
              {{ shopInfo.instagramUrl }}
            </div>
          </a>
        </div>

        <!-- Restaurant Uber Eats -->
        <div v-if="hasUberEatsUrl" class="mt-2">
          <a
            target="_blank"
            :href="shopInfo.uberEatsUrl"
            class="inline-flex items-center justify-center"
            rel="noopener noreferrer"
          >
            <i class="fab fa-uber mr-2 text-lg" style="color: #06c167"></i>
            <div class="text-sm font-bold" style="color: #06c167">
              {{ shopInfo.uberEatsUrl }}
            </div>
          </a>
        </div>

        <!-- Restaurant Hours -->
        <div class="mt-2">
          <div class="text-sm font-bold">
            {{ $t("shopInfo.hours") }}
          </div>

          <div class="mt-1">
            <template v-for="(day, key) in days">
              <div
                class="flex rounded px-2 py-1 text-sm"
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
                  <template v-if="(businessDay)[key]">
                    <template v-for="data in openTimes[key]">
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

        <!-- Payment Methods -->
        <div class="mt-2" v-if="inStorePayment && hasPaymentMethods">
          <div class="text-sm font-bold">
            {{ $t("shopInfo.paymentMethods") }}
          </div>
          <div class="mt-1 ml-1">
            <ul>
              <template v-for="(paymentMethod, k) in paymentMethods" :key="k">
                <li
                  v-if="(shopInfo.paymentMethods || {})[paymentMethod.key]"
                  >
                  {{
                  $t("editRestaurant.paymentMethodChoices." + paymentMethod.key)
                  }}
                </li>
              </template>
            </ul>
          </div>
        </div>

        <!-- Temporary Closure -->
        <div v-if="dispTemporaryClosure.length > 0" class="mt-2">
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

<script lang="ts">
import { defineComponent, computed, ref, PropType } from "vue";
import moment from "moment";

import { daysOfWeek, paymentMethods } from "@/config/constant";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";
import { ownPlateConfig, GAPIKey } from "@/config/project";
import { usePickupTime } from "@/utils/pickup";
import {
  stripeRegion,
  isNull,
  useIsInMo,
  useNationalPhoneNumber,
  validUrl,
  validLocation,
  validPlaceId,
  num2time,
} from "@/utils/utils";

import TransactionsAct from "@/app/user/TransactionsAct.vue";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    TransactionsAct,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
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
    mode: {
      type: String,
      required: true,
    },
    isPickup: {
      type: Boolean,
      required: false,
    },
  },
  emits: ["noAvailableTime"],
  setup(props, ctx) {
    const { locale, t } = useI18n({ useScope: 'global' });

    const d = new Date();
    const moreInfo = ref(false);
    const weekday = d.getDay();
    const today = d;

    const isInMo = useIsInMo();

    const mapWidth = computed(() => {
      // two rows
      if (window.innerWidth > 1024) {
        return 200;
      }
      if (window.innerWidth > 600) {
        return 150;
      }
      return 300;
    });

    const dispTemporaryClosure = computed(() => {
      const now = Date.now();
      return (props.shopInfo.temporaryClosure || []).filter((day) => {
        return day.seconds + 3600 * 24 > now / 1000;
      });
    });
    const isTodayTemporaryClosure = computed(() => {
      const res = dispTemporaryClosure.value.find((day) => {
        return (
          moment(day.toDate()).format("YYYYMMDD") ===
          moment().format("YYYYMMDD")
        );
      });
      return !!res;
    });

    const { parsedNumber, nationalPhoneNumber } = useNationalPhoneNumber(
      props.shopInfo
    );

    const phoneUrl = computed(() => {
      const number = parsedNumber.value;
      if (number) {
        return formatURL(number);
      }
      return "";
    });

    const isPickup = computed(() => {
      return props.isPickup;
    });
    const businessDay = computed(() => {
      if (isInMo.value && isPickup.value) {
        return props.shopInfo.moBusinessDay || {};
      }
      return props.shopInfo.businessDay || {};
    });
    const openTimes = computed(() => {
      if (isInMo.value && isPickup.value) {
        return props.shopInfo.moOpenTimes;
      }
      return props.shopInfo.openTimes;
    });

    const isOpen = computed(() => {
      return Object.keys(daysOfWeek).reduce((tmp: {[key: string]: any}, day) => {
        if (weekday === Number(day) && businessDay.value[day]) {
          // get now and compaire
          const res = openTimes.value[day].reduce((tmp, time) => {
            const now = today.getHours() * 60 + today.getMinutes();
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
    });
    const hasLocation = computed(() => {
      return (
        props.shopInfo.location &&
        props.shopInfo.location.lat &&
        props.shopInfo.location.lng &&
        validLocation(props.shopInfo.location || {}) &&
        validPlaceId(props.shopInfo.place_id)
      );
    });
    const hasUrl = computed(() => {
      return props.shopInfo.url && validUrl(props.shopInfo.url);
    });
    const hasLineUrl = computed(() => {
      return props.shopInfo.lineUrl && validUrl(props.shopInfo.lineUrl);
    });
    const hasInstagramUrl = computed(() => {
      return (
        props.shopInfo.instagramUrl && validUrl(props.shopInfo.instagramUrl)
      );
    });
    const hasUberEatsUrl = computed(() => {
      return props.shopInfo.uberEatsUrl && validUrl(props.shopInfo.uberEatsUrl);
    });
    const region = ownPlateConfig.region;

    const stripeAccount = computed(() => {
      return props.paymentInfo.stripe;
    });
    const showPayment = computed(() => {
      return stripeAccount.value;
    });
    const inStorePayment = computed(() => {
      return props.paymentInfo.inStore;
    });

    const shopPaymentMethods = computed(() => {
      return (
        Object.keys(props.shopInfo.paymentMethods || {}).filter((key) => {
          return !!(props.shopInfo.paymentMethods || {})[key];
        }) || []
      );
    });
    const hasPaymentMethods = computed(() => {
      return shopPaymentMethods.value.length > 0;
    });

    const { deliveryAvailableDays, availableDays, temporaryClosure } =
      usePickupTime(props.shopInfo, {}, ref({}), isInMo.value as boolean, isPickup);

    const minimumAvailableTime = computed(() => {
      const days = props.isDelivery
        ? deliveryAvailableDays.value
        : availableDays.value;
      const time = days[0]?.times[0]?.display;
      const date = days[0]?.date;
      console.log(locale.value);
      moment.locale(locale.value as string);
      if (!isNull(time) && !isNull(date)) {
        ctx.emit("noAvailableTime", false);
        return [moment(date).format("MM/DD (ddd)"), time].join(" ");
      } else {
        ctx.emit("noAvailableTime", true);
        return t("shopInfo.noAvailableTime");
      }
    });
    const mapQuery = computed(() => {
      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        props.shopInfo.location.lat +
        "," +
        props.shopInfo.location.lng +
        "&query_place_id=" +
        props.shopInfo.place_id
      );
    });

    const toggleMoreInfo = () => {
      moreInfo.value = !moreInfo.value;
    };
    const validDate = (date: any) => {
      return !isNull(date.start) && !isNull(date.end);
    };

    return {
      moreInfo,
      days: daysOfWeek,
      weekday,
      today,

      // computed
      mapWidth,
      dispTemporaryClosure,
      isTodayTemporaryClosure,
      phoneUrl,
      nationalPhoneNumber,
      isOpen,
      hasLocation,
      hasUrl,
      hasLineUrl,
      hasInstagramUrl,
      hasUberEatsUrl,
      region,
      showPayment,
      stripeAccount,
      inStorePayment,

      shopPaymentMethods,
      hasPaymentMethods,
      paymentMethods,

      minimumAvailableTime,
      mapQuery,
      GAPIKey,
      // methods
      toggleMoreInfo,
      validDate,

      num2time,
      //
      temporaryClosure,

      // for mo
      businessDay,
      openTimes,
    };
  },
});
</script>
