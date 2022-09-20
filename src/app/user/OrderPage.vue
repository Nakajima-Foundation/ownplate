<template>
  <div>
    <template v-if="!isUser && !isLiffUser">
      <RequireLogin :loginVisible="loginVisible" @dismissed="handleDismissed" />
    </template>
    <template v-else-if="notFound || menuNotFound">
      <not-found />
    </template>
    <template v-else-if="orderError">
      <div class="mt-4 mx-6">
        <div class="text-xl font-bold text-center">
          {{ $t("order.orderErrorMessage") }}
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Back Button (Edit Order) -->
      <OrderPageBefore
        v-if="just_validated"
        :shopInfo="shopInfo"
        :orderInfo="orderInfo"
        :orderItems="orderItems"
        :paymentInfo="paymentInfo"
        :deliveryData="deliveryData"
        :mode="mode"
        :groupData="groupData"
        @handleOpenMenu="handleOpenMenu"
        @openTransactionsAct="openTransactionsAct"
      />
      <OrderPageAfter
        v-else-if="paid"
        :shopInfo="shopInfo"
        :orderInfo="orderInfo"
        :orderItems="orderItems"
        :paymentInfo="paymentInfo"
        :mode="mode"
        :groupData="groupData"
        @handleOpenMenu="handleOpenMenu"
      />
    </template>
    <TransactionsActContents
      :isDelivery="orderInfo.isDelivery || false"
      :shopInfo="shopInfo"
      ref="contents"
    />
  </div>
</template>

<script>
import firebase from "firebase/compat/app";

import NotFound from "@/components/NotFound.vue";
import RequireLogin from "@/components/RequireLogin.vue";

import TransactionsActContents from "@/app/user/TransactionsAct/Contents.vue";

import OrderPageBefore from "@/app/user/OrderPage/BeforePaid.vue";
import OrderPageAfter from "@/app/user/OrderPage/AfterPaid.vue";

import { db } from "@/plugins/firebase";

import { order_status, order_status_keys } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";

import * as analyticsUtil from "@/lib/firebase/analytics";

import { getOrderItems, doc2data, array2obj } from "@/utils/utils";

export default {
  name: "Order",
  metaInfo() {
    return {
      title:
        this.shopInfo?.restaurantName && this.statusKey
          ? [
              // this.defaultTitle, for mo
              this.shopInfo ? this.shopInfo?.restaurantName : "--",
              "Order Page",
              this.$t("order.status." + this.statusKey),
            ].join(" / ")
          : [this.defaultTitle, "Order Page"].join(" / "),
    };
  },
  components: {
    OrderPageBefore,
    OrderPageAfter,

    NotFound,
    RequireLogin,

    TransactionsActContents,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    paymentInfo: {
      type: Object,
      required: true,
    },
    deliveryData: {
      type: Object,
      required: true,
    },
    notFound: {
      type: Boolean,
      required: false,
    },
    mode: {
      type: String,
      required: false,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    groupData: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      loginVisible: false,
      orderInfo: {},
      menuNotFound: null,
      menuObj: null,
      detacher: [],
    };
  },
  created() {
    if (this.isUser || this.isLiffUser) {
      this.loadUserData();
    } else if (!this.isUser) {
      this.loginVisible = true;
    }
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map((detacher) => {
        detacher();
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === "r-restaurantId") {
      this.deleteOrderInfo();
    }
    next();
  },
  computed: {
    statusKey() {
      return this.orderInfo ? order_status_keys[this.orderInfo.status] : null;
    },
    orderName() {
      return nameOfOrder(this.orderInfo);
    },
    orderError() {
      return this.orderInfo.status === order_status.error;
    },
    just_validated() {
      return this.orderInfo.status === order_status.validation_ok;
    },
    paid() {
      return this.orderInfo.status >= order_status.order_placed;
    },
    orderItems() {
      return getOrderItems(this.orderInfo, this.menuObj);
    },
    orderId() {
      return this.$route.params.orderId;
    },
  },
  // end of computed
  watch: {
    isUser() {
      if (this.isUser) {
        this.loadUserData();
      }
    },
    isLiffUser() {
      if (this.isLiffUser) {
        this.loadUserData();
      }
    },
  },
  methods: {
    loadUserData() {
      const order_detacher = db
        .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
        .onSnapshot(
          async (order) => {
            const order_data = order.exists ? order.data() : {};
            this.orderInfo = order_data;
            // console.log("*** O", this.orderInfo);
            if (this.orderInfo.menuItems) {
              this.menuObj = this.orderInfo.menuItems;
            } else {
              // Backward compatibility
              if (!this.menuObj) {
                const menu = await db
                  .collection(`restaurants/${this.restaurantId()}/menus`)
                  .get();
                if (!menu.empty) {
                  const menus = menu.docs.map(doc2data("menu"));
                  this.menuObj = array2obj(menus);
                }
              }
            }
            if (this.just_validated) {
              analyticsUtil.sendViewCart(
                this.orderInfo,
                this.orderId,
                this.orderItems.map((or) => {
                  return { ...or.item, id: or.id, quantity: or.count };
                }),
                this.shopInfo,
                this.restaurantId()
              );
            }
          },
          (error) => {
            this.menuNotFound = true;
          }
        );
      this.detacher = [order_detacher];
    },

    handleOpenMenu() {
      if (this.inLiff) {
        this.$router.push(this.liff_base_path + "/r/" + this.restaurantId());
      } else if (this.mode === "mo") {
        this.$router.push(`/${this.moPrefix}/r/${this.restaurantId()}`);
      } else {
        this.$router.push(`/r/${this.restaurantId()}`);
      }
    },
    handleDismissed(params) {
      console.log("handleDismissed", params);
      // The user has dismissed the login dialog (including the successful login)
      this.loginVisible = false;
    },
    async deleteOrderInfo() {
      try {
        await db
          .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
          .delete();
        console.log("suceeded");
      } catch (error) {
        console.log("failed");
      }
    },
    openTransactionsAct() {
      this.$refs.contents.openTransactionsAct();
    },
  },
};
</script>
