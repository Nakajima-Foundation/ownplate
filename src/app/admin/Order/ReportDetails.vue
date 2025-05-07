<template>
  <div>
    <div v-if="!hideTable" class="pb-6">
      <table class="w-full rounded-lg bg-white shadow-sm">
        <tr>
          <th
            v-for="(field, index) in fields"
            :key="field"
            class="p-2 text-xs font-bold"
          >
            {{ fieldNames[index] }}
          </th>
        </tr>
        <tr v-for="(row, k) in tableData" :key="k">
          <td
            v-for="field in fields"
            :key="`${row.id}_${field}`"
            class="p-2 text-xs"
          >
            {{ row[field] }}
          </td>
        </tr>
      </table>
    </div>

    <download-csv
      :data="tableData"
      :fields="fields"
      :fieldNames="fieldNames"
      :fileName="fileName"
      :formulas="formulas"
    >
      <o-button class="b-reset-tw">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">save_alt</i>
          <div class="text-sm font-bold text-op-teal">
            {{ $t(buttonTitle) }}
          </div>
        </div>
      </o-button>
    </download-csv>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { getDocs, query, collectionGroup, where } from "firebase/firestore";
import DownloadCsv from "@/components/DownloadCSV.vue";
import moment from "moment";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";
import { nameOfOrder } from "@/utils/strings";
import { order_status } from "@/config/constant";
import { arrayChunk, forceArray } from "@/utils/utils";

import { reportHeaders, reportHeadersWithAddress } from "@/utils/reportUtils";

import { OrderInfoData } from "@/models/orderInfo";
import { CustomerInfo } from "@/models/customer";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    DownloadCsv,
  },
  props: {
    orders: {
      type: Array<OrderInfoData>,
      required: true,
    },
    shopInfo: {
      type: Object,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    hideTable: {
      type: Boolean,
      required: false,
      default: false,
    },
    buttonTitle: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n({ useScope: "global" });

    const customers = ref<{ [key: string]: CustomerInfo }>({});
    const writeonFirstLine = (
      index: number,
      key: number | string,
      text: any,
    ) => {
      return index === 0 && Number(key) === 0 ? text : "-";
    };
    const timeConvert = (timeData: any) => {
      if (!timeData) {
        return null;
      }
      if (timeData.seconds) {
        return moment(timeData.toDate()).format("YYYY/MM/DD HH:mm");
      }
      return moment(timeData).format("YYYY/MM/DD HH:mm");
    };

    const orders = computed(() => {
      return props.orders;
    });
    watch(orders, () => {
      // load customer
      const ids = props.orders.map((o) => o.id);

      if (props.shopInfo.isEC || props.shopInfo.enableDelivery) {
        (async () => {
          const tmpCustomers = { ...customers.value };
          await Promise.all(
            arrayChunk(ids, 10).map(async (arr) => {
              const cuss = await getDocs(
                query(
                  collectionGroup(db, "customer"),
                  where("restaurantId", "==", props.shopInfo.restaurantId),
                  where("orderId", "in", arr),
                ),
              );
              cuss.docs.forEach((cus) => {
                const data = cus.data();
                tmpCustomers[data.orderId] = data;
              });
            }),
          );
          customers.value = tmpCustomers;
        })();
      }
    });

    const formulas = {
      count: "sum",
      total: "sum",
    };

    const fields = computed(() => {
      if (props.shopInfo?.isEC || props.shopInfo?.enableDelivery) {
        return reportHeadersWithAddress;
      }
      return reportHeaders;
    });
    const fieldNames = computed(() => {
      return fields.value.map((field) => {
        return t(`order.${field}`);
      });
    });
    const mergedOrder = computed(() => {
      return props.orders.map((o) => {
        if (customers.value[o.id]) {
          o.customerInfo = o.customerInfo || customers.value[o.id] || {};
        }
        return o;
      });
    });
    const tableData = computed(() => {
      const items: any[] = [];
      mergedOrder.value.forEach((order) => {
        const ids = Object.keys(order.order);
        const status = Object.keys(order_status).reduce((result, key) => {
          if (order_status[key] === order.status) {
            return key;
          }
          return result;
        }, "unexpected");
        ids.forEach((menuId, index) => {
          const orderItems = forceArray(order.order[menuId]);
          const options = order.options[menuId] || [];
          const prices = order.prices[menuId] || [];
          const menuItem = (order.menuItems || {})[menuId] || {};
          const taxRate = menuItem.tax === "food" ? 8 : 10;
          Object.keys(orderItems).forEach((key) => {
            const opt = Array.isArray(options[key] || [])
              ? options[key]
              : [options[key]];
            try {
              items.push({
                id: `${order.id}/${menuId}`,
                orderId: order.id,
                name: nameOfOrder(order),
                restaurantName: props.shopInfo.restaurantName,
                type: writeonFirstLine(
                  index,
                  key,
                  t("order.orderType" + order.type),
                ),
                uid: order.uid, // mo
                restaurantId: props.shopInfo.restaurantId, // mo
                shopId: props.shopInfo.shopId, // mo
                timeRequested: writeonFirstLine(
                  index,
                  key,
                  timeConvert(order.timePlaced),
                ),
                timeToPickup: writeonFirstLine(
                  index,
                  key,
                  timeConvert(order.timeEstimated),
                ),
                datePlaced: writeonFirstLine(
                  index,
                  key,
                  timeConvert(order.orderPlacedAt),
                ),
                dateAccepted: writeonFirstLine(
                  index,
                  key,
                  timeConvert(order.orderAcceptedAt),
                ),
                dateConfirmed: writeonFirstLine(
                  index,
                  key,
                  timeConvert(order.timeConfirmed),
                ),
                dateCompleted: writeonFirstLine(
                  index,
                  key,
                  timeConvert(order.transactionCompletedAt),
                ),
                phoneNumber: writeonFirstLine(
                  index,
                  key,
                  order.phoneNumber
                    ? formatNational(parsePhoneNumber(order.phoneNumber))
                    : "LINE",
                ),
                userName: writeonFirstLine(
                  index,
                  key,
                  order.name || t("order.unspecified"),
                ),
                "ec.name": writeonFirstLine(
                  index,
                  key,
                  order?.customerInfo?.name,
                ),
                "ec.zip": writeonFirstLine(
                  index,
                  key,
                  order?.customerInfo?.zip,
                ),
                "ec.prefecture": writeonFirstLine(
                  index,
                  key,
                  order?.customerInfo?.prefecture,
                ),
                "ec.address": writeonFirstLine(
                  index,
                  key,
                  order?.customerInfo?.address,
                ),
                "ec.email": writeonFirstLine(
                  index,
                  key,
                  order?.customerInfo?.email,
                ),
                shippingCost: writeonFirstLine(
                  index,
                  key,
                  order?.shippingCost || order?.deliveryFee,
                ),
                isDelivery: writeonFirstLine(
                  index,
                  key,
                  order?.isDelivery ? "1" : "",
                ),
                count: orderItems[key],
                options: opt.filter((a: string) => String(a) !== "").join("/"),
                memo: writeonFirstLine(index, key, order.memo),
                itemName: menuItem.itemName,
                statusName: writeonFirstLine(
                  index,
                  key,
                  t(`order.status.${status}`),
                ),
                category1: menuItem.category1 || "",
                category2: menuItem.category2 || "",

                categoryId: menuItem.category || "",
                subCategoryId: menuItem.subCategory || "",
                productId: menuItem.productId || "",

                // for mo
                menuPrice: menuItem.price,
                taxRate,
                tax: Math.round((menuItem.price * taxRate) / (100 + taxRate)),
                productSubTotal: prices[key],

                cancelReason: order.cancelReason,
                // end of for mo
                total: writeonFirstLine(index, key, order.totalCharge || ""),
                discountPrice: writeonFirstLine(
                  index,
                  key,
                  order.discountPrice || 0,
                ),
                beforeDiscountPrice: writeonFirstLine(
                  index,
                  key,
                  order.totalCharge + (order.discountPrice || 0),
                ),
                payment: writeonFirstLine(
                  index,
                  key,
                  order.payment?.stripe ? "stripe" : "",
                ),
              });
            } catch (e) {
              console.log(e);
              // sometime data was broken
            }
          });
        });
      });
      return items;
    });

    return {
      tableData,
      fields,
      fieldNames,
      formulas,
    };
  },
});
</script>
