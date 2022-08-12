<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mt-6 mx-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="'/admin/restaurants/'"
        :showSuspend="true"
        :isInMo="isInMo"
        :moPrefix="moPrefix"
      />

      <!-- Date -->
      <div class="mx-6 mt-6">
        <b-select v-model="dayIndex">
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
        </b-select>
      </div>

      <!-- Orders -->
      <div
        class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <template v-for="order in orders">
          <router-link
            :to="'/admin/restaurants/' + restaurantId() + '/orders/' + order.id"
            :key="order.id"
          >
            <ordered-info :key="order.id" :order="order" />
          </router-link>
        </template>
      </div>

      <!-- Go to History -->
      <div class="mx-6 mt-6">
        <router-link :to="`/admin/restaurants/${restaurantId()}/history`"
          ><div
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
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

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  watch,
} from "@vue/composition-api";
import { db, firestore } from "@/plugins/firebase";
import { midNight } from "@/utils/dateUtils";
import { order_status } from "@/config/constant";
import moment from "moment";

import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import NotFound from "@/components/NotFound.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { doc2data, isNull, useAdminUids } from "@/utils/utils";
import { checkAdminPermission, checkShopAccount } from "@/utils/userPermission";

export default defineComponent({
  components: {
    OrderedInfo,
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
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const orders = ref([]);
    const dayIndex = ref(0);
    let order_detacher = () => {};

    if (!checkAdminPermission(ctx)) {
      return {
        notFound: true,
      };
    }

    const { ownerUid, uid } = useAdminUids(ctx);
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return {
        notFound: true,
      };
    }
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
            moment(day.date).format("YYYY-MM-DD") === ctx.root.$route.query.day
          );
        }) || 0;
      dayIndex.value = newDayIndex > 0 ? newDayIndex : 0;
    };
    const updateQueryDay = () => {
      const day = moment(lastSeveralDays.value[dayIndex.value].date).format(
        "YYYY-MM-DD"
      );
      if (ctx.root.$route.query.day !== day) {
        ctx.root.$router.push({
          path:
            "/admin/restaurants/" +
            ctx.root.restaurantId() +
            "/orders?day=" +
            day,
        });
      }
    };
    const dateWasUpdated = () => {
      order_detacher();

      let query = db
        .collection(`restaurants/${ctx.root.restaurantId()}/orders`)
        .where("timePlaced", ">=", lastSeveralDays.value[dayIndex.value].date);
      if (dayIndex.value > 0) {
        console.log("HOGE");
        query = query.where(
          "timePlaced",
          "<",
          lastSeveralDays.value[dayIndex.value - 1].date
        );
      }
      console.log(
        new Date(lastSeveralDays.value[dayIndex.value].date.getTime() - 1000)
      );
      console.log(
        new Date(
          lastSeveralDays.value[dayIndex.value - 1].date.getTime() + 1000
        )
      );
      order_detacher = query.onSnapshot((result) => {
        console.log(result.docs.length);
        orders.value = result.docs
          .map(doc2data("order"))
          .filter((a) => a.status !== order_status.transaction_hide)
          .sort((order0, order1) => {
            if (order0.status === order1.status) {
              return (order0.timeEstimated || order0.timePlaced) >
                (order1.timeEstimated || order1.timePlaced)
                ? -1
                : 1;
            }
            return order0.status < order1.status ? -1 : 1;
          })
          .map((order) => {
            console.log(order);
            order.timePlaced = order.timePlaced.toDate();
            if (order.timeEstimated) {
              order.timeEstimated = order.timeEstimated.toDate();
            }
            return order;
          });
      });
    };

    if (ctx.root.$route.query.day) {
      updateDayIndex();
    }
    dateWasUpdated();

    onUnmounted(() => {
      order_detacher();
    });

    const orderCounter = computed(() => {
      return lastSeveralDays.value.reduce((tmp, day) => {
        const count = (
          ctx.root.$store.state.orderObj[
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
      console.log("AAA2");
      updateQueryDay();
      dateWasUpdated();
    });
    const dayQuery = computed(() => {
      return ctx.root.$route.query.day;
    });
    watch(dayQuery, () => {
      console.log("AAA");
      updateDayIndex();
    });

    return {
      orders,
      dayIndex,
      notFound: false,

      lastSeveralDays,
      pickUpDaysInAdvance,
      dayIndex,
      orderCounter,
    };
  },
});
</script>
