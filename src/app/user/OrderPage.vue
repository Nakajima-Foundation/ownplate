<template>
  <div>
    <template v-if="!isUser && !isLiffUser">
      <RequireLogin :loginVisible="loginVisible" ref="requireLoginRef" />
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
        :menuPagePath="menuPagePath"
        @openTransactionsAct="openTransactionsAct"
        :promotions="promotions"
      />
      <OrderPagePay
        v-else-if="waiting_payment"
        :shopInfo="shopInfo"
        :orderInfo="orderInfo"
        :orderItems="orderItems"
        :paymentInfo="paymentInfo"
        :deliveryData="deliveryData"
        :menuPagePath="menuPagePath"
        @openTransactionsAct="openTransactionsAct"
        :promotions="promotions"
      />

      <OrderPageAfter
        v-else-if="paid"
        :shopInfo="shopInfo"
        :orderInfo="orderInfo"
        :orderItems="orderItems"
        :paymentInfo="paymentInfo"
        :menuPagePath="menuPagePath"
        :hasFriends="hasFriends"
        :hasLine="hasLine"
      />
    </template>
    <TransactionsActModal
      ref="transactions"
      :isDelivery="orderInfo.isDelivery || false"
      :shopInfo="shopInfo"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  watch,
  PropType,
} from "vue";

import NotFound from "@/components/NotFound.vue";
import RequireLogin from "@/components/RequireLogin.vue";

import TransactionsActModal from "@/app/user/TransactionsAct/Modal.vue";

import OrderPageBefore from "@/app/user/OrderPage/BeforePaid.vue";
import OrderPageAfter from "@/app/user/OrderPage/AfterPaid.vue";
import OrderPagePay from "@/app/user/OrderPage/Pay.vue";

import { db } from "@/lib/firebase/firebase9";
import { onSnapshot, doc, deleteDoc, Unsubscribe } from "firebase/firestore";

import { order_status } from "@/config/constant";
import { lineVerifyFriend } from "@/lib/firebase/functions";

import * as analyticsUtil from "@/lib/firebase/analytics";

import {
  getOrderItems,
  useLiffBasePath,
  useRestaurantId,
  useUserData,
  defaultTitle,
} from "@/utils/utils";

import { useRoute, onBeforeRouteLeave } from "vue-router";
import { useHead } from "@unhead/vue";

import { OrderInfoData } from "@/models/orderInfo";
import { MenuItem } from "@/models/menu";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  name: "Order",
  components: {
    OrderPageBefore,
    OrderPageAfter,
    OrderPagePay,
    NotFound,
    RequireLogin,

    TransactionsActModal,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
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
    promotions: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();

    const { isUser, isLiffUser, inLiff } = useUserData();

    const loginVisible = ref(false);
    const transactions = ref();
    const orderInfo = ref<OrderInfoData>({} as OrderInfoData);
    const hasFriends = ref<boolean | null>(null);
    const menuObj = ref<{ [key: string]: MenuItem } | null>(null);
    const detachers: Unsubscribe[] = [];
    const menuNotFound = ref<boolean | null>(null);

    const liffBasePath = useLiffBasePath();

    useHead(() => ({
      title: props.shopInfo?.restaurantName
        ? [
            props.shopInfo ? props.shopInfo?.restaurantName : "--",
            "Order Page",
          ].join(" / ")
        : [defaultTitle, "Order Page"].join(" / "),
    }));

    const orderId = route.params.orderId as string;
    const orderError = computed(() => {
      return orderInfo.value.status === order_status.error;
    });
    const just_validated = computed(() => {
      return orderInfo.value.status === order_status.validation_ok;
    });
    const waiting_payment = computed(() => {
      return orderInfo.value.status === order_status.waiting_payment;
    });
    const paid = computed(() => {
      return orderInfo.value.status >= order_status.order_placed;
    });

    const orderItems = computed(() => {
      return getOrderItems(orderInfo.value, menuObj.value as any);
    });
    const restaurantId = useRestaurantId();

    const hasLine = computed(() => {
      // console.log(props.shopInfo.hasLine, props.shopInfo.lineClientId);
      return !!(props.shopInfo.hasLine && props.shopInfo.lineClientId);
    });

    const loadUserData = async () => {
      const order_detacher = onSnapshot(
        doc(db, `restaurants/${restaurantId.value}/orders/${orderId}`),
        (order) => {
          const order_data = order.exists() ? order.data() : {};
          orderInfo.value = order_data as OrderInfoData;
          menuObj.value = orderInfo.value.menuItems || {};
          if (just_validated.value) {
            analyticsUtil.sendViewCart(
              orderInfo.value,
              orderId,
              orderItems.value.map((or) => {
                return { ...or.item, id: or.id, quantity: or.count } as any;
              }),
              props.shopInfo,
              restaurantId.value,
            );
          }
        },
        () => {
          menuNotFound.value = true;
        },
      );
      detachers.push(order_detacher);

      if (hasLine.value) {
        const ret = await lineVerifyFriend({
          restaurantId: props.shopInfo.restaurantId,
        });
        hasFriends.value = ret.data.result;
      } else {
        hasFriends.value = null;
      }
    };

    const menuPagePath = computed(() => {
      if (inLiff.value) {
        return liffBasePath + "/r/" + restaurantId.value;
      } else {
        return `/r/${restaurantId.value}`;
      }
    });

    const deleteOrderInfo = async () => {
      try {
        await deleteDoc(
          doc(db, `restaurants/${restaurantId.value}/orders/${orderId}`),
        );
        console.log("suceeded");
      } catch (__error) {
        console.log("failed");
      }
    };
    const openTransactionsAct = () => {
      transactions.value.openTransactionsAct();
    };
    if (isUser.value || isLiffUser.value) {
      loadUserData();
    } else if (!isUser.value) {
      loginVisible.value = true;
    }

    watch(isUser, (value) => {
      if (value) {
        loadUserData();
      }
    });
    watch(isLiffUser, (value) => {
      if (value) {
        loadUserData();
      }
    });

    onUnmounted(() => {
      if (detachers) {
        detachers.forEach((detacher) => {
          detacher();
        });
      }
    });
    onBeforeRouteLeave((to, from, next) => {
      if (just_validated.value) {
        deleteOrderInfo();
      }
      next();
    });
    return {
      menuNotFound,
      orderError,
      just_validated,
      waiting_payment,
      paid,

      orderInfo,
      orderItems,

      menuPagePath,

      openTransactionsAct,
      transactions,
      loginVisible,

      loadUserData,
      isUser,

      isLiffUser,

      hasFriends,
      hasLine,
    };
  },
});
</script>
