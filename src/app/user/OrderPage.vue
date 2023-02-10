<template>
  <div>
    <template v-if="!isUser && !isLiffUser">
      <RequireLogin :loginVisible="loginVisible" @dismissed="handleDismissed" />
    </template>
    <template v-else-if="notFound || menuNotFound">
      <not-found />
    </template>
    <template v-else-if="orderError">
      <div class="mx-6 mt-4">
        <div class="text-center text-xl font-bold">
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
        :lastOrder="lastOrder"
        :moSuspend="moSuspend"
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
    <TransactionsActModal
      :isDelivery="orderInfo.isDelivery || false"
      :shopInfo="shopInfo"
      ref="contents"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
} from "@vue/composition-api";
import firebase from "firebase/compat/app";
import moment from "moment-timezone";

import NotFound from "@/components/NotFound.vue";
import RequireLogin from "@/components/RequireLogin.vue";

import TransactionsActModal from "@/app/user/TransactionsAct/Modal.vue";

import OrderPageBefore from "@/app/user/OrderPage/BeforePaid.vue";
import OrderPageAfter from "@/app/user/OrderPage/AfterPaid.vue";

import { db } from "@/lib/firebase/firebase9";
import { onSnapshot, doc, deleteDoc } from "firebase/firestore";

import { order_status, order_status_keys } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";

import * as analyticsUtil from "@/lib/firebase/analytics";

import {
  getOrderItems,
  doc2data,
  array2obj,
  useLiffBasePath,
} from "@/utils/utils";

export default defineComponent({
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

    TransactionsActModal,
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
    moSuspend: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, ctx) {
    const loginVisible = ref(false);
    const orderInfo = ref({});
    const menuObj = ref(null);
    const detacher = [];
    const menuNotFound = ref(null);

    const liffBasePath = useLiffBasePath(ctx.root);

    const orderId = ctx.root.$route.params.orderId;
    const statusKey = computed(() => {
      return orderInfo.value ? order_status_keys[orderInfo.value.status] : null;
    });
    const orderError = computed(() => {
      return orderInfo.value.status === order_status.error;
    });
    const just_validated = computed(() => {
      return orderInfo.value.status === order_status.validation_ok;
    });
    const paid = computed(() => {
      return orderInfo.value.status >= order_status.order_placed;
    });
    const orderItems = computed(() => {
      return getOrderItems(orderInfo.value, menuObj.value);
    });

    const loadUserData = () => {
      const order_detacher = onSnapshot(
        doc(db, `restaurants/${ctx.root.restaurantId()}/orders/${orderId}`),
        async (order) => {
          const order_data = order.exists() ? order.data() : {};
          orderInfo.value = order_data;
          menuObj.value = orderInfo.value.menuItems || {};
          if (just_validated.value) {
            analyticsUtil.sendViewCart(
              orderInfo.value,
              orderId,
              orderItems.value.map((or) => {
                return { ...or.item, id: or.id, quantity: or.count };
              }),
              props.shopInfo,
              ctx.root.restaurantId()
            );
          }
        },
        (error) => {
          menuNotFound.value = true;
        }
      );
      detacher.push(order_detacher);
    };

    const store = ctx.root.$store;
    const disabledPickupTime = computed(() => {
      if (orderInfo.value?.isPickup) {
        const now = Number(moment(store.state.date).format("hhmm"));
        const last = Number(props.shopInfo.moLastPickupTime || "2100");
        return now >= last;
      }
      return false;
    });
    const lastOrder = computed(() => {
      if (props.shopInfo.moLastPickupTime) {
        return [
          (props.shopInfo.moLastPickupTime || "")
            .split("")
            .slice(0, 2)
            .join(""),
          (props.shopInfo.moLastPickupTime || "")
            .split("")
            .slice(2, 4)
            .join(""),
        ].join(":");
      }
      return "21:00";
    });

    const handleOpenMenu = () => {
      if (ctx.root.inLiff) {
        ctx.root.$router.push(liffBasePath + "/r/" + ctx.root.restaurantId());
      } else if (props.mode === "mo") {
        ctx.root.$router.push(
          `/${props.moPrefix}/r/${ctx.root.restaurantId()}`
        );
      } else {
        ctx.root.$router.push(`/r/${ctx.root.restaurantId()}`);
      }
    };
    const handleDismissed = (params) => {
      console.log("handleDismissed", params);
      // The user has dismissed the login dialog (including the successful login)
      loginVisible.value = false;
    };
    const deleteOrderInfo = async () => {
      try {
        await deleteDoc(
          doc(db, `restaurants/${ctx.root.restaurantId()}/orders/${orderId}`)
        );
        console.log("suceeded");
      } catch (error) {
        console.log("failed");
      }
    };
    const openTransactionsAct = () => {
      ctx.refs.contents.openTransactionsAct();
    };

    if (ctx.root.isUser || ctx.root.isLiffUser) {
      loadUserData();
    } else if (!ctx.root.isUser) {
      loginVisible.value = true;
    }

    onUnmounted(() => {
      if (detacher) {
        detacher.map((detacher) => {
          detacher();
        });
      }
    });

    return {
      menuNotFound,
      orderError,
      just_validated,
      paid,

      orderInfo,
      orderItems,

      handleOpenMenu,
      handleDismissed,

      openTransactionsAct,
      loginVisible,

      loadUserData,
      deleteOrderInfo,

      disabledPickupTime,
      lastOrder,
    };
  },
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
  beforeRouteLeave(to, from, next) {
    if (this.just_validated) {
      this.deleteOrderInfo();
    }
    next();
  },
});
</script>
