<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <div class="mx-6 mt-6 lg:flex lg:items-center">
        <!-- Back and Preview -->
        <div class="flex space-x-4">
          <back-button url="/admin/restaurants/" />
        </div>

        <!-- Title -->
        <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
          <span class="text-base font-bold">
            {{ $t("order.allOrders") }}
          </span>
        </div>
      </div>

      <!-- Order Status -->
      <div class="mx-6 mt-6">
        <o-select v-model="orderState">
          <option
            v-for="status in orderStatus"
            :value="status.index"
            :key="status.index"
          >
            {{ status.key ? $t("order.status." + status.key) : "----" }}
          </option>
        </o-select>
      </div>

      <!-- Orders -->
      <div
        class="mx-6 mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <ordered-info
          v-for="order in filteredOrders"
          :key="order.id"
          :isSuperView="true"
          @selected="orderSelected($event)"
          :order="order"
          :isInMo="isInMo"
        />
      </div>

      <!-- More -->
      <div class="mx-6 mt-6 text-center">
        <o-button @click="nextLoad" class="b-reset-tw">
          <div
            class="inline-flex h-9 w-48 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.more") }}
            </div>
          </div>
        </o-button>
      </div>

      <!-- Download -->
      <div class="mx-6 mt-6 text-center">
        <download-csv
          :data="tableData"
          :fields="fields"
          :fieldNames="fieldNames"
          :fileName="fileName"
        >
          <o-button class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal">save_alt</i>
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.report.download-csv-all") }}
              </div>
            </div>
          </o-button>
        </download-csv>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "@vue/composition-api";

import moment from "moment-timezone";

import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
  getDocs,
  collectionGroup,
  query,
  where,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore";

import { order_status, order_status_keys } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { revenueCSVHeader, revenueMoCSVHeader } from "@/utils/reportUtils";
import { order2ReportData } from "@/models/orderInfo";
import {
  arrayOrNumSum,
  useAdminUids,
  notFoundResponse,
  orderTypeKey,
} from "@/utils/utils";

import DownloadCsv from "@/components/DownloadCSV.vue";
import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import BackButton from "@/components/BackButton.vue";
import NotFound from "@/components/NotFound.vue";

export default defineComponent({
  components: {
    OrderedInfo,
    DownloadCsv,
    BackButton,
    NotFound,
  },
  props: {
    isInMo: {
      type: Boolean,
      required: true,
    },
  },
  metaInfo() {
    return {
      title: ["Admin All Order", this.defaultTitle].join(" / "),
    };
  },
  setup(props, ctx) {
    const { uid, isOwner } = useAdminUids(ctx);

    const orders = ref([]);
    const orderState = ref(0);
    const restaurants = {};

    let isLoading = false;
    let last = null;

    if (!isOwner.value) {
      return notFoundResponse;
    }

    const orderStatus = computed(() => {
      return [
        {
          index: 0,
          key: "all",
        },
        ...Object.keys(order_status)
          .filter((key) => {
            return [
              "order_placed", // by user and stripe
              "order_accepted", // by restaurant
              "ready_to_pickup", // by restaurant and stripe
              "transaction_complete", // by restaurant (optional)
              "order_canceled", // by restaurant or user
            ].includes(key);
          })
          .map((key) => {
            return {
              index: order_status[key],
              key: key === "error" ? "" : key,
            };
          }),
      ];
    });
    const filteredOrders = computed(() => {
      return orders.value.filter((order) => {
        if (orderState.value === 0) {
          return true;
        }
        return order.status === orderState.value;
      });
    });
    const fileName = "all_orders_of_all_restaurants";
    const fields = computed(() => {
      return props.isInMo ? revenueMoCSVHeader : revenueCSVHeader;
    });

    const fieldNames = fields.value.map((field) => {
      return ctx.root.$t(`order.${field}`);
    });
    const tableData = computed(() => {
      return filteredOrders.value.map((order) => {
        const time = order.timeEstimated || order.timePlaced;
        return {
          date: time ? moment(time).format("YYYY/MM/DD") : "",
          restaurantId: order.restaurant.restaurantId, // mo
          shopId: order.restaurant.shopId, // mo
          type: ctx.root.$t("order." + orderTypeKey(order, props.isInMo)),
          restaurantName: order.restaurant.restaurantName,
          orderStatus: ctx.root.$t(
            "order.status." + order_status_keys[order.status]
          ),
          foodRevenue: order.accounting.food.revenue,
          foodTax: order.accounting.food.tax,
          alcoholRevenue: order.accounting.alcohol.revenue,
          salesTax: order.accounting.alcohol.tax,
          productSubTotal: order.total,
          tipShort: order.accounting.service.revenue,
          serviceTax: order.accounting.service.tax,
          shippingCost: order.shippingCost || order.deliveryFee || 0,
          total: order.totalCharge,
          totalCount: Object.values(order.order).reduce((count, order) => {
            return count + arrayOrNumSum(order);
          }, 0),
          discountPrice: order.discountPrice,
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : "",
          cancelReason: order.cancelReason,
        };
      });
    });

    const loadData = async () => {
      if (!isLoading) {
        isLoading = true;
        const queryConditions = [
          where("ownerUid", "==", uid.value),
          orderBy("timePlaced", "desc"),
          limit(100),
        ];
        if (last) {
          queryConditions.push(startAfter(last));
        }
        const snapshot = await getDocs(
          query(collectionGroup(db, "orders"), ...queryConditions)
        );
        const serviceTaxRate = 0.1;
        if (!snapshot.empty) {
          last = snapshot.docs[snapshot.docs.length - 1];
          let i = 0;
          for (; i < snapshot.docs.length; i++) {
            const orderDoc = snapshot.docs[i];
            const order = order2ReportData(
              orderDoc.data(),
              serviceTaxRate,
              props.isInMo
            );
            order.restaurantId = orderDoc.ref.path.split("/")[1];
            order.id = orderDoc.id;
            if (!restaurants[order.restaurantId]) {
              const snapshot = await getDoc(
                doc(db, `restaurants/${order.restaurantId}`)
              );
              restaurants[order.restaurantId] = snapshot.data();
            }
            order.restaurant = restaurants[order.restaurantId];
            orders.value.push(order);
          }
        } else {
          last = null;
        }
      }
      isLoading = false;
    };

    loadData();

    const nextLoad = () => {
      if (last) {
        loadData();
      }
    };
    const orderSelected = (order) => {
      // We are re-using the restaurant owner's view.
      ctx.root.$router.push({
        path:
          "/admin/restaurants/" + order.restaurantId + "/orders/" + order.id,
      });
    };

    return {
      orders,
      orderState,

      orderStatus,

      filteredOrders,

      fileName,

      fields,
      fieldNames,

      nextLoad,
      tableData,

      orderSelected,
      notFound: false,
    };
  },
});
</script>
