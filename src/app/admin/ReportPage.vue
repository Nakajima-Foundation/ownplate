<template>
  <div>
    <!-- QR Header Area -->
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
                  <img :src="shopInfo.restProfilePhoto" class="w-36 h-36 r-36 cover" />
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
    <!-- Select Date -->
    <div class="level-left">
      <b-select v-model="monthIndex" class="m-t-24 m-l-16">
        <option
          v-for="day in lastSeveralMonths"
          :value="day.index"
          :key="day.index"
        >{{ moment(day.date).format("YYYY-MM") }}</option>
      </b-select>
    </div>
    <!-- Table -->
    <table class="m-t-16 m-l-8">
      <tr>
        <th class="p-l-8 p-b-8">
          <div class="align-right">{{ $t('order.date')}}</div>
        </th>
        <th class="p-l-8">
          <div class="align-right">{{ $t('order.revenue')}}</div>
        </th>
        <th class="p-l-8">
          <div class="align-right">{{ $t('order.foodTax')}}</div>
        </th>
        <th class="p-l-8">
          <div class="align-right">{{ $t('order.revenue')}}</div>
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
      </tr>
      <tr v-for="order in orders" :key="order.id">
        <td class="p-l-8">
          <div class="align-right">{{$d(order.timeConfirmed)}}</div>
        </td>
        <td class="p-l-8">
          <div class="align-right">{{order.accounting.food.revenue}}</div>
        </td>
        <td class="p-l-8">
          <div class="align-right">{{order.accounting.food.tax}}</div>
        </td>
        <td class="p-l-8">
          <div class="align-right">{{order.accounting.alcohol.revenue}}</div>
        </td>
        <td class="p-l-8">
          <div class="align-right">{{order.accounting.alcohol.tax}}</div>
        </td>
        <td class="p-l-8">
          <div class="align-right">{{order.accounting.service.revenue}}</div>
        </td>
        <td class="p-l-8">
          <div class="align-right">{{order.accounting.service.tax}}</div>
        </td>
        <td class="p-l-8">
          <div class="align-right">{{order.totalCharge}}</div>
        </td>
        <td class="p-l-8">
          <div>
            <nuxt-link :to="orderUrl(order)">{{orderName(order)}}</nuxt-link>
            <a v-if="order.payment" :href="searchUrl(order)" target="stripe">
              <i v-if="order.payment" class="fab fa-cc-stripe" />
            </a>
          </div>
        </td>
      </tr>
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
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";
import { nameOfOrder } from "~/plugins/strings.js";
import { ownPlateConfig } from "~/config/project";
import { midNightOfMonth } from "~/plugins/dateUtils.js";
import moment from "moment";

export default {
  components: {
    BackButton
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
        const serviceTaxRate = this.shopInfo.alcoholTax / 100;
        const multiple = this.$store.getters.stripeRegion.multiple;
        this.orders = orders.map(order => {
          order.timeConfirmed = order.timeConfirmed.toDate();
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
          const serviceTax =
            Math.round(order.tip * (1 - 1 / (1 + serviceTaxRate)) * multiple) /
            multiple;
          if (ownPlateConfig.region === "JP") {
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
