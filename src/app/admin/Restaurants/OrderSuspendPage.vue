<template>
  <div>
    <template v-if="notFound == null"></template>
    <template v-else-if="notFound">
      <not-found />
    </template>

    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-4 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="`/admin/restaurants/${shopInfo.restaurantId}/orders`"
        :showSuspend="false"
        backText="button.backToOrderListPage"
        iconText="arrow_back"
        pageText="orderSuspend"
      />

      <!-- Title -->
      <div class="mx-6 mt-4 text-xl font-bold text-black text-opacity-30">
        {{ $t("admin.order.suspendSettings") }}
      </div>

      <!-- Date -->
      <div class="mx-6 mt-4 text-sm font-bold text-black text-opacity-60">
        {{ $t("admin.order.suspendNewOrders") }}
        <span v-if="date">: {{ $d(date.date, "short") }}</span>
      </div>

      <!-- Suspend and Unsuspend  -->
      <div class="mx-6 mt-2">
        <div v-if="!suspendUntil">
          <div v-if="availableTimes.length === 0">
            {{ $t("admin.order.notSuspendAvailable") }}
          </div>
          <div v-else>
            <o-button
              v-for="time in availableTimes"
              :key="time.time"
              @click="handleSuspend(0, time.time)"
              class="b-reset-tw mr-4 mb-4"
            >
              <div
                class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons mr-2 text-lg text-op-teal"
                  >alarm_off</i
                >
                <div class="text-sm font-bold text-op-teal">
                  {{
                    $t("admin.order.suspendUntil", { display: time.display })
                  }}
                </div>
              </div>
            </o-button>

            <div class="mt-4">
              <div
                v-for="(day, k) in [0, 1, 2, 7]"
                :key="k"
                class="inline-flex"
              >
                <o-button
                  v-if="availableTimes.length > 0"
                  class="b-reset-tw"
                  @click="handleSuspend(day, 24 * 60)"
                >
                  <div
                    class="mr-4 mb-4 inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                  >
                    <i class="material-icons mr-2 text-lg text-op-teal"
                      >alarm_off</i
                    >
                    <div class="text-sm font-bold text-op-teal">
                      <span v-if="day > 0">{{
                        $t("admin.order.suspendDayUntil", { display: day })
                      }}</span>
                      <span v-else>{{
                        $t("admin.order.suspendForAllDay")
                      }}</span>
                    </div>
                  </div>
                </o-button>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="mt-4 rounded-lg bg-red-700 bg-opacity-10 p-4 text-center">
            <div class="text-base font-bold text-red-700">
              {{ $t("admin.order.suspending") }}
            </div>
            <div class="mt-2 text-sm font-bold text-red-700">
              {{ $t("admin.order.unsuspendAt") }} {{ suspendUntil }}
            </div>
          </div>

          <div class="mt-4">
            <o-button class="b-reset-tw" @click="handleRemove">
              <div
                class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons mr-2 text-lg text-op-teal">alarm_on</i>
                <div class="text-sm font-bold text-op-teal">
                  {{ $t("admin.order.unsuspend") }}
                </div>
              </div>
            </o-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

import AdminHeader from "@/app/admin/AdminHeader.vue";
import NotFound from "@/components/NotFound.vue";

import { checkShopAccount } from "@/utils/userPermission";
import {
  useAdminUids,
  notFoundResponse,
  useRestaurantId,
  defaultTitle,
} from "@/utils/utils";
import { usePickupTime } from "@/utils/pickup";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Order Suspend",
            this.shopInfo.restaurantName,
            defaultTitle,
          ].join(" / ")
        : defaultTitle,
    };
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { d } = useI18n({ useScope: "global" });

    const restaurantId = useRestaurantId();
    const { ownerUid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    if (!props.shopInfo || props.shopInfo.deletedFlag) {
      return notFoundResponse;
    }

    const { availableDays } = usePickupTime(props.shopInfo, {}, ref({}));

    // const date = ref<{ offset: number; date: Date; times: any; } | null>(null);
    const date = computed<{ offset: number; date: Date; times: any } | null>(
      () => {
        if (availableDays.value.length > 0) {
          return availableDays.value[0];
        }
        return null;
      },
    );
    const availableTimes = computed(() => {
      // Note: availableDays will change if we change shopInfo.suspendUntil.
      // This logic works because we use availableDays when suspendUntil is not set or too old.
      if (date.value) {
        const times = date.value.times;
        return times.slice(1, 13); // first twelve time slots (except first) regardless of the time
      }
      return [];
    });
    const suspendUntil = computed(() => {
      if (props.shopInfo.suspendUntil) {
        const time = props.shopInfo.suspendUntil.toDate();
        if (time < new Date()) {
          return false;
        }
        return d(time, "long");
      }
      return false;
    });

    const handleSuspend = async (day: number, time: number) => {
      const tmpDate = date.value?.date
        ? new Date(date.value?.date)
        : new Date();
      tmpDate.setHours(time / 60);
      tmpDate.setMinutes(time % 60);
      if (day && day > 0) {
        tmpDate.setDate(tmpDate.getDate() + day);
      }
      const ts = Timestamp.fromDate(tmpDate);
      store.commit("setLoading", true);
      await updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
        suspendUntil: ts,
      });
      store.commit("setLoading", false);
    };
    const handleRemove = async () => {
      store.commit("setLoading", true);
      await updateDoc(doc(db, `restaurants/${restaurantId.value}`), {
        suspendUntil: null,
      });
      store.commit("setLoading", false);
    };
    return {
      date,
      availableTimes,
      suspendUntil,
      handleSuspend,
      handleRemove,
      notFound: false,
    };
  },
});
</script>
