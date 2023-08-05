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
        :lastOrder="lastOrder"
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
import moment from "moment-timezone";

import NotFound from "@/components/NotFound.vue";
import RequireLogin from "@/components/RequireLogin.vue";

import TransactionsActModal from "@/app/user/TransactionsAct/Modal.vue";

import OrderPageBefore from "@/app/user/OrderPage/BeforePaid.vue";
import OrderPageAfter from "@/app/user/OrderPage/AfterPaid.vue";

import { db } from "@/lib/firebase/firebase9";
import { onSnapshot, doc, deleteDoc, Unsubscribe } from "firebase/firestore";

import { order_status, order_status_keys } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";

import * as analyticsUtil from "@/lib/firebase/analytics";

import {
  getOrderItems,
  doc2data,
  array2obj,
  useLiffBasePath,
  useRestaurantId,
  useUserData,
} from "@/utils/utils";

import { useStore } from "vuex";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";

import { OrderInfoData, OrderMenuItemData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

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
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const {
      isUser,
      isLiffUser,
      inLiff,
    } = useUserData();

    const loginVisible = ref(false);
    const transactions = ref();
    const orderInfo = ref<OrderInfoData>({} as OrderInfoData);
    const menuObj = ref<{ [key: string]: OrderMenuItemData } | null>(null);
    const detacher: Unsubscribe[] = [];
    const menuNotFound = ref<boolean | null>(null);
    const requireLoginRef = ref();
    
    const liffBasePath = useLiffBasePath();

    const orderId = route.params.orderId as string;
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
      return getOrderItems(orderInfo.value, menuObj.value as any);
    });
    const restaurantId = useRestaurantId();
    const loadUserData = () => {
      const order_detacher = onSnapshot(
        doc(db, `restaurants/${restaurantId.value}/orders/${orderId}`),
        async (order) => {
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
              restaurantId.value
            );
          }
        },
        (error) => {
          menuNotFound.value = true;
        }
      );
      detacher.push(order_detacher);
    };

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
          doc(db, `restaurants/${restaurantId.value}/orders/${orderId}`)
        );
        console.log("suceeded");
      } catch (error) {
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
      if (detacher) {
        detacher.map((detacher) => {
          detacher();
        });
      }
    });
    onBeforeRouteLeave((to, from, next)  => {
      if (just_validated.value) {
        deleteOrderInfo();
      }
      next();
    });
    return {
      menuNotFound,
      orderError,
      just_validated,
      paid,

      orderInfo,
      orderItems,

      menuPagePath,

      openTransactionsAct,
      transactions,
      loginVisible,

      loadUserData,
      isUser,
      
      disabledPickupTime,
      lastOrder,
      isLiffUser,
    };
  },
});
</script>
