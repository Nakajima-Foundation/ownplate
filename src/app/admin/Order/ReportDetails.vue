<template>
  <div>
    <div v-if="!hideTable" class="pb-6">
      <table class="w-full bg-white rounded-lg shadow">
        <tr>
          <th
            v-for="(field, index) in fields"
            :key="field"
            class="p-2 text-xs font-bold"
          >
            {{ fieldNames[index] }}
          </th>
        </tr>
        <tr v-for="row in tableData" :key="row.id">
          <td v-for="field in fields" :key="field" class="p-2 text-xs">
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
      <b-button class="b-reset-tw">
        <div
          class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-lg text-op-teal mr-2">save_alt</i>
          <div class="text-sm font-bold text-op-teal">
            {{ $t("admin.report.download-csv-details") }}
          </div>
        </div>
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
  methods: {
    writeonFirstLine(index, key, text) {
      return index === 0 && Number(key) === 0 ? text : "-";
    },
    timeConvert(timeData) {
      if (!timeData) {
        return null;
      }
      if (timeData.seconds) {
        return moment(timeData.toDate()).format("YYYY/MM/DD HH:mm")
      }
      return moment(timeData).format("YYYY/MM/DD HH:mm")
    },
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

        "datePlaced",
        "dateAccepted",
        "dateConfirmed",
        "dateCompleted",
        
        "timeRequested",
        "timeToPickup",

        "itemName",
        "options",
        "category1",
        "category2",
        "count",
        "total",
        "payment",
        "memo"
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
        ids.forEach((menuId, index) => {
          const orderItems = this.forceArray(order.order[menuId]);
          const options = order.options[menuId] || [];
          Object.keys(orderItems).forEach(key => {
            console.log(options[key]);
            try {
              const menuItem = order.menuItems[menuId];
              items.push({
                id: `${order.id}/${menuId}`,
                name: nameOfOrder(order),
                timeRequested: this.writeonFirstLine(
                  index,
                  key,
                  this.timeConvert(order.timePlaced)
                ),
                timeToPickup: this.writeonFirstLine(
                  index,
                  key,
                  this.timeConvert(order.timeEstimated)
                ),
                datePlaced: this.writeonFirstLine(
                  index,
                  key,
                  this.timeConvert(order.orderPlacedAt)
                ),
                dateAccepted: this.writeonFirstLine(
                  index,
                  key,
                  this.timeConvert(order.orderAcceptedAt)
                ),
                dateConfirmed: this.writeonFirstLine(
                  index,
                  key,
                  this.timeConvert(order.timeConfirmed)
                ),
                dateCompleted: this.writeonFirstLine(
                  index,
                  key,
                  this.timeConvert(order.transactionCompletedAt)
                ),
                phoneNumber: this.writeonFirstLine(
                  index,
                  key,
                  formatNational(parsePhoneNumber(order.phoneNumber))
                ),
                userName: this.writeonFirstLine(
                  index,
                  key,
                  order.name || this.$t("order.unspecified")
                ),
                count: orderItems[key],
                options: (options[key] || [])
                  .filter(a => String(a) !== "")
                  .join("/"),
                memo: this.writeonFirstLine(index, key, order.memo),
                itemName: menuItem.itemName,
                statusName: this.writeonFirstLine(
                  index,
                  key,
                  this.$t(`order.status.${status}`)
                ),
                category1: menuItem.category1 || "",
                category2: menuItem.category2 || "",
                total:
                  index === 0 && Number(key) === 0 ? order.totalCharge : "",
                payment: order.payment?.stripe ? "stripe" : ""
              });
            } catch (e) {
              console.log(e);
              // sometime data was broken
            }
          });
        });
      });
      return items;
    }
  }
};
</script>
