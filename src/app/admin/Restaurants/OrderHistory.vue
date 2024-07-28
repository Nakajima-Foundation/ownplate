<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-4 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="'/admin/restaurants/#restaurant_' + restaurantId"
        :showSuspend="true"
        pageText="orderHistory"
      />

      <div class="sm:flex">
        <!-- filter -->
        <div class="mx-6 mt-4 grid grid-cols-1 gap-2">
          <div class="text-sm font-bold text-black text-opacity-30">
            {{ $t("order.statusTitle") }}
          </div>
          <o-select v-model="orderState">
            <option
              v-for="status in orderStatus"
              :value="status.index"
              :key="status.index"
            >
              {{
                status.key
                  ? $t("order.status." + status.key)
                  : $t("order.status.all")
              }}
            </option>
          </o-select>
        </div>
        <!-- sort -->
        <div class="mx-6 mt-2 grid grid-cols-1 gap-2 sm:mt-4">
          <div class="text-sm font-bold text-black text-opacity-30">
            {{ $t("order.sortOrder") }}
          </div>
          <o-select v-model="sortOrder">
            <option
              v-for="status in orderSorts"
              :value="status.index"
              :key="status.index"
            >
              {{ $t("order.sort." + status.key) }}
            </option>
          </o-select>
        </div>
      </div>

      <!-- Orders -->
      <div
        class="mx-6 mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <template v-for="order in filteredOrders" :key="order.id">
          <router-link
            :to="'/admin/restaurants/' + restaurantId + '/orders/' + order.id"
          >
            <ordered-info :order="order" :isSuperView="true" />
          </router-link>
        </template>
      </div>

      <!-- More -->
      <div class="mx-6 mt-2 text-center" v-if="last !== undefined">
        <o-button :disabled="last === null" @click="next" class="b-reset-tw">
          <div
            class="inline-flex h-9 w-48 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.more") }}
            </div>
          </div>
        </o-button>
      </div>

      <!-- More -->
      <div class="mx-6 mt-2 text-center" v-if="last !== undefined">
        <o-button :disabled="last === null" @click="all" class="b-reset-tw">
          <div
            class="inline-flex h-9 w-48 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.all") }}
            </div>
          </div>
        </o-button>
      </div>

      <div v-if="isOwner">
        <!-- Download Orders -->
        <div class="mx-6 mt-2 text-center">
          <download-orders :orders="filteredOrders" />
        </div>

        <!-- Download Report -->
        <div class="mx-6 mt-2 text-center">
          <report-details
            :orders="filteredOrders"
            :fileName="fileName"
            :hideTable="true"
            :withStatus="true"
            :shopInfo="shopInfo"
            buttonTitle="admin.report.download-csv-history-details"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  getDocs,
  collectionGroup,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { order_status, order_status_for_form } from "@/config/constant";

import NotFound from "@/components/NotFound.vue";
import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import DownloadOrders from "@/components/DownloadOrders.vue";
import ReportDetails from "@/app/admin/Order/ReportDetails.vue";

import AdminHeader from "@/app/admin/AdminHeader.vue";

import {
  arrayChunk,
  useAdminUids,
  doc2data,
  notFoundResponse,
  orderType,
  useRestaurantId,
  defaultTitle,
} from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";

export default defineComponent({
  components: {
    NotFound,
    OrderedInfo,
    DownloadOrders,
    ReportDetails,
    AdminHeader,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Order History",
            this.shopInfo.restaurantName,
            defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  setup(props) {
    const limitNum = 60;
    const last = ref<QueryDocumentSnapshot<DocumentData> | null>(null);
    const orders = ref<any[]>([]);
    const notFound = ref(null);

    const orderState = ref(0);
    const orderStatus = Object.keys(order_status_for_form).map((key) => {
      return {
        index: order_status[key],
        key: key === "error" ? "" : key,
      };
    });
    const sortOrder = ref(0);
    const orderSorts = [
      {
        index: 0,
        key: "newest",
      },
      {
        index: 1,
        key: "oldest",
      },
    ];

    const { isOwner, ownerUid } = useAdminUids();

    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }

    const restaurantId = useRestaurantId();
    const fileName = props.shopInfo.restaurantId + "_orderhistory_detail";

    const next = async () => {
      let dbQuery = query(
        collection(db, `restaurants/${restaurantId.value}/orders`),
        orderBy("timePlaced", "desc"),
        limit(limitNum),
      );
      if (last.value) {
        dbQuery = query(dbQuery, startAfter(last.value));
      }
      const docs = (await getDocs(dbQuery)).docs;
      last.value = docs.length == limitNum ? docs[limitNum - 1] : null;
      const tmpOrders = docs
        .map(doc2data("order"))
        .filter((a) => a.status !== order_status.transaction_hide);
      const customers: { [key: string]: any } = {};
      if (props.shopInfo.isEC || props.shopInfo.enableDelivery) {
        const ids = tmpOrders.map((order) => order.id);
        await Promise.all(
          arrayChunk(ids, 10).map(async (arr) => {
            try {
              const cuss = await getDocs(
                query(
                  collectionGroup(db, "customer"),
                  where("restaurantId", "==", restaurantId.value),
                  where("orderId", "in", arr),
                ),
              );
              cuss.docs.map((cus) => {
                const data = cus.data();
                customers[data.orderId] = data;
              });
            } catch (e) {
              console.log(e);
            }
          }),
        );
      }

      tmpOrders.forEach((order: any) => {
        order.customerInfo = order.customerInfo || customers[order.id] || {};
        order.timePlaced = order.timePlaced.toDate();
        if (order.timeEstimated) {
          order.timeEstimated = order.timeEstimated.toDate();
        }
        if (order.timeConfirmed) {
          order.timeConfirmed = order.timeConfirmed.toDate();
        }
        order.type = orderType(order);
        orders.value.push(order);
      });
    };
    const all = async () => {
      while (last.value) {
        await next();
      }
    };
    next();

    const filteredOrders = computed(() => {
      return orders.value
        .filter((order) => {
          if (orderState.value === 0) {
            return true;
          }
          return order.status === orderState.value;
        })
        .sort(
          (a: any, b: any) =>
            (a.timePlaced > b.timePlaced ? -1 : 1) *
            (sortOrder.value === 0 ? 1 : -1),
        );
    });

    return {
      last,
      orders,
      filteredOrders,

      notFound,
      isOwner,
      fileName,
      // methods
      next,
      all,

      orderStatus,
      orderState,

      sortOrder,
      orderSorts,

      restaurantId,
    };
  },
});
</script>
