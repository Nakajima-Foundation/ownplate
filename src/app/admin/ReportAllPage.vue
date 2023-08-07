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
        </div>
      </div>

      <!-- Date -->
      <div class="mx-6 mt-6 w-48">
        期間
        <div class="flex">
          <o-input
            v-model="formValue.date1"
            type="date"
            placeholder="年月日"
            class="w-3/8 bg-warmgray-900 rounded-md border-0 bg-opacity-5 focus:ring-2 focus:ring-rose-600 focus:ring-opacity-20"
          />
          〜
          <o-input
            v-model="formValue.date2"
            type="date"
            placeholder="年月日"
            class="w-3/8 bg-warmgray-900 rounded-md border-0 bg-opacity-5 focus:ring-2 focus:ring-rose-600 focus:ring-opacity-20"
          />
        </div>

        <div class="mt-4 flex">
          <o-select v-model="formValue.queryKey">
            <option v-for="status in queryKeys" :value="status" :key="status">
              {{ $t("mobileOrder.reportKeys." + status) }}
            </option>
          </o-select>

          <o-button @click="load" class="ml-4">
            <div>load</div>
          </o-button>
        </div>
      </div>

      <!-- Table -->
      <div class="mx-6 mt-6">
        <table class="w-full rounded-lg bg-white shadow">
          <!-- Table Header -->
          <tr>
            <th
              class="p-2 text-xs font-bold"
              v-for="(field, k) in revenueTableHeader"
            >
              <div class="text-right">{{ $t("order." + field) }}</div>
            </th>
          </tr>

          <!-- Table Body -->
          <tr v-for="order in orders" :key="order.id" class="text-sm">
            <td class="p-2">
              <div class="text-right">{{ $d(order.date) }}</div>
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
                {{ order.discountPrice || 0  }}
              </div>
            </td>
            <td class="p-2">
              <div class="text-right">{{ order.totalCharge }}</div>
            </td>
            <td class="p-2">
              <div class="text-right">
                {{ nameOfOrder(order) }}
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
          <button class="b-reset-tw">
            <div
              class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons mr-2 text-lg text-op-teal">save_alt</i>
              <div class="text-sm font-bold text-op-teal">
                {{ $t("admin.report.download-csv") }}
              </div>
            </div>
          </button>
        </download-csv>
      </div>

      <!-- Report Details -->
      <div class="mx-6 mt-6 text-center">
        <report-details
          :orders="orders"
          :shopObj="restaurants"
          :fileName="fileNameDetail"
          :isInMo="isInMo"
          :categoryDataObj="categoryDataObj"
          :allSubCategoryDataObj="allSubCategoryDataObj"
          buttonTitle="admin.report.download-csv-monthly-details"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDocs,
  collection,
  collectionGroup,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import {
  defineComponent,
  ref,
  reactive,
  computed,
  watch,
} from "vue";
import moment from "moment-timezone";

import BackButton from "@/components/BackButton.vue";
import DownloadCsv from "@/components/DownloadCSV.vue";
import ReportDetails from "@/app/admin/Order/ReportAllDetails.vue";
import NotFound from "@/components/NotFound.vue";

import { ownPlateConfig } from "@/config/project";
import { nameOfOrder } from "@/utils/strings";
import { midNightOfMonth } from "@/utils/dateUtils";
import {
  revenueCSVHeader,
  revenueMoAllCSVHeader,
  revenueTableHeader,
} from "@/utils/reportUtils";
import { order_status_keys } from "@/config/constant";
import {
  useAdminUids,
  doc2data,
  arrayOrNumSum,
  notFoundResponse,
  orderTypeKey,
} from "@/utils/utils";

import { order2ReportData, OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { checkShopOwner } from "@/utils/userPermission";
import { useCategory, useAllSubcategory } from "@/app/user/Restaurant/Utils";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    BackButton,
    DownloadCsv,
    ReportDetails,
    NotFound,
  },
  props: {
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
  },
  metaInfo() {
    return {
      title: ["Admin Report", this.defaultTitle].join(" / "),
    };
  },
  setup(props) {
    const orders = ref<OrderInfoData[]>([]);
    const restaurants = ref<{[key: string]: RestaurantInfoData }>({});
    const { t } = useI18n({ useScope: 'global' });

    const formValue = reactive({
      date1: moment().subtract(10, "days").format("YYYY-MM-DD"),
      date2: moment().format("YYYY-MM-DD"),
      queryKey: "orderPlacedAt",
    });

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

    const { uid, isOwner, ownerUid } = useAdminUids();
    if (!isOwner.value) {
      return notFoundResponse;
    }

    const fields = computed(() => {
      return props.isInMo ? revenueMoAllCSVHeader : revenueCSVHeader;
    });

    const fieldNames = computed(() => {
      return fields.value.map((field) => {
        if (props.isInMo && field === "restaurantName") {
          return t("order.storeName");
        }
        return t(`order.${field}`);
      });
    });

    const { loadCategory, categoryDataObj } = useCategory(props.moPrefix || "");
    const { allSubCategoryDataObj, loadAllSubcategory } = useAllSubcategory(
      props.moPrefix || ""
    );
    if (props.isInMo) {
      loadCategory();
      loadAllSubcategory();
    }

    const tableData = computed(() => {
      return orders.value.map((order) => {
        const shopInfo = restaurants.value[order.restaurantId] || {};
        // @ts-ignore
        const date = order[formValue.queryKey]?.toDate
        // @ts-ignore
          ? order[formValue.queryKey]?.toDate()
        // @ts-ignore
          : order[formValue.queryKey];
        return {
          date: moment(date).format("YYYY/MM/DD"),
          restaurantId: order.restaurantId, // mo
          shopId: shopInfo.shopId, // mo
          type: t("order." + orderTypeKey(order)),
          restaurantName: shopInfo.restaurantName,
          orderStatus: t(
            "order.status." + order_status_keys[order.status]
          ),
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
          paymentCancel: !!order.uidPaymentCanceledBy, // for mo
          cancelReason: order.cancelReason,
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
          "YYYY-MM"
        ),
        "revenue",
        "summary",
      ].join("-");
    });
    const fileNameDetail = computed(() => {
      return [
        moment(lastSeveralMonths.value[monthIndex.value].date).format(
          "YYYY-MM"
        ),
        "revenue",
        "detail",
      ].join("-");
    });

    getDocs(
      query(
        collection(db, "restaurants"),
        where("uid", "==", ownerUid.value),
        where("deletedFlag", "==", false),
      )
    ).then((collect) => {
        restaurants.value = collect.docs.reduce((tmp: {[key: string]: RestaurantInfoData }, rest) => {
          tmp[rest.id] = rest.data() as RestaurantInfoData;
          return tmp;
        }, {});
      });

    const queryKeys = [
      "orderPlacedAt",
      "orderAcceptedAt",
      "timeConfirmed",
      "transactionCompletedAt",
    ];
    // 注文、受付、準備完了、受け渡し完了
    // "orderPlacedAt", 注文時刻	  1
    // "orderAcceptedAt", 注文受付時刻 2
    // "timeConfirmed", 	準備完了時刻 3
    // "transactionCompletedAt", 	受渡完了時刻 4
    // const key = "timeConfirmed";

    const key = "orderPlacedAt";

    const momentMin = computed(() => {
      const min =
        formValue.date1 > formValue.date2 ? formValue.date2 : formValue.date1;
      return moment(min + "T00:00:00+09:00").tz("Asia/Tokyo");
    });
    const momentMax = computed(() => {
      const max =
        formValue.date1 > formValue.date2 ? formValue.date1 : formValue.date2;
      return moment(max + "T23:59:50+09:00").tz("Asia/Tokyo");
    });

    const updateQuery = async () => {
      const key = formValue.queryKey;
      const myQuery = query(
        collectionGroup(db, "orders"),
        where("ownerUid", "==", uid.value),
        where(key, ">=", momentMin.value.toDate()),
        where(key, "<", momentMax.value.toDate()),
        orderBy(key)
      );
      const snapshot = await getDocs(myQuery);
      const serviceTaxRate = 0.1;

      orders.value = snapshot.docs
        .map((order) => {
          const restaurantId = order.ref.parent.parent?.id;
          const data = doc2data("order")(order);
          const date = data[formValue.queryKey]?.toDate();
          return {
            ...data,
            restaurantId,
            date,
          } as any;
        })
        .map((order) => {
          return order2ReportData(order, serviceTaxRate, props.isInMo);
        });
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
        }
      );
    };

    updateQuery();

    //watch(formValue, () => {
    //updateQuery();
    // });
    const load = () => {
      updateQuery();
    };
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
      nameOfOrder,

      categoryDataObj,
      allSubCategoryDataObj,

      notFound: false,
      restaurants,

      formValue,
      queryKeys,
      load,
    };
  },
});
</script>
