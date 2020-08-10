<template>
  <download-csv :data="tableData" :fields="fields" :fieldNames="fieldNames" :fileName="'foo'">
    <b-button class="m-t-16 b-reset h-36 r-36 bg-form">
      <span class="p-l-16 p-r-16">
        <i class="material-icons c-primary s-18 m-r-8">save_alt</i>
        <span class="c-primary t-button">Download CSV</span>
      </span>
    </b-button>
  </download-csv>
</template>

<script>
import DownloadCsv from "~/components/DownloadCSV";
import moment from "moment";
import { nameOfOrder } from "~/plugins/strings.js";
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";

export default {
  components: {
    DownloadCsv
  },
  props: {
    orders: {
      type: Array,
      required: true
    }
  },
  computed: {
    fields() {
      return [
        "date",
        "status",
        "totalCount",
        /*
        "foodRevenue",
        "foodTax",
        "alcoholRevenue",
        "salesTax",
        "tipShort",
        "serviceTax",
        */
        "total",
        "phoneNumber",
        "name",
        "payment"
      ];
    },
    fieldNames() {
      return this.fields.map(field => {
        return this.$t(`order.${field}`);
      });
    },
    tableData() {
      return this.orders.map(order => {
        console.log(order);
        const totalCount = Object.keys(order.order).reduce((count, id) => {
          return count + order.order[id];
        }, 0);
        return {
          date: moment(order.timePlaced).format("YYYY/MM/DD HH:MM"),
          status: order.status,
          totalCount: totalCount,
          /*
          foodRevenue: order.accounting.food.revenue,
          foodTax: order.accounting.food.tax,
          alcoholRevenue: order.accounting.alcohol.revenue,
          salesTax: order.accounting.alcohol.tax,
          tipShort: order.accounting.service.revenue,
          serviceTax: order.accounting.service.tax,
          */
          total: order.totalCharge,
          phoneNumber: formatNational(parsePhoneNumber(order.phoneNumber)),
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : ""
        };
      });
    }
  }
};
</script>
