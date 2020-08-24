<template>
  <div>
    <div v-if="!hideTable" class="m-t-24 bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16">
      <table class="w-full">
        <tr>
          <th
            class="p-l-8 p-b-8"
            v-for="(field, index) in fields"
            :key="field"
          >{{ fieldNames[index] }}</th>
        </tr>
        <tr v-for="row in tableData" :key="row.id">
          <td v-for="field in fields" :key="field">{{ row[field ]}}</td>
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
      <b-button class="m-t-16 b-reset h-36 r-36 bg-form">
        <span class="p-l-16 p-r-16">
          <i class="material-icons c-primary s-18 m-r-8">save_alt</i>
          <span class="c-primary t-button">Download CSV (details)</span>
        </span>
      </b-button>
    </download-csv>
  </div>
</template>

<script>
import DownloadCsv from "~/components/DownloadCSV";
import moment from "moment";
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";
import { nameOfOrder } from "~/plugins/strings.js";
import { order_status } from "~/plugins/constant.js";

export default {
  components: {
    DownloadCsv
  },
  props: {
    orders: {
      type: Array,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    hideTable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  mounted() {
    //console.log("***", this.orders);
  },
  computed: {
    formulas() {
      return {
        count: "sum",
        total: "sum"
      };
    },
    fields() {
      return [
        "name",
        "statusName",
        "userName",
        "phoneNumber",
        "timeRequested",
        "dateConfirmed",
        "itemName",
        "category1",
        "category2",
        "count",
        "total",
        "payment"
      ];
    },
    fieldNames() {
      return this.fields.map(field => {
        return this.$t(`order.${field}`);
      });
    },
    tableData() {
      const items = [];
      this.orders.forEach(order => {
        const ids = Object.keys(order.order);
        const status = Object.keys(order_status).reduce((result, key) => {
          if (order_status[key] == order.status) {
            return key;
          }
          return result;
        }, "unexpected");
        ids.forEach((id, index) => {
          const menuItem = order.menuItems[id];
          items.push({
            id: `${order.id}/${id}`,
            name: nameOfOrder(order),
            timeRequested:
              order.timePlaced &&
              moment(order.timePlaced).format("YYYY/MM/DD HH:mm"),
            dateConfirmed:
              order.timeConfirmed &&
              moment(order.timeConfirmed).format("YYYY/MM/DD HH:mm"),
            phoneNumber: formatNational(parsePhoneNumber(order.phoneNumber)),
            userName: order.name || this.$t("order.unspecified"),
            count: order.order[id],
            itemName: menuItem.itemName,
            statusName: this.$t(`order.status.${status}`),
            category1: menuItem.category1 || "",
            category2: menuItem.category2 || "",
            total: index === 0 ? order.totalCharge : "",
            payment: order.payment?.stripe ? "stripe" : ""
          });
        });
      });
      //console.log(items);
      return items;
    }
  }
};
</script>
