<template>
  <download-csv
    :data="tableData"
    :fields="fields"
    :fieldNames="fieldNames"
    :fileName="$t('order.history')"
  >
    <b-button class="b-reset-tw">
      <div
        class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons text-lg text-op-teal mr-2">save_alt</i>
        <div class="text-sm font-bold text-op-teal">
          {{ $t("admin.report.download-csv") }}
        </div>
      </div>
    </b-button>
  </download-csv>
</template>

<script>
import DownloadCsv from "~/components/DownloadCSV";
import moment from "moment";
import { nameOfOrder } from "~/utils/strings";
import { parsePhoneNumber, formatNational } from "~/utils/phoneutil";
import { order_status } from "~/config/constant";

export default {
  components: {
    DownloadCsv,
  },
  props: {
    orders: {
      type: Array,
      required: true,
    },
  },
  computed: {
    fields() {
      return [
        "datePlaced",
        "dateEstimated",
        "dateConfirmed",
        "statusName",
        "totalCount",
        "total",
        "phoneNumber",
        "name",
        "payment",
      ];
    },
    fieldNames() {
      return this.fields.map((field) => {
        return this.$t(`order.${field}`);
      });
    },
    tableData() {
      return this.orders.map((order) => {
        const totalCount = Object.keys(order.order).reduce((count, id) => {
          return count + this.arrayOrNumSum(order.order[id]);
        }, 0);
        const status = Object.keys(order_status).reduce((result, key) => {
          if (order_status[key] == order.status) {
            return key;
          }
          return result;
        }, "unexpected");
        return {
          datePlaced: moment(order.timePlaced).format("YYYY/MM/DD HH:mm"),
          dateEstimated:
            order.timeEstimated &&
            moment(order.timeEstimated).format("YYYY/MM/DD HH:mm"),
          dateConfirmed:
            order.timeConfirmed &&
            moment(order.timeConfirmed).format("YYYY/MM/DD HH:mm"),
          statusName: this.$t(`order.status.${status}`),
          totalCount: totalCount,
          total: order.totalCharge,
          phoneNumber: order.phoneNumber
            ? formatNational(parsePhoneNumber(order.phoneNumber))
            : "LINE",
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : "",
        };
      });
    },
  },
};
</script>
