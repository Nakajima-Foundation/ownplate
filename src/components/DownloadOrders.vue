<template>
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
          {{ $t("admin.report.download-csv-history") }}
        </div>
      </div>
    </o-button>
  </download-csv>
</template>

<script>
import { defineComponent, computed } from "@vue/composition-api";
import DownloadCsv from "@/components/DownloadCSV.vue";
import moment from "moment";
import { nameOfOrder } from "@/utils/strings";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";
import { order_status } from "@/config/constant";
import { arrayOrNumSum, orderTypeKey } from "@/utils/utils";
import { downloadFields, downloadMoFields } from "@/utils/reportUtils";

export default defineComponent({
  components: {
    DownloadCsv,
  },
  props: {
    orders: {
      type: Array,
      required: true,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, ctx) {
    const fields = props.isInMo ? downloadMoFields : downloadFields;
    const fieldNames = fields.map((field) => {
      return ctx.root.$t(`order.${field}`);
    });

    const tableData = computed(() => {
      return props.orders.map((order) => {
        const totalCount = Object.keys(order.order).reduce((count, id) => {
          return count + arrayOrNumSum(order.order[id]);
        }, 0);
        const status = Object.keys(order_status).reduce((result, key) => {
          if (order_status[key] == order.status) {
            return key;
          }
          return result;
        }, "unexpected");
        return {
          datePlaced: moment(order.timePlaced).format("YYYY/MM/DD HH:mm"),
          type: ctx.root.$t("order." + orderTypeKey(order, props.isInMo)),
          dateEstimated:
            order.timeEstimated &&
            moment(order.timeEstimated).format("YYYY/MM/DD HH:mm"),
          dateConfirmed:
            order.timeConfirmed &&
            moment(order.timeConfirmed).format("YYYY/MM/DD HH:mm"),
          statusName: ctx.root.$t(`order.status.${status}`),
          totalCount: totalCount,
          total: order.totalCharge,
          discountPrice: order.discountPrice || 0,
          beforeDiscountPrice: order.totalCharge + (order.discountPrice || 0),
          phoneNumber: order.phoneNumber
            ? formatNational(parsePhoneNumber(order.phoneNumber))
            : "LINE",
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : "",
          // for mo
          cancelReason: order.cancelReason,
        };
      });
    });
    const fileName = ctx.root.restaurantId() + "_orderhistory_summary.csv";
    return {
      fileName,
      fields,
      fieldNames,
      tableData,
    };
  },
});
</script>
