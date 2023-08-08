<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        backLink="/admin/restaurants/"
        :showSuspend="true"
      />

      <div class="sm:flex">
        <div class="mt-6 ml-6 sm:flex">
          <ToggleSwitch
            :toggleState="queryIsPlacedDate"
            @toggleFunction="switchOrderQuery()"
            onName="admin.order.placedDate"
            offName="admin.order.pickupDate"
          />
        </div>

        <!-- Date -->
        <div class="ml-6 mt-6 sm:ml-4">
          <o-select v-model="dayIndex">
            <option
              v-for="day in lastSeveralDays"
              :value="day.index"
              :key="day.index"
            >
              {{ $d(day.date, "short") }}
              {{ orderCounter[moment(day.date).format("YYYY-MM-DD")] }}
              <span v-if="day.index === pickUpDaysInAdvance">{{
                $t("date.today")
              }}</span>
            </option>
          </o-select>
        </div>
      </div>

      <!-- Orders -->
      <div
        class="mx-6 mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <template v-for="order in orders" :key="order.id">
          <router-link
            :to="'/admin/restaurants/' + restaurantId + '/orders/' + order.id"
          >
            <ordered-info :key="order.id" :order="order" />
          </router-link>
        </template>
      </div>

      <!-- Go to History -->
      <div class="mx-6 mt-6">
        <router-link :to="`/admin/restaurants/${restaurantId}/history`"
          ><div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.history") }}
            </div>
          </div></router-link
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  watch,
} from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  collection,
  where,
  query,
  onSnapshot,
  setDoc,
  DocumentData,
} from "firebase/firestore";

import { midNight } from "@/utils/dateUtils";
import { order_status } from "@/config/constant";
import moment from "moment";

import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";
import ToggleSwitch from "@/components/ToggleSwitch.vue";

import {
  doc2data,
  isNull,
  useAdminUids,
  notFoundResponse,
  useRestaurantId,
} from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";
import { useAdminConfigToggle } from "@/utils/admin/Toggle";

import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  components: {
    OrderedInfo,
    ToggleSwitch,
    NotFound,
    AdminHeader,
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Order List",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const orders = ref<DocumentData[]>([]);
    const dayIndex = ref(0);
    const restaurantId = useRestaurantId();

    let order_detacher = () => {};

    const { ownerUid, uid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }
    const { toggle: queryIsPlacedDate, switchToggle: switchOrderQuery } =
      useAdminConfigToggle("queryIsPlacedDate", uid.value, false);

    const getPickUpDaysInAdvance = () => {
      return isNull(props.shopInfo.pickUpDaysInAdvance)
        ? 3
        : props.shopInfo.pickUpDaysInAdvance;
    };
    const pickUpDaysInAdvance = computed(() => {
      return getPickUpDaysInAdvance();
    });
    const lastSeveralDays = computed(() => {
      return Array.from(Array(10 + pickUpDaysInAdvance.value).keys()).map(
        (index) => {
          const date = midNight(pickUpDaysInAdvance.value - index);
          return { index, date };
        }
      );
    });
    dayIndex.value = getPickUpDaysInAdvance();

    const updateDayIndex = () => {
      const newDayIndex =
        lastSeveralDays.value.findIndex((day) => {
          return (
            moment(day.date).format("YYYY-MM-DD") === route.query.day
          );
        }) || 0;
      dayIndex.value = newDayIndex > 0 ? newDayIndex : 0;
    };
    const updateQueryDay = () => {
      const day = moment(lastSeveralDays.value[dayIndex.value].date).format(
        "YYYY-MM-DD"
      );
      if (route.query.day !== day) {
        router.push("/admin/restaurants/" +
          restaurantId.value +
            "/orders?day=" +
          day,
        );
      }
    };
    const dateWasUpdated = () => {
      order_detacher();
      orders.value = [];

      const queryKey = queryIsPlacedDate.value ? "orderPlacedAt" : "timePlaced";
      const queryConditions = (() => {
        const q = [
          where(queryKey, ">=", lastSeveralDays.value[dayIndex.value].date),
        ];
        if (dayIndex.value > 0) {
          q.push(
            where(queryKey, "<", lastSeveralDays.value[dayIndex.value - 1].date)
          );
        }
        return q;
      })();
      order_detacher = onSnapshot(
        query(
          collection(db, `restaurants/${restaurantId.value}/orders`),
          ...queryConditions
        ),
        (result) => {
          orders.value = result.docs
            .map(doc2data("order"))
            .filter((a) => a.status !== order_status.transaction_hide)
            .sort((order0, order1) => {
              if (order0.status === order1.status) {
                const aTime = order0.timeEstimated || order0.timePlaced;
                const bTime = order1.timeEstimated || order1.timePlaced;
                if (aTime.seconds === bTime.seconds) {
                  return order0.number > order1.number ? -1 : 1;
                }
                return aTime > bTime ? -1 : 1;
              }
              return order0.status < order1.status ? -1 : 1;
            })
            .map((order) => {
              order.timePlaced = order.timePlaced.toDate();
              if (order.timeEstimated) {
                order.timeEstimated = order.timeEstimated.toDate();
              }
              return order;
            });
        }
      );
    };

    if (route.query.day) {
      updateDayIndex();
    }
    dateWasUpdated();

    onUnmounted(() => {
      order_detacher();
    });

    const orderCounter = computed(() => {
      return lastSeveralDays.value.reduce((tmp: {[key: string]: string}, day) => {
        const count = (
          store.state.orderObj[
            moment(day.date).format("YYYY-MM-DD")
          ] || []
        ).length;
        if (count > 0) {
          tmp[moment(day.date).format("YYYY-MM-DD")] = "(" + count + ")";
        }
        return tmp;
      }, {});
    });

    watch(dayIndex, () => {
      updateQueryDay();
      dateWasUpdated();
    });
    const dayQuery = computed(() => {
      return route.query.day;
    });
    watch(dayQuery, () => {
      if (dayQuery.value) {
        updateDayIndex();
      }
    });

    watch(queryIsPlacedDate, () => {
      dateWasUpdated();
    });
    return {
      orders,
      dayIndex,
      notFound: false,

      lastSeveralDays,
      pickUpDaysInAdvance,
      orderCounter,

      queryIsPlacedDate,
      switchOrderQuery,

      updateDayIndex,

      restaurantId,
      moment,
    };
  },
});
</script>
