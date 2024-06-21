<template>
  <div>
    <!-- Order Body Area -->
    <div class="columns is-gapless">
      <!-- Center Column -->
      <div class="column">
        <div class="ml-6 mr-4 mt-4">
          <back-button :url="backUrl" />

          <h2>All Orders</h2>
          <o-select v-model="orderState" class="mt-4">
            <option
              v-for="status in orderStatus"
              :value="status.index"
              :key="status.index"
            >
              {{ status.key ? $t("order.status." + status.key) : "----" }}
            </option>
          </o-select>
          <!-- button -->
          <div>
            <div class="mt-2 inline-flex">
              <div class="flex">
                <o-select v-model="monthValue">
                  <option v-for="(month, k) in months" :value="month" :key="k">
                    {{ month }}
                  </option>
                </o-select>
              </div>
              <div class="flex">
                <o-button @click="LoadTillMonth">Load</o-button>
                {{ isLoading ? "Loading..." : "" }}
              </div>
            </div>
          </div>

          <!-- Orders -->
          <div
            class="mx-6 mt-2 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <div v-for="order in filteredOrders" :key="order.id">
              <ordered-info
                :isSuperView="true"
                @selected="orderSelected($event)"
                :order="order"
              />
              <router-link :to="`/s/restaurants/${order.restaurantId}`">
                {{ order.restaurant.restaurantName }}
              </router-link>
            </div>
          </div>
          <div>
            <o-button @click="nextLoad" class="mt-4 rounded-full"
              >more</o-button
            >
          </div>

          <download-csv
            :data="tableData"
            :fields="fields"
            :fieldNames="fieldNames"
            :fileName="fileName"
          >
            <o-button class="mt-4 h-9 rounded-full">
              <span class="pl-4 pr-4">
                <i class="material-icons mr-2 !text-2xl text-op-teal"
                  >save_alt</i
                >
                <span class="font-bold text-op-teal">{{
                  $t("admin.report.download-csv-all")
                }}</span>
              </span>
            </o-button>
          </download-csv>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

import moment from "moment";

import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import BackButton from "@/components/BackButton.vue";
import DownloadCsv from "@/components/DownloadCSV.vue";

import { order_status, order_status_keys } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { arrayOrNumSum } from "@/utils/utils";

import { getBackUrl, superPermissionCheck } from "@/utils/utils";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { OrderInfoData } from "@/models/orderInfo";

import { db } from "@/lib/firebase/firebase9";
import {
  query,
  limit,
  orderBy,
  startAfter,
  getDocs,
  getDoc,
  doc,
  collectionGroup,
} from "firebase/firestore";

export default defineComponent({
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Orders"].join(" / "),
    };
  },
  components: {
    OrderedInfo,
    DownloadCsv,
    BackButton,
  },
  setup() {
    const { t } = useI18n({ useScope: "global" });
    const router = useRouter();
    superPermissionCheck();

    const months = [0, 1, 2, 3, 4, 5].map((a) => {
      return moment().subtract(a, "month").format("YYYY-MM");
    });

    const orders = ref<OrderInfoData[]>([]);
    const orderState = ref(0);
    const monthValue = ref(months[0]);
    const isLoading = ref(false);
    const last = ref<any | null>(null);
    const restaurants = ref<{ [key: string]: RestaurantInfoData }>({});

    const orderStatus = (() => {
      return Object.keys(order_status).map((key) => {
        return {
          index: order_status[key],
          key: key === "error" ? "" : key,
        };
      });
    })();
    const filteredOrders = computed(() => {
      return orders.value.filter((order) => {
        if (orderState.value === 0) {
          return true;
        }
        return order.status === orderState.value;
      });
    });

    const loadData = async () => {
      if (!isLoading.value) {
        isLoading.value = true;
        let myQuery = query(
          collectionGroup(db, "orders"),
          orderBy("timePlaced", "desc"),
          limit(100),
        );
        if (last.value) {
          myQuery = query(myQuery, startAfter(last.value));
        }
        const snapshot = await getDocs(myQuery);

        if (!snapshot.empty) {
          last.value = snapshot.docs[snapshot.docs.length - 1];
          let i = 0;
          for (; i < snapshot.docs.length; i++) {
            const myDoc = snapshot.docs[i];
            const order = myDoc.data() as OrderInfoData;
            order.restaurantId = myDoc.ref.path.split("/")[1];
            order.id = myDoc.id;
            // @ts-ignore
            order.timePlaced = order.timePlaced.toDate();
            if (!restaurants.value[order.restaurantId]) {
              const snapshot = await getDoc(
                doc(db, `restaurants/${order.restaurantId}`),
              );
              restaurants.value[order.restaurantId] =
                snapshot.data() as RestaurantInfoData;
            }
            order.restaurant = restaurants.value[order.restaurantId];
            if (order.timeEstimated) {
              // @ts-ignore
              order.timeEstimated = order.timeEstimated.toDate();
            }
            orders.value.push(order);
          }
        } else {
          last.value = null;
        }
      }
      isLoading.value = false;
    };
    const nextLoad = () => {
      if (last.value) {
        loadData();
      }
    };
    const LoadTillMonth = async () => {
      if (isLoading.value) {
        return;
      }
      const limit = moment(monthValue.value + "-01 00:00:00+09:00");

      while (
        moment(orders.value[orders.value.length - 1]?.timeCreated?.toDate()) >
        limit
      ) {
        await loadData();
        console.log(orders.value.length);
      }
    };
    loadData();

    const orderSelected = (order: OrderInfoData) => {
      // We are re-using the restaurant owner's view.
      router.push({
        path:
          "/admin/restaurants/" + order.restaurantId + "/orders/" + order.id,
      });
    };

    const fileName = "super-all-orders";

    const fields = [
      "date",
      "restaurantName",
      "orderStatus",
      "total",
      "revenue",
      "name",
      "payment",
    ];
    const fieldNames = fields.map((field) => {
      return t(`order.${field}`);
    });

    const tableData = computed(() => {
      return filteredOrders.value.map((order) => {
        const time = order.timeEstimated || order.timePlaced;
        return {
          date: time ? moment(time).format("YYYY/MM/DD") : "",
          restaurantName: order.restaurant.restaurantName,
          orderStatus: t("order.status." + order_status_keys[order.status]),
          revenue: order.totalCharge,
          total: Object.values(order.order).reduce((count, order) => {
            return count + arrayOrNumSum(order);
          }, 0),
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : "",
        };
      });
    });

    return {
      orders,
      orderState,
      monthValue,
      isLoading,
      last,
      restaurants,
      months,

      orderStatus,
      filteredOrders,

      fieldNames,
      tableData,
      fields,
      fileName,

      orderSelected,
      nextLoad,
      LoadTillMonth,
      backUrl: getBackUrl(),
    };
  },
});
</script>
