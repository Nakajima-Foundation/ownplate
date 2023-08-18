<template>
  <div>
    <div v-if="notFound">
      <NotFound />
    </div>
    <div v-else>
      <!-- Header -->
      <div class="mx-6 mt-6 lg:flex lg:items-center">
        <!-- Back and Preview -->
        <div class="flex space-x-4">
          <div class="flex-shrink-0">
            <back-button url="/admin/restaurants/" />
          </div>
          <PreviewLink :shopInfo="shopInfo" />
        </div>

        <!-- Photo and Name -->
        <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
          <div class="flex items-center">
            <div class="mr-4 flex-shrink-0 rounded-full bg-black bg-opacity-10">
              <img
                :src="resizedProfileImage(shopInfo, '600')"
                class="h-9 w-9 rounded-full object-cover"
              />
            </div>
            <div class="text-base font-bold">
              {{ shopInfo.restaurantName }}
            </div>
          </div>
        </div>
      </div>

      <!-- Date -->
      <div class="mx-6 mt-6">
        <o-select v-model="monthIndex">
          <option
            v-for="day in lastSeveralMonths"
            :value="day.index"
            :key="day.index"
          >
            {{ moment(day.date).format("YYYY-MM") }}
          </option>
        </o-select>
      </div>

      <!-- Table -->
      <div class="mx-6 mt-6">
        <table class="w-full rounded-lg bg-white shadow">
          <!-- Table Header -->
          <tr>
            <th
              class="p-2 text-xs font-bold"
              v-for="(field, k) in revenueTableHeader"
              :key="k"
            >
              <div class="text-right">{{ $t("order." + field) }}</div>
            </th>
          </tr>

          <!-- Table Body -->
          <tr v-for="order in orders" :key="order.id" class="text-sm">
            <td class="p-2">
              <div class="text-right">{{ $d(order.timeConfirmed) }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ order.accounting.food.revenue }}
              </div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ order.accounting.food.tax }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ order.accounting.alcohol.revenue }}
              </div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ order.accounting.alcohol.tax }}
              </div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ order.total }}
              </div>
            </td>

            <td class="p-2">
              <div class="text-right">
                {{ order.accounting.service.revenue }}
              </div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ order.accounting.service.tax }}
              </div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ order.shippingCost || order.deliveryFee || 0 }}
              </div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ order.discountPrice || 0 }}
              </div>
            </td>

            <td class="p-2">
              <div class="text-right">{{ order.totalCharge }}</div>
            </td>
            <td class="p-2">
              <div>
                <router-link :to="orderUrl(order)">{{
                  nameOfOrder(order)
                }}</router-link>
                <a
                  v-if="order.payment"
                  :href="searchUrl(order)"
                  target="stripe"
                >
                  <i v-if="order.payment" class="fab fa-cc-stripe" />
                </a>
              </div>
            </td>
          </tr>

          <!-- Table Footer -->
          <tr class="text-sm font-bold">
            <td class="p-2">
              <div class="text-right">{{ $t("order.total") }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ total.food.revenue }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ total.food.tax }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ total.alcohol.revenue }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ total.alcohol.tax }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ total.service.revenue }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ total.service.tax }}</div>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td class="p-2">
              <div class="text-right">{{ total.totalCharge }}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Download -->
      <div class="mx-6 mt-6 text-center">
        <download-csv
          :data="tableData"
          :fields="fields"
          :fieldNames="fieldNames"
          :fileName="fileNameSummary"
        >
          <o-button class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal">save_alt</i>
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.report.download-csv") }}
              </div>
            </div>
          </o-button>
        </download-csv>
      </div>

      <!-- Report Details -->
      <div class="mx-6 mt-6 text-center">
        <report-details
          :orders="orders"
          :shopInfo="shopInfo"
          :fileName="fileNameDetail"
          buttonTitle="admin.report.download-csv-monthly-details"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { db } from "@/lib/firebase/firebase9";
import {
  query,
  collection,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import { defineComponent, ref, computed, watch, onUnmounted } from "vue";
import moment from "moment";

import BackButton from "@/components/BackButton.vue";
import DownloadCsv from "@/components/DownloadCSV.vue";
import ReportDetails from "@/app/admin/Order/ReportDetails.vue";
import PreviewLink from "@/app/admin/common/PreviewLink.vue";
import NotFound from "@/components/NotFound.vue";

import { ownPlateConfig } from "@/config/project";
import { nameOfOrder } from "@/utils/strings";
import { midNightOfMonth } from "@/utils/dateUtils";
import { revenueCSVHeader, revenueTableHeader } from "@/utils/reportUtils";
import { order_status_keys } from "@/config/constant";
import {
  useAdminUids,
  doc2data,
  arrayOrNumSum,
  notFoundResponse,
  orderTypeKey,
  resizedProfileImage,
} from "@/utils/utils";

import { order2ReportData } from "@/models/orderInfo";
import { OrderInfoData } from "@/models/orderInfo";

import { checkShopOwner } from "@/utils/userPermission";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    BackButton,
    DownloadCsv,
    ReportDetails,
    PreviewLink,
    NotFound,
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
            "Admin Report",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  setup(props) {
    const { t } = useI18n({ useScope: "global" });
    const orders = ref<OrderInfoData[]>([]);
    const total = ref({
      food: {
        revenue: 0,
        tax: 0,
      },
      alcohol: {
        revenue: 0,
        tax: 0,
      },
      service: {
        revenue: 0,
        tax: 0,
      },
      totalCharge: 0,
    });
    const monthIndex = ref(0);
    let detacher: any = null;

    const { uid } = useAdminUids();
    if (!checkShopOwner(props.shopInfo, uid.value)) {
      return notFoundResponse;
    }

    const fields = computed(() => {
      return revenueCSVHeader;
    });

    const fieldNames = computed(() => {
      return fields.value.map((field) => {
        return t(`order.${field}`);
      });
    });

    const tableData = computed(() => {
      return orders.value.map((order: OrderInfoData) => {
        return {
          date: moment(order.timeConfirmed).format("YYYY/MM/DD"),
          restaurantId: props.shopInfo.restaurantId, // mo
          shopId: props.shopInfo.shopId, // mo
          type: t("order." + orderTypeKey(order)),
          restaurantName: props.shopInfo.restaurantName,
          orderStatus: t("order.status." + order_status_keys[order.status]),
          foodRevenue: order.accounting?.food.revenue,
          foodTax: order.accounting?.food.tax,
          alcoholRevenue: order.accounting?.alcohol.revenue,
          salesTax: order.accounting?.alcohol.tax,
          productSubTotal: order.total,
          tipShort: order.accounting?.service?.revenue,
          serviceTax: order.accounting?.service?.tax,
          shippingCost: order.shippingCost || order.deliveryFee || 0,
          total: order.totalCharge,
          totalCount: Object.values(order.order).reduce((count, order) => {
            return count + arrayOrNumSum(order);
          }, 0),
          discountPrice: order.discountPrice || 0,
          beforeDiscountPrice: order.totalCharge + (order.discountPrice || 0),
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : "",
        };
      });
    });
    const lastSeveralMonths = computed(() => {
      return Array.from(Array(12).keys()).map((index) => {
        const date = midNightOfMonth(-index);
        return { index, date };
      });
    });
    const fileNameSummary = computed(() => {
      return [
        moment(lastSeveralMonths.value[monthIndex.value].date).format(
          "YYYY-MM",
        ),
        "revenue",
        props.shopInfo.restaurantId,
        "summary",
      ].join("-");
    });
    const fileNameDetail = computed(() => {
      return [
        moment(lastSeveralMonths.value[monthIndex.value].date).format(
          "YYYY-MM",
        ),
        "revenue",
        props.shopInfo.restaurantId,
        "detail",
      ].join("-");
    });

    const updateQuery = () => {
      detacher && detacher();
      let myQuery = query(
        collection(db, `restaurants/${props.shopInfo.restaurantId}/orders`),
        where(
          "timeConfirmed",
          ">=",
          lastSeveralMonths.value[monthIndex.value].date,
        ),
      );
      if (monthIndex.value > 0) {
        myQuery = query(
          myQuery,
          where(
            "timeConfirmed",
            "<",
            lastSeveralMonths.value[monthIndex.value - 1].date,
          ),
        );
      }
      detacher = onSnapshot(
        query(myQuery, orderBy("timeConfirmed")),
        (snapshot) => {
          const serviceTaxRate = props.shopInfo.alcoholTax / 100;
          orders.value = snapshot.docs
            .map((a) => doc2data("order")(a as any))
            // .map(doc2data("order")) // fix after firebase 9
            .map((order) =>
              order2ReportData(order as OrderInfoData, serviceTaxRate),
            );
          total.value = orders.value.reduce(
            (total, order) => {
              const accounting = order.accounting;
              total.food.revenue += accounting?.food?.revenue || 0;
              total.food.tax += accounting?.food?.tax || 0;
              total.alcohol.revenue += accounting?.alcohol?.revenue || 0;
              total.alcohol.tax += accounting?.alcohol?.tax || 0;
              total.service.revenue += accounting?.service?.revenue || 0;
              total.service.tax += accounting?.service?.tax || 0;
              total.totalCharge += order.totalCharge;
              return total;
            },
            {
              food: {
                revenue: 0,
                tax: 0,
              },
              alcohol: {
                revenue: 0,
                tax: 0,
              },
              service: {
                revenue: 0,
                tax: 0,
              },
              totalCharge: 0,
            },
          );
        },
      );
    };
    const orderUrl = (order: OrderInfoData) => {
      return `/admin/restaurants/${props.shopInfo.restaurantId}/orders/${order.id}`;
    };
    const searchUrl = (order: OrderInfoData) => {
      const value = encodeURIComponent(order.description || nameOfOrder(order));
      return `${ownPlateConfig.stripe.search}?query=${value}`;
    };

    updateQuery();

    onUnmounted(() => {
      detacher && detacher();
    });

    watch(monthIndex, () => {
      updateQuery();
    });
    return {
      orders,
      total,
      monthIndex,

      revenueTableHeader,

      lastSeveralMonths,
      tableData,
      fields,
      fieldNames,
      fileNameSummary,
      fileNameDetail,
      orderUrl,
      nameOfOrder,
      searchUrl,

      notFound: false,

      moment,
      resizedProfileImage,
    };
  },
});
</script>
