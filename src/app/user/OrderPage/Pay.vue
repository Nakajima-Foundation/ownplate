<template>
  <div>
    <!-- Back Button (Edit Order) -->
    <div class="mx-6 mt-4">
      <router-link :to="menuPagePath">
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4 b-reset-tw"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">arrow_back</i>
          <div class="text-sm font-bold text-op-teal">
            {{ $t("button.back") }}
          </div>
        </div>
      </router-link>
    </div>

    <!-- Restaurant Profile Photo and Name -->
    <div class="beforePaid mt-2">
      <shop-header :shopInfo="shopInfo"></shop-header>
    </div>

    <!-- Before Paid -->
    <div class="mx-6 mt-4">
      <BeforePaidAlert :orderInfo="orderInfo" :shopInfo="shopInfo" message="決済待ち" />
    </div>
    <!-- end of Before Paid -->

    <!-- Order Body -->
    <div class="mx-6 mt-2 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
      <!-- Left -->
      <div>
        <!-- Title -->
        <div class="text-xl font-bold text-black text-opacity-30">
          <div>
            {{ $t("order.confirmOrder") }}
          </div>
        </div>

        <!-- Details -->
        <div class="mt-2">
          <order-info
            :shopInfo="shopInfo || {}"
            :orderItems="orderItems"
            :orderInfo="orderInfo || {}"
            :menuData="menuData"
            :shippingCost="shippingCost"
            :promotion="selectedPromotion"
            :enablePromotion="enablePromotion"
            :discountPrice="discountPrice"
          ></order-info>
        </div>

        <!-- Customer info -->
        <div
          class="mt-2"
          v-if="
            shopInfo &&
            (shopInfo.isEC || orderInfo.isDelivery) &&
            hasCustomerInfo
          "
        >
          <UserCustomerInfo
            :shopInfo="shopInfo"
            :orderInfo="orderInfo"
            :orderId="orderId"
          />
        </div>
      </div>

      <!-- Right -->
      <div class="mt-4 lg:mt-0">
        <div>
          <!-- Payment -->
          <div class="mt-2">
            <div class="text-xl font-bold text-black text-opacity-30">
              {{ $t("order.yourPayment") }}
            </div>

            <!-- Pay Online -->
            <div v-if="showPayment" class="mt-2">
              <stripe-card
                @change="handleCardStateChange"
                ref="stripeRef"
                :stripeJCB="stripeJCB"
                :stripeAccount="stripeAccount"
                :clientSecret="orderInfo.client_secret"
                :ownerUid="shopInfo.uid"
                :uid="orderInfo.uid"
                :hasPayment="orderInfo.hasPayment"
              ></stripe-card>

              <div
                v-if="
                  selectedPromotion &&
                  selectedPromotion.paymentRestrictions === 'stripe'
                "
              >
                <div
                  class="border-green-600 text-green-600 text-center font-bold mx-auto w-72 items-center mt-8 -mb-3 rounded-lg bg-green-600 bg-opacity-10 px-6 py-2"
                >
                  <div class="text-xs">{{ $t("order.promotionNoteCard") }}</div>
                </div>
              </div>

              <div
                v-if="
                  selectedPromotion &&
                  selectedPromotion.paymentRestrictions === 'instore'
                "
              >
                <div
                  class="border-green-600 text-green-600 text-center font-bold mx-auto w-72 items-center mt-8 -mb-3 rounded-lg bg-green-600 bg-opacity-10 px-6 py-2"
                >
                  <div class="text-xs">
                    {{ $t("order.promotionNoteStore") }}
                  </div>
                </div>
              </div>

              <div class="mt-4 text-center">
                <o-button
                  :disabled="isPaying || !cardState.complete"
                  @click="handlePayment()"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal px-6 shadow"
                    style="min-width: 288px"
                  >
                    <ButtonLoading v-if="isPaying" />
                    <div class="text-xl font-bold text-white">
                      {{ $t("order.placeOrder") }}
                      <!-- {{ $n(orderInfo.total + tip, "currency") }} -->
                    </div>
                  </div>
                </o-button>
                <div
                  v-if="stripeSmallPayment"
                  class="mt-2 text-sm font-bold text-red-700"
                >
                  {{ $t("errorPage.code.smallPayment") }}
                </div>
              </div>
            </div>



            <!-- Error message for ec and delivery -->
            <div
              v-if="
                $refs.ecCustomerRef &&
                $refs.ecCustomerRef.hasEcError
              "
              class="mt-2 text-center font-bold text-red-700"
            >
              {{ $t("order.alertReqireAddress") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref, PropType } from "vue";

import ShopHeader from "@/app/user/Restaurant/ShopHeader.vue";

import OrderInfo from "@/app/user/OrderPage/OrderInfo.vue";
import UserCustomerInfo from "@/app/user/OrderPage/UserCustomerInfo.vue";

import StripeCard from "@/app/user/OrderPage/BeforePaid/StripeCard.vue";
// import ECCustomer from "@/app/user/OrderPage/BeforePaid/ECCustomer.vue";
import BeforePaidAlert from "@/app/user/OrderPage/BeforePaid/BeforePaidAlert.vue";
// import OrderPageMap from "@/app/user/OrderPage/BeforePaid/Map.vue";

import ButtonLoading from "@/components/Button/Loading.vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";

import { orderPay } from "@/lib/firebase/functions";

import { order_status } from "@/config/constant";

import { costCal } from "@/utils/commonUtils";
import { usePromotionData } from "@/utils/promotion";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import Promotion from "@/models/promotion";

import * as analyticsUtil from "@/lib/firebase/analytics";

import { useHasSoldOutToday } from "./Stock";

import { useStore } from "vuex";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "Order",
  components: {
    ShopHeader,

    OrderInfo,
    UserCustomerInfo,

    ButtonLoading,

    // before paid
    StripeCard,
    BeforePaidAlert,
//    OrderPageMap,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    orderInfo: {
      type: Object as PropType<OrderInfoData>,
      required: true,
    },
    orderItems: {
      type: Array,
      required: true,
    },
    paymentInfo: {
      type: Object,
      required: true,
    },
    promotions: {
      type: Array<Promotion>,
      required: true,
    },
    menuPagePath: {
      type: String,
      required: false,
    },
  },
  data() {
    return {};
  },
  setup(props) {
    const route = useRoute();
    const store = useStore();

    const restaurantId = route.params.restaurantId as string;

    const isPaying = ref(false);

    const cardState = ref({});

    // let tip = 0;

    // ref for refs
    const ecCustomerRef = ref();
    const orderPageMapRef = ref();
    const stripeRef = ref();

    const postageInfo = ref({});
    const setPostage = () => {
      if (props.shopInfo.isEC) {
        getDoc(doc(db, `restaurants/${restaurantId}/ec/postage`)).then(
          (snapshot) => {
            postageInfo.value = snapshot.data() || {};
          },
        );
      }
    };
    setPostage();

    const stripeAccount = computed(() => {
      return props.paymentInfo.stripe;
    });

    const stripeJCB = computed(() => {
      return props.paymentInfo.stripeJCB === true;
    });
    const inStorePayment = computed(() => {
      return props.paymentInfo.inStore;
    });
    const showPayment = computed(() => {
      return stripeAccount.value;
    });

    const hasCustomerInfo = computed(() => {
      return props.orderInfo.status > order_status.validation_ok;
    });

    const orderId = computed(() => {
      return route.params.orderId as string;
    });
    const stripeSmallPayment = computed(() => {
      return props.orderInfo.total <= 50;
    });
    const shippingCost = computed(() => {
      return costCal(
        postageInfo.value,
        ecCustomerRef.value?.customerInfo?.prefectureId,
        props.orderInfo.total,
      );
    });
    const selectedPromotion = computed<Promotion | null>(() => {
      if (props.promotions && props.promotions.length > 0) {
        const matched = props.promotions.filter((a) => {
          return props.orderInfo.total >= a.discountThreshold;
        });
        if (matched && matched.length > 0) {
          return matched[matched.length - 1];
        }
      }
      return null;
    });

    const { enablePromotion, discountPrice } =
      usePromotionData(props.orderInfo, selectedPromotion);

    const shopInfo = computed(() => {
      console.log(props.shopInfo);
      return props.shopInfo;
    });
    const { hasSoldOutToday, menuData } = useHasSoldOutToday(
      restaurantId,
      props.orderInfo,
    );

    // end of computed
    watch(shopInfo, () => {
      setPostage();
    });

    // methods
    // internal
    const sendPurchase = () => {
      analyticsUtil.sendPurchase(
        props.orderInfo,
        orderId.value,
        props.orderItems.map((or: any) => {
          return { ...or.item, id: or.id, quantity: or.count };
        }),
        props.shopInfo,
        restaurantId,
      );
    };
    const handleCardStateChange = (state: { [key: string]: boolean }) => {
      cardState.value = state;
    };

    const handlePayment = async () => {
      try {
        isPaying.value = true;
        const pay = await stripeRef.value.processPayment();
        if (pay.error) {
          isPaying.value = false;
          return;
        }
        await orderPay({
          restaurantId,
          orderId: orderId.value,
          isSavePay: stripeRef.value.isSavePay ,
        });

        sendPurchase();
        store.commit("resetCart", restaurantId);
        window.scrollTo(0, 0);
      } catch (error: any) {
        console.error(error.message, error.details);
        store.commit("setErrorMessage", {
          code: "order.place",
          error,
        });
      } finally {
        isPaying.value = false;
      }
    };

    return {
      // ref
      isPaying,
      cardState,

      // refs
      ecCustomerRef,
      orderPageMapRef,
      stripeRef,

      // computed
      stripeJCB,
      inStorePayment,
      showPayment,
      hasCustomerInfo,
      orderId,
      stripeSmallPayment,
      shippingCost,

      selectedPromotion,
      enablePromotion,
      discountPrice,

      // methods
      handleCardStateChange,
      handlePayment,
      stripeAccount,
      //
      hasSoldOutToday,
      menuData,

    };
  },
});
</script>
