<template>
  <div>
    <!-- Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Nav Bar -->
          <div class="level">
            <!-- Back Button and Restaurant Profile -->
            <div class="level-left flex-1">
              <!-- Back Button -->
              <back-button url="/admin/restaurants/" class="m-t-24 m-r-16" />
              <!-- Restaurant Profile -->
              <div class="is-inline-flex flex-center m-t-24">
                <div>
                  <img :src="resizedProfileImage(shopInfo, '600')" class="w-36 h-36 r-36 cover" />
                </div>
                <div class="t-h6 c-text-black-high m-l-8 flex-1">{{ shopInfo.restaurantName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Select Date -->
          <b-select v-model="monthIndex" class="m-t-24">
            <option
              v-for="day in lastSeveralMonths"
              :value="day.index"
              :key="day.index"
            >{{ moment(day.date).format("YYYY-MM") }}</option>
          </b-select>

          <!-- Table -->
          <div class="m-t-24 bg-surface r-8 d-low p-l-16 p-r-16 p-t-16 p-b-16">
            <table class="w-full">
              <!-- Table Header -->
              <tr>
                <th class="p-l-8 p-b-8">
                  <div class="align-right">{{ $t('order.date')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.foodRevenue')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.foodTax')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.alcoholRevenue')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.salesTax')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.tipShort')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.salesTax')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.total')}}</div>
                </th>
                <th class="p-l-8">
                  <div class="align-right">{{ $t('order.name')}}</div>
                </th>
              </tr>

              <!-- Table Body -->
              <tr v-for="order in orders" :key="order.id">
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{$d(order.timeConfirmed)}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{order.accounting.food.revenue}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{order.accounting.food.tax}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{order.accounting.alcohol.revenue}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{order.accounting.alcohol.tax}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{order.accounting.service.revenue}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{order.accounting.service.tax}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div class="align-right">{{order.totalCharge}}</div>
                </td>
                <td class="p-l-8 p-t-4">
                  <div>
                    <nuxt-link :to="orderUrl(order)">{{orderName(order)}}</nuxt-link>
                    <a v-if="order.payment" :href="searchUrl(order)" target="stripe">
                      <i v-if="order.payment" class="fab fa-cc-stripe" />
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Table Footer -->
              <tr class="bold">
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{$t('order.total')}}</div>
                </td>
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{total.food.revenue}}</div>
                </td>
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{total.food.tax}}</div>
                </td>
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{total.alcohol.revenue}}</div>
                </td>
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{total.alcohol.tax}}</div>
                </td>
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{total.service.revenue}}</div>
                </td>
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{total.service.tax}}</div>
                </td>
                <td class="p-t-8 p-l-8">
                  <div class="align-right">{{total.totalCharge}}</div>
                </td>
              </tr>
            </table>
          </div>
          <download-csv
            :data="tableData"
            :fields="fields"
            :fieldNames="fieldNames"
            :fileName="fileName"
          >
            <b-button class="m-t-16 b-reset h-36 r-36 bg-form">
              <span class="p-l-16 p-r-16">
                <i class="material-icons c-primary s-18 m-r-8">save_alt</i>
                <span class="c-primary t-button">Download CSV</span>
              </span>
            </b-button>
          </download-csv>
        </div>
        <div class="m-t-24 m-l-24 m-r-24">
          <report-details :orders="orders" :fileName="fileName" />
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import DownloadCsv from "~/components/DownloadCSV";
import { nameOfOrder } from "~/plugins/strings.js";
import { ownPlateConfig } from "~/config/project";
import { midNightOfMonth } from "~/plugins/dateUtils.js";
import moment from "moment";
import ReportDetails from "~/app/admin/Order/ReportDetails";

export default {
  components: {
    BackButton,
    DownloadCsv,
    ReportDetails
  },
  data() {
    return {
      shopInfo: {},
      orders: [],
      total: {
        food: {
          revenue: 0,
          tax: 0
        },
        alcohol: {
          revenue: 0,
          tax: 0
        },
        service: {
          revenue: 0,
          tax: 0
        },
        totalCharge: 0
      },
      monthIndex: 0,
      detacher: null
    };
  },
  async created() {
    const refRestaurant = db.doc(`restaurants/${this.restaurantId()}`);
    this.shopInfo = (await refRestaurant.get()).data() || {};
    this.updateQuery();
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  watch: {
    monthIndex() {
      this.updateQuery();
    }
  },
  computed: {
    fileName() {
      return moment(this.lastSeveralMonths[this.monthIndex].date).format(
        "YYYY-MM"
      );
    },
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
          foodRevenue: order.accounting.food.revenue,
          foodTax: order.accounting.food.tax,
          alcoholRevenue: order.accounting.alcohol.revenue,
          salesTax: order.accounting.alcohol.tax,
          tipShort: order.accounting.service.revenue,
          serviceTax: order.accounting.service.tax,
          total: order.totalCharge,
          name: this.orderName(order),
          payment: order.payment?.stripe ? "stripe" : ""
        };
      });
    },
    lastSeveralMonths() {
      return Array.from(Array(12).keys()).map(index => {
        const date = midNightOfMonth(-index);
        return { index, date };
      });
    }
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
      this.detacher = query.orderBy("timeConfirmed").onSnapshot(snapshot => {
        let orders = snapshot.docs.map(this.doc2data("order"));
        const multiple = this.$store.getters.stripeRegion.multiple;
        this.orders = orders.map(order => {
          order.timeConfirmed = order.timeConfirmed.toDate();
          order.timePlaced = order.timePlaced.toDate();
          if (!order.accounting) {
            order.accounting = {
              food: {
                revenue: order.total - order.tax,
                tax: order.tax
              },
              alcohol: {
                revenue: 0,
                tax: 0
              }
            };
          }
          if (ownPlateConfig.region === "JP") {
            const serviceTaxRate = this.shopInfo.alcoholTax / 100;
            const serviceTax =
              Math.round(
                order.tip * (1 - 1 / (1 + serviceTaxRate)) * multiple
              ) / multiple;
            order.accounting.service = {
              revenue: order.tip - serviceTax,
              tax: serviceTax
            };
          } else {
            order.accounting.service = {
              revenue: order.tip,
              tax: 0
            };
          }
          return order;
        });
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
              tax: 0
            },
            alcohol: {
              revenue: 0,
              tax: 0
            },
            service: {
              revenue: 0,
              tax: 0
            },
            totalCharge: 0
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
    }
  }
};
</script>
