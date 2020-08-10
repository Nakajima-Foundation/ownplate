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
        "foodRevenue",
        "foodTax",
        "alcoholRevenue",
        "salesTax",
        "tipShort",
        "serviceTax",
        "total",
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
        return {
          date: moment(order.timeConfirmed).format("YYYY/MM/DD"),
          /*
          foodRevenue: order.accounting.food.revenue,
          foodTax: order.accounting.food.tax,
          alcoholRevenue: order.accounting.alcohol.revenue,
          salesTax: order.accounting.alcohol.tax,
          tipShort: order.accounting.service.revenue,
          serviceTax: order.accounting.service.tax,
          */
          total: order.totalCharge,
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : ""
        };
      });
    }
  }
};
</script>
