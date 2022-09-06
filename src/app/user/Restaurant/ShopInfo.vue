<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Location -->
    <div v-if="hasLocation">
      <div>
        <a target="_blank" :href="mapQuery">
          <img
            :src="`https://maps.googleapis.com/maps/api/staticmap?center=${shopInfo.location.lat},${shopInfo.location.lng}&zoom=16&size=800x${mapWidth}&scale=2&maptype=roadmap&markers=color:red%7Clabel:G%7C${shopInfo.location.lat},${shopInfo.location.lng}&key=${gmapKey}`"
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
            :href="shopInfo.url"
            class="inline-flex justify-center items-center"
          >
            <i class="material-icons text-lg text-op-teal mr-2">language</i>
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
            class="inline-flex justify-center items-center"
          >
            <i class="fab fa-line text-lg mr-2" style="color: #4ec263"></i>
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
            class="inline-flex justify-center items-center"
          >
            <i class="fab fa-instagram text-lg mr-2" style="color: #dd2a7b"></i>
            <div class="text-sm font-bold" style="color: #dd2a7b">
              {{ shopInfo.instagramUrl }}
            </div>
          </a>
        </div>

        <!-- Transactions Act -->
        <div class="mt-2">
          <transactions-act
            :shopInfo="shopInfo"
            :isDelivery="isDelivery"
          ></transactions-act>
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
import { defineComponent, computed, ref } from "@vue/composition-api";
import { db } from "@/plugins/firebase";
import moment from "moment";

import { daysOfWeek } from "@/config/constant";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";
import { ownPlateConfig } from "@/config/project";
import { usePickupTime } from "@/utils/pickup";
import {
  stripeRegion,
  isNull,
  useNationalPhoneNumber,
  validUrl,
} from "@/utils/utils";

import TransactionsAct from "@/app/user/TransactionsAct.vue";

export default defineComponent({
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
    mode: {
      type: String,
      required: true,
    },
  },
  emits: ["noAvailableTime"],
  setup(props, ctx) {
    const d = new Date();
    const moreInfo = ref(false);
    const weekday = d.getDay();
    const today = d;

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

    const isOpen = computed(() => {
      return Object.keys(daysOfWeek).reduce((tmp, day) => {
        if (weekday === Number(day) && props.shopInfo.businessDay[day]) {
          // get now and compaire
          const res = props.shopInfo.openTimes[day].reduce((tmp, time) => {
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
        props.shopInfo.location.lng
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

    const { deliveryAvailableDays, availableDays, temporaryClosure } =
      usePickupTime(props.shopInfo, {}, {}, ctx);

    const minimumAvailableTime = computed(() => {
      const days = props.isDelivery
        ? deliveryAvailableDays.value
        : availableDays.value;
      const time = days[0]?.times[0]?.display;
      const date = days[0]?.date;
      moment.locale(ctx.root.$i18n.locale);
      if (!isNull(time) && !isNull(date)) {
        ctx.emit("noAvailableTime", false);
        return [moment(date).format("MM/DD (ddd)"), time].join(" ");
      } else {
        ctx.emit("noAvailableTime", true);
        return ctx.root.$t("shopInfo.noAvailableTime");
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
    const validDate = (date) => {
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
      region,
      showPayment,
      stripeAccount,
      inStorePayment,
      minimumAvailableTime,
      mapQuery,
      // methods
      toggleMoreInfo,
      validDate,

      //
      temporaryClosure,
    };
  },
});
</script>
