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
    <download-csv :data="tableData" :fields="fields" :fieldNames="fieldNames" :fileName="fileName">
      <b-button class="m-t-16 b-reset h-36 r-36 bg-form">
        <span class="p-l-16 p-r-16">
          <i class="material-icons c-primary s-18 m-r-8">save_alt</i>
          <span class="c-primary t-button">Download CSV (menu items)</span>
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
    fields() {
      return [
        "name",
        "userName",
        "phoneNumber",
        "dateConfirmed",
        "itemName",
        "category1",
        "category2",
        "count"
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
        console.log(order);
        console.log(ids);
        ids.forEach(id => {
          const menuItem = order.menuItems[id];
          items.push({
            id: `${order.id}/${id}`,
            name: nameOfOrder(order),
            dateConfirmed:
              order.timeConfirmed &&
              moment(order.timeConfirmed.toDate()).format("YYYY/MM/DD HH:MM"),
            phoneNumber: formatNational(parsePhoneNumber(order.phoneNumber)),
            userName: order.name,
            count: order.order[id],
            itemName: menuItem.itemName,
            category1: menuItem.category1 || "",
            category2: menuItem.category2 || ""
          });
        });
      });
      console.log(items);
      return items;
      /*
      return this.orders.map(order => {
        return {
          date: moment(order.timeConfirmed).format("YYYY/MM/DD"),
          foodRevenue: order.accounting.food.revenue,
          foodTax: order.accounting.food.tax,
          alcoholRevenue: order.accounting.alcohol.revenue,
          salesTax: order.accounting.alcohol.tax,
          tipShort: order.accounting.service.revenue,
          serviceTax: order.accounting.service.tax,
          total: order.totalCharge,
          name: nameOfOrder(order),
          payment: order.payment?.stripe ? "stripe" : ""
        };
      });
        */
    }
  }
};
</script>
