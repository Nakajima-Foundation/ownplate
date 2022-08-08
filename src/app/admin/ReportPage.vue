<template>
  <div>
    <!-- Header -->
    <div class="mt-6 mx-6 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="flex-shrink-0">
          <back-button url="/admin/restaurants/" />
        </div>
        <div class="flex-shrink-0">
          <router-link :to="'/r/' + restaurantId()">
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2">launch</i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.viewPage")
              }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Photo and Name -->
      <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
        <div class="flex items-center">
          <div class="flex-shrink-0 rounded-full bg-black bg-opacity-10 mr-4">
            <img
              :src="resizedProfileImage(shopInfo, '600')"
              class="w-9 h-9 rounded-full object-cover"
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
      <b-select v-model="monthIndex">
        <option
          v-for="day in lastSeveralMonths"
          :value="day.index"
          :key="day.index"
        >
          {{ moment(day.date).format("YYYY-MM") }}
        </option>
      </b-select>
    </div>

    <!-- Table -->
    <div class="mx-6 mt-6">
      <table class="w-full bg-white rounded-lg shadow">
        <!-- Table Header -->
        <tr>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.date") }}</div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.foodRevenue") }}</div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.foodTax") }}</div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">
              {{ $t("order.alcoholRevenue") }}
            </div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.salesTax") }}</div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.tipShort") }}</div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.salesTax") }}</div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.total") }}</div>
          </th>
          <th class="p-2 text-xs font-bold">
            <div class="text-right">{{ $t("order.name") }}</div>
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
              {{ order.accounting.service.revenue }}
            </div>
          </td>
          <td class="p-2">
            <div class="text-right">
              {{ order.accounting.service.tax }}
            </div>
          </td>
          <td class="p-2">
            <div class="text-right">{{ order.totalCharge }}</div>
          </td>
          <td class="p-2">
            <div>
              <router-link :to="orderUrl(order)">{{
                orderName(order)
              }}</router-link>
              <a v-if="order.payment" :href="searchUrl(order)" target="stripe">
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
        :fileName="fileName"
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
    </div>

    <!-- Report Details -->
    <div class="mx-6 mt-6 text-center">
      <report-details
        :orders="orders"
        :shopInfo="shopInfo"
        :fileName="fileName"
      />
    </div>
  </div>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
import moment from "moment";

import BackButton from "@/components/BackButton.vue";
import DownloadCsv from "@/components/DownloadCSV.vue";
import ReportDetails from "@/app/admin/Order/ReportDetails.vue";

import { ownPlateConfig } from "@/config/project";
import { nameOfOrder } from "@/utils/strings";
import { midNightOfMonth } from "@/utils/dateUtils";
import { revenueHeader } from "@/utils/reportUtils";
import { order_status_keys } from "@/config/constant";

import { order2ReportData } from "@/models/orderInfo";

export default {
  components: {
    BackButton,
    DownloadCsv,
    ReportDetails,
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
  data() {
    return {
      orders: [],
      total: {
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
      monthIndex: 0,
      detacher: null,
    };
  },
  async created() {
    if (!this.checkAdminPermission()) {
      return;
    }

    if (!this.checkShopAccount(this.shopInfo)) {
      this.notFound = true;
      return true;
    }

    this.updateQuery();
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  watch: {
    monthIndex() {
      this.updateQuery();
    },
  },
  computed: {
    fileName() {
      return [
        moment(this.lastSeveralMonths[this.monthIndex].date).format(
          "YYYY-MM"
        ),
        "revenue",
        this.shopInfo.restaurantId
      ].join("-");
    },
    fields() {
      return revenueHeader;
    },
    fieldNames() {
      return this.fields.map((field) => {
        return this.$t(`order.${field}`);
      });
    },
    tableData() {
      return this.orders.map((order) => {
        return {
          date: moment(order.timeConfirmed).format("YYYY/MM/DD"),
          restaurantName: this.shopInfo.restaurantName,
          orderStatus: this.$t(
            "order.status." + order_status_keys[order.status]
          ),
          foodRevenue: order.accounting.food.revenue,
          foodTax: order.accounting.food.tax,
          alcoholRevenue: order.accounting.alcohol.revenue,
          salesTax: order.accounting.alcohol.tax,
          tipShort: order.accounting.service.revenue,
          serviceTax: order.accounting.service.tax,
          revenue: order.totalCharge,
          total: order.totalCharge,
          name: this.orderName(order),
          payment: order.payment?.stripe ? "stripe" : "",
        };
      });
    },
    lastSeveralMonths() {
      return Array.from(Array(12).keys()).map((index) => {
        const date = midNightOfMonth(-index);
        return { index, date };
      });
    },
  },
  methods: {
    updateQuery() {
      console.log("updateQuery", this.monthIndex);
      this.detacher && this.detacher();
      let query = db
        .collection(`restaurants/${this.restaurantId()}/orders`)
        .where(
          "timeConfirmed",
          ">=",
          this.lastSeveralMonths[this.monthIndex].date
        );
      if (this.monthIndex > 0) {
        query = query.where(
          "timeConfirmed",
          "<",
          this.lastSeveralMonths[this.monthIndex - 1].date
        );
      }
      this.detacher = query.orderBy("timeConfirmed").onSnapshot((snapshot) => {
        let orders = snapshot.docs.map(this.doc2data("order"));
        const serviceTaxRate = this.shopInfo.alcoholTax / 100;
        this.orders = orders.map(order => order2ReportData(order, serviceTaxRate));
        this.total = this.orders.reduce(
          (total, order) => {
            const accounting = order.accounting;
            total.food.revenue += accounting.food.revenue;
            total.food.tax += accounting.food.tax;
            total.alcohol.revenue += accounting.alcohol.revenue;
            total.alcohol.tax += accounting.alcohol.tax;
            total.service.revenue += accounting.service.revenue;
            total.service.tax += accounting.service.tax;
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
      });
    },
    orderName(order) {
      return nameOfOrder(order);
    },
    orderUrl(order) {
      return `/admin/restaurants/${this.restaurantId()}/orders/${order.id}`;
    },
    searchUrl(order) {
      const value = encodeURIComponent(
        order.description || this.orderName(order)
      );
      return `${ownPlateConfig.stripe.search}?query=${value}`;
    },
  },
};
</script>
