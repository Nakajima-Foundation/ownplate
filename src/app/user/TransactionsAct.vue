<template>
  <div>
    <!-- Transactions Act Button -->
    <div class="op-button-text m-r-8" @click="openTransactionsAct()">
      <i class="material-icons">account_balance</i>
      <span>{{$t('transactionsAct.title')}}</span>
    </div>

    <!-- Transactions Act Popup-->
    <b-modal :active.sync="transactionsActPopup" :width="488" scroll="keep">
      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <!-- Title -->
        <div class="t-h6 c-text-black-disabled">{{$t('transactionsAct.title')}}</div>
        <div>
          <!-- Seller Name -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.sellerName')}}</div>
            <div class="t-body1 c-text-black-high">{{shopInfo.restaurantName}}</div>
          </div>

          <!-- Representative -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.representative')}}</div>
            <div class="t-body1 c-text-black-high">{{shopInfo.ownerName||"---"}}</div>
          </div>

          <!-- Address -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.address')}}</div>
            <div
              class="t-body1 c-text-black-high"
            >{{this.shopInfo.state}} {{this.shopInfo.city}} {{this.shopInfo.streetAddress}}</div>
          </div>

          <!-- Hours -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.hours')}}</div>
            <div class="t-body1 c-text-black-high">
              <template v-for="(day, key) in days">
                <div class="cols p-l-8 p-r-8 p-t-4 p-b-4 r-4 t-body2">
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
            </div>
          </div>

          <!-- Phone Number -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.phone')}}</div>
            <div class="t-body1 c-text-black-high">{{nationalPhoneNumber}}</div>
          </div>

          <!-- Sales Price -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.price')}}</div>
            <div class="t-body1 c-text-black-high">{{$t('transactionsAct.priceDescription')}}</div>
          </div>

          <!-- Other Required Fees -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.otherFees')}}</div>
            <div class="t-body1 c-text-black-high">{{$t('transactionsAct.otherFeesDescription')}}</div>
          </div>
          <!-- Payment Period and Method -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.payment')}}</div>
            <div class="t-body1 c-text-black-high">
              <span v-if="showPayment">{{$t('transactionsAct.paymentDescriptionCard')}}</span>
              <span v-if="inStorePayment">{{$t('transactionsAct.paymentDescriptionStore')}}</span>
            </div>
          </div>

          <!-- Delivery Time -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.delivery')}}</div>
            <div class="t-body1 c-text-black-high">{{$t('transactionsAct.deliveryDescription')}}</div>
          </div>

          <!-- Cancellation -->
          <div class="m-t-16">
            <div class="t-subtitle2 c-text-black-disabled">{{$t('transactionsAct.cancellation')}}</div>
            <div class="t-body1 c-text-black-high">{{$t('transactionsAct.cancellationDescription')}}</div>
          </div>
        </div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="closeTransactionsAct()">{{$t('menu.close')}}</div>
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script>
import { daysOfWeek } from "~/plugins/constant.js";
import { db } from "~/plugins/firebase.js";
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";
import { releaseConfig } from "~/plugins/config.js";

export default {
  data() {
    return {
      restaurantsId: this.restaurantId(),
      days: daysOfWeek,
      shopInfo: {},
      detacher: [],
      notFound: null,
      paymentInfo: {},
      transactionsActPopup: false
    };
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(async restaurant => {
        if (
          restaurant.exists &&
          !restaurant.data().deletedFlag &&
          restaurant.data().publicFlag
        ) {
          const restaurant_data = restaurant.data();
          this.shopInfo = restaurant_data;
          const uid = restaurant_data.uid;
          const snapshot = await db.doc(`/admins/${uid}/public/payment`).get();
          this.paymentInfo = snapshot.data() || {};
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
      if (!this.shopInfo.phoneNumber) {
        return "";
      }
      const number = this.parsedNumber;
      if (number) {
        return formatNational(number);
      }
      console.log("parsing failed, return as-is");
      return this.shopInfo.phoneNumber;
    },
    parsedNumber() {
      const countryCode = this.shopInfo.countryCode || this.countries[0].code;
      try {
        return parsePhoneNumber(countryCode + this.shopInfo.phoneNumber);
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    showPayment() {
      //console.log("payment", releaseConfig.hidePayment, this.stripeAccount);
      return !releaseConfig.hidePayment && this.stripeAccount;
    },
    stripeAccount() {
      return this.paymentInfo.stripe;
    },
    inStorePayment() {
      return this.paymentInfo.inStore;
    }
  },
  methods: {
    validDate(date) {
      return !this.isNull(date.start) && !this.isNull(date.end);
    },
    openTransactionsAct() {
      this.transactionsActPopup = true;
    },
    closeTransactionsAct() {
      this.transactionsActPopup = false;
    }
  }
};
</script>
