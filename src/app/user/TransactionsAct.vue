<template>
  <div>
    <h1>特定商取引法に基づく表記</h1>
    <table>
      <tr>
        <td>
          販売事業者名
        </td>
        <td>
          {{shopInfo.restaurantName}}
        </td>
      </tr>
      <tr>
        <td>
          運営責任者
        </td>
        <td>
        </td>
      </tr>
      <tr>
        <td>
          所在地
        </td>
        <td>
          {{this.shopInfo.state}} {{this.shopInfo.city}} {{this.shopInfo.streetAddress}}
        </td>
      </tr>
      <tr>
        <td>
          営業時間
        </td>
        <td>
          <template v-for="(day, key) in days">
            <div
              class="cols p-l-8 p-r-8 p-t-4 p-b-4 r-4 t-body2"
            >
              <div class="w-64">{{$t('week.short.' + day)}}</div>
              <div class="flex-1">
                <template v-if="(shopInfo.businessDay||{})[key]">
                  <template v-for="(data) in (shopInfo.openTimes||{})[key]">
                    <template v-if="validDate(data)">
                      {{num2time(data.start)}} - {{num2time(data.end)}}
                      <br />
                    </template>
                  </template>
                </template>
                <template v-else>{{$t('shopInfo.closed')}}</template>
              </div>
            </div>
          </template>
       </td>
      </tr>
      <tr>
        <td>
          電話番号
        </td>
        <td>
          {{nationalPhoneNumber}}
        </td>
      </tr>
      <tr>
        <td>
          販売価格
        </td>
        <td>
          販売価格	商品ページをご確認ください。
        </td>
      </tr>
      <tr>
        <td>
          商品代金以外に必要な費用
        </td>
        <td>
          店舗までの交通費など移動に関わる費用などは、ご負担下さい。
        </td>
      </tr>

      <tr>
        <td>
          代金の支払い時期および方法
        </td>
        <td>
          クレッジットカード決済/店舗払い
        </td>
      </tr>

      <tr>
        <td>
          商品引き渡し時期および方法
        </td>
        <td>
          お客様のご指定日と店舗受取り。
        </td>
      </tr>

      <tr>
        <td>
          取り消しの取り扱い条件、解約条件
        </td>
        <td>
          受取指定日4日前まで、インターネット上でのキャンセルが可能です。3日前以降については店舗へご連絡ください。
        </td>
      </tr>

      </tr>
    </table>
  </div>

</template>
<script>
import { daysOfWeek } from "~/plugins/constant.js";
import { db } from "~/plugins/firebase.js";
import {
  parsePhoneNumber,
  formatNational,
} from "~/plugins/phoneutil.js";

export default {
  data() {
    return {
      restaurantsId: this.restaurantId(),
      days: daysOfWeek,
      shopInfo: {},
      detacher: [],
      notFound: null
    };
  },
  created() {
    const restaurant_detacher = db
          .doc(`restaurants/${this.restaurantId()}`)
          .onSnapshot(restaurant => {
            if (
              restaurant.exists &&
                !restaurant.data().deletedFlag &&
                restaurant.data().publicFlag
            ) {
              const restaurant_data = restaurant.data();
              this.shopInfo = restaurant_data;
              this.notFound = false;
            } else {
              this.notFound = true;
            }
          });
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map(detacher => {
        detacher();
      });
    }
  },
  computed: {
    // BUGBUG: We need to determine what we want to diplay for EU
    nationalPhoneNumber() {
      const number = this.parsedNumber;
      if (number) {
        return formatNational(number);
      }
      console.log("parsing failed, return as-is");
      return this.shopInfo.phoneNumber;
    },
    parsedNumber() {
      //console.log("countryCode", this.shopInfo.countryCode);
      const countryCode = this.shopInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.shopInfo.phoneNumber);
      } catch (error) {
        return null;
      }
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
  },
  methods: {
    validDate(date) {
      return !this.isNull(date.start) && !this.isNull(date.end);
    }
  }
}
</script>
