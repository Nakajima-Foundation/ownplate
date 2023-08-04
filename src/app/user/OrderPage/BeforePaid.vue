<template>
  <div>
    <!-- Back Button (Edit Order) -->
    <div class="mx-6 mt-6">
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
    <div class="beforePaid mt-4">
      <shop-header :shopInfo="shopInfo"></shop-header>
    </div>

    <!-- Before Paid -->
    <div class="mx-6 mt-4">
      <BeforePaidAlert :orderInfo="orderInfo" :shopInfo="shopInfo" />
    </div>
    <!-- end of Before Paid -->

    <!-- customer info -->
    <div
      v-if="orderInfo.phoneNumber && !shopInfo.isEC"
      class="mt-4 text-center"
    >
      <CustomerInfo :orderInfo="orderInfo" />
    </div>

    <!-- Order Body -->
    <div class="mx-6 mt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
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
            :shippingCost="shippingCost"
            :groupData="groupData"
            :promotion="selectedPromotion"
            :enablePromotion="enablePromotion"
            :discountPrice="discountPrice"
            @change="handleTipChange"
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
          <!-- For EC and Delivery -->
          <div
            v-if="shopInfo.isEC || orderInfo.isDelivery"
            class="text-xl font-bold text-black text-opacity-30"
          >
            {{ $t("order.ec.formtitle") }}
          </div>

          <!-- For EC and Delivery -->
          <div
            v-if="shopInfo.isEC || orderInfo.isDelivery"
            class="mb-4 mt-2 rounded-lg bg-white p-4 shadow"
          >
            <ECCustomer
              ref="ecCustomerRef"
              :shopInfo="shopInfo"
              :orderInfo="orderInfo"
              @updateLocation="updateLocation"
            />
          </div>
          <!-- End of EC and Delivery -->

          <!-- map for delivery -->
          <div class="mt-4" v-if="orderInfo.isDelivery">
            <span
              v-if="
                $refs.ecCustomerRef &&
                $refs.ecCustomerRef.ecErrors['location'].length > 0
              "
              class="font-bold text-red-700"
            >
              <div
                v-for="(error, key) in $refs.ecCustomerRef.ecErrors['location']"
              >
                {{ $t(error) }}
              </div>
            </span>
            <OrderPageMap
              ref="orderPageMapRef"
              @updateHome="updateHome"
              :shopInfo="shopInfo"
              :fullAddress="
                $refs.ecCustomerRef && $refs.ecCustomerRef.fullAddress
              "
              :deliveryInfo="deliveryData"
            />
          </div>

          <!-- Time to Pickup -->
          <div v-if="!shopInfo.isEC">
            <div class="text-xl font-bold text-black text-opacity-30">
              <span v-if="orderInfo.isDelivery">
                {{ $t("order.deliveryTimeRequested") }}
              </span>
              <span v-else>
                {{ $t("order.timeRequested") }}
              </span>
            </div>

            <div class="mt-2">
              <time-to-pickup
                v-if="shopInfo.businessDay"
                :shopInfo="shopInfo"
                :orderInfo="orderInfo"
                :isDelivery="orderInfo.isDelivery || false"
                ref="timeRef"
                @notAvailable="handleNotAvailable"
                @updateDisabledPickupTime="updateDisabledPickupTime"
              />
            </div>
          </div>

          <!-- Order Notice -->
          <OrderNotice :shopInfo="shopInfo" />

          <!-- Message -->
          <template v-if="shopInfo && shopInfo.acceptUserMessage">
            <div
              class="mt-6"
              :class="
                userMessageError ? 'rounded border-4 border-red-700 p-2' : ''
              "
            >
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("order.orderMessage") }}
              </div>

              <div class="mt-2 rounded-lg bg-white p-4 shadow">
                <o-input
                  v-model="memo"
                  type="textarea"
                  :placeholder="$t('order.enterMessage')"
                  class="w-full"
                ></o-input>
                <div :class="userMessageError ? 'font-bold text-red-700' : ''">
                  {{ $t("validationError.memo.length") }}
                </div>
              </div>
            </div>
          </template>

          <!--Act on Specified Commercial Transactions -->
          <div class="mt-6">
            <SpecifiedCommercialTransactions
              :shopInfo="shopInfo"
              @openTransactionsAct="openTransactionsAct()"
            />
          </div>

          <!-- Payment -->
          <div class="mt-6">
            <div class="text-xl font-bold text-black text-opacity-30">
              {{ $t("order.yourPayment") }}
            </div>

            <!-- Pay Online -->
            <div v-if="showPayment" class="mt-2">
              <stripe-card
                @change="handleCardStateChange"
                ref="stripeRef"
                :stripeJCB="stripeJCB"
              ></stripe-card>

              <div
                v-if="disabledPickupTime"
                class="mt-4 h-full w-full rounded-lg bg-red-700 bg-opacity-10 p-3 text-xs font-bold text-red-700"
              >
                {{
                  $t("mobileOrder.shopInfo.pickupNote", {
                    lastOrder: timeRef && timeRef.lastOrder,
                  }, 1)
                }}
              </div>

							<div v-if="selectedPromotion && selectedPromotion.paymentRestrictions === 'stripe'">
								<!-- おもちかえりの場合は以下のメッセージを表示-->
								<div class="border-green-600 text-green-600 text-center font-bold mx-auto w-72 items-center mt-8 -mb-3 rounded-lg bg-green-600 bg-opacity-10 px-6 py-2" v-if="mode !== 'mo'">
									<div class="text-xs">{{ $t("order.promotionNoteCard") }}</div>
								</div>
								<!-- MobileOrderの場合は以下のメッセージを表示-->
								<div v-else>
								  <div class="border-green-600 text-green-600 text-center font-bold mx-auto w-72 items-center mt-8 -mb-3 rounded-lg bg-green-600 bg-opacity-10 px-6 py-2">
									  <div class="text-xs">{{ $t("order.promotionNoteCardMo") }}</div>
								  </div>
								</div>
							</div>

							<div v-if="selectedPromotion && selectedPromotion.paymentRestrictions === 'instore'">
								<!-- おもちかえりの場合は以下のメッセージを表示 -->
								<div class="border-green-600 text-green-600 text-center font-bold mx-auto w-72 items-center mt-8 -mb-3 rounded-lg bg-green-600 bg-opacity-10 px-6 py-2"  v-if="mode !== 'mo'">
									<div class="text-xs">{{ $t("order.promotionNoteStore") }}</div>
								</div>
								<!-- MobileOrderの場合は以下のメッセージを表示 -->
								<div v-else>
								  <div class="border-green-600 text-green-600 text-center font-bold mx-auto w-72 items-center mt-8 -mb-3 rounded-lg bg-green-600 bg-opacity-10 px-6 py-2">
									  <div class="text-xs">{{ $t("order.promotionNoteStoreMo") }}</div>
								  </div>
								</div>
							</div>

              <div class="mt-6 text-center">
                <o-button
                  :disabled="
                    !cardState.complete ||
                    notAvailable ||
                    notSubmitAddress ||
                    userMessageError ||
                    disabledPickupTime ||
                    stripeSmallPayment ||
                    moSuspend ||
                    isPaying ||
                    isPlacing
                  "
                  @click="handlePayment(true)"
                  class="b-reset-tw"
                  :class="orderInfo.isPickup ? 'pickup' : 'takeout'"
                >
                  <div
                    class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal px-6 shadow"
                    style="min-width: 288px"
                  >
                    <ButtonLoading v-if="isPaying" />
                    <div class="text-xl font-bold text-white" v-if="moSuspend">
                      {{ $t("mobileOrder.suspendCartButton") }}
                    </div>
                    <div class="text-xl font-bold text-white" v-else>
                      {{
                        mode === "mo"
                          ? $t("order.placeOrderMo")
                          : $t("order.placeOrder")
                      }}
                      <!-- {{ $n(orderInfo.total + tip, "currency") }} -->
                    </div>
                  </div>
                </o-button>
                <div
                  v-if="mode !== 'mo' && stripeSmallPayment"
                  class="mt-2 text-sm font-bold text-red-700"
                >
                  {{ $t("errorPage.code.smallPayment") }}
                </div>
              </div>
              <div v-if="mode === 'mo'" class="text-center">
                <div
                  v-if="stripeSmallPayment"
                  class="mt-2 text-sm font-bold text-red-700"
                >
                  <div>
                    {{ $t("mobileOrder.smallPayment1") }}
                  </div>
                  <div>
                    {{ $t("mobileOrder.smallPayment2") }}
                  </div>
                  <div>
                    {{ $t("mobileOrder.smallPayment3") }}
                  </div>
                </div>
                <div
                  v-else
                  class="mt-2 text-center text-xs text-black text-opacity-50"
                >
                  {{ $t("order.placeOrderMoNote") }}
                </div>
              </div>
            </div>

            <!-- Pay at Restaurant -->
            <div v-else class="mt-2">
              <div class="rounded-lg bg-black bg-opacity-5 p-4">
                <div class="text-sm">
                  {{ $t("order.pleasePayAtRestaurant") }}
                </div>
              </div>
            </div>

            <!-- Pay Button -->
            <div v-if="inStorePayment" class="mt-4 text-center">
              <div class="text-sm font-bold text-black text-opacity-60">
                {{ $t("order.or") }}
              </div>

              <div class="mt-4">
                <o-button
                  :loading="isPlacing"
                  :disabled="
                    notAvailable ||
                    notSubmitAddress ||
                    userMessageError ||
                    disabledPickupTime ||
                    moSuspend ||
                    isPaying ||
                    isPlacing
                  "
                  @click="handlePayment(false)"
                  class="b-reset-tw"
                  :class="orderInfo.isPickup ? 'pickup' : 'takeout'"
                >
                  <div
                    class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal px-6 shadow"
                    style="min-width: 288px"
                  >
                    <ButtonLoading v-if="isPlacing" />
                    <div class="text-xl font-bold text-white" v-if="moSuspend">
                      {{ $t("mobileOrder.suspendCartButton") }}
                    </div>
                    <div class="text-xl font-bold text-white" v-else>
                      {{
                        mode === "mo"
                          ? $t("order.placeOrderNoPaymentMo")
                          : $t("order.placeOrderNoPayment")
                      }}
                    </div>
                  </div>
                </o-button>
              </div>
              <div v-if="mode !== 'mo'">
                <div class="mt-2 text-sm font-bold text-black text-opacity-60">
                  {{ $t("order.placeOrderNoPaymentNote") }}
                </div>

                <div v-if="hasPaymentMethods">
                  <div class="mt-4 text-left text-sm">
                    {{ $t("shopInfo.paymentMethods") }}:
                  </div>
                  <div class="ml-2 text-left text-xs">
                    <div
                      v-for="(paymentMethod, k) in paymentMethods"
                    >
                      <div v-if="(shopInfo.paymentMethods||{})[paymentMethod.key]">
                      {{
                        $t(
                          "editRestaurant.paymentMethodChoices." +
                            paymentMethod.key
                        )
                      }}
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error message for ec and delivery -->
            <div
              v-if="
                requireAddress &&
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
import {
  defineComponent,
  computed,
  watch,
  ref,
  PropType,
} from "vue";

import ShopHeader from "@/app/user/Restaurant/ShopHeader.vue";
import FavoriteButton from "@/app/user/Restaurant/FavoriteButton.vue";

import OrderInfo from "@/app/user/OrderPage/OrderInfo.vue";
import UserCustomerInfo from "@/app/user/OrderPage/UserCustomerInfo.vue";
import CustomerInfo from "@/app/user/OrderPage/CustomerInfo.vue";

import StripeCard from "@/app/user/OrderPage/BeforePaid/StripeCard.vue";
import TimeToPickup from "@/app/user/OrderPage/BeforePaid/TimeToPickup.vue";
import ECCustomer from "@/app/user/OrderPage/BeforePaid/ECCustomer.vue";
import OrderNotice from "@/app/user/OrderPage/BeforePaid/OrderNotice.vue";
import BeforePaidAlert from "@/app/user/OrderPage/BeforePaid/BeforePaidAlert.vue";
import SpecifiedCommercialTransactions from "@/app/user/OrderPage/BeforePaid/SpecifiedCommercialTransactions.vue";
import OrderPageMap from "@/app/user/OrderPage/BeforePaid/Map.vue";

import ButtonLoading from "@/components/Button/Loading.vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, Timestamp, serverTimestamp } from "firebase/firestore";

import { orderPlace } from "@/lib/firebase/functions";

import { order_status, paymentMethods } from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { stripeReceipt } from "@/lib/stripe/stripe";

import { costCal } from "@/utils/commonUtils";
import { usePromotionData } from "@/utils/promotion";

import { OrderInfoData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import Promotion from "@/models/promotion";

import * as analyticsUtil from "@/lib/firebase/analytics";

import { useStore } from "vuex";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "Order",
  components: {
    ShopHeader,
    FavoriteButton,

    OrderInfo,
    UserCustomerInfo,
    CustomerInfo,

    ButtonLoading,

    // before paid
    StripeCard,
    TimeToPickup,
    ECCustomer,
    OrderNotice,
    BeforePaidAlert,
    SpecifiedCommercialTransactions,
    OrderPageMap,
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
    deliveryData: {
      type: Object,
      required: true,
    },
    promotions: {
      type: Array<Promotion>,
      required: true,
    },
    mode: {
      type: String,
      required: false,
    },
    menuPagePath: {
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
  data() {
    return {
    };
  },
  setup(props, ctx) {
    const route = useRoute();
    const store = useStore();

    const restaurantId = route.params.restaurantId as string;
    
    const notAvailable = ref(false);
    const isPaying = ref(false);
    const isPlacing = ref(false);

    const cardState = ref({});
    const memo = ref("");
    const disabledPickupTime = ref(false);
    let tip = 0;

    // ref for refs
    const ecCustomerRef = ref();
    const orderPageMapRef = ref();
    const timeRef = ref();
    const stripeRef = ref();
    
    const postageInfo = ref({});
    const setPostage = () => {
      if (props.shopInfo.isEC) {
        getDoc(
          doc(db, `restaurants/${restaurantId}/ec/postage`)
        ).then((snapshot) => {
          postageInfo.value = snapshot.data() || {};
        });
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
    const showPayment = computed(() =>{
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
        props.orderInfo.total
      );
    });
    const requireAddress = computed(() => {
      return props.shopInfo.isEC || props.orderInfo.isDelivery;
    });
    const notSubmitAddress = computed(() => {
      return requireAddress.value && ecCustomerRef.value?.hasEcError;
    });
    const userMessageError = computed(() => {
      return props.shopInfo.acceptUserMessage && memo.value.length > 500;
    });

    const shopPaymentMethods = computed(() => {
      return (
        Object.keys(props.shopInfo.paymentMethods || {}).filter((key) => {
          return !!props.shopInfo.paymentMethods[key];
        }) || []
      );
    });
    const hasPaymentMethods = computed(() => {
      return shopPaymentMethods.value.length > 0;
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

    const {
      enablePromotion,
      discountPrice,
      isEnablePaymentPromotion,
    } = usePromotionData(props.orderInfo, selectedPromotion);
    
    // end of computed
    const shopInfo = computed(() => {
      return props.shopInfo;
    });
    watch(shopInfo, () => {
      setPostage();
    });

    // methods
    const updateHome = (pos: any) => {
      ecCustomerRef.value.updateHome(pos);
    };
    const updateLocation = (pos: any) => {
      if (orderPageMapRef.value) {
        orderPageMapRef.value.updateLocation(pos);
      }
    };
    // internal
    const sendPurchase = () => {
      analyticsUtil.sendPurchase(
        props.orderInfo,
        orderId.value,
        props.orderItems.map((or: any) => {
          return { ...or.item, id: or.id, quantity: or.count };
        }),
        props.shopInfo,
        restaurantId
      );
    };
    const updateDisabledPickupTime = (value: boolean) => {
      disabledPickupTime.value = value;
    };
    const handleOpenMenu = () => {
      ctx.emit("handleOpenMenu");
    };
    const handleNotAvailable = (flag: boolean) => {
      console.log("handleNotAvailable", flag);
      notAvailable.value = flag;
    };
    const handleTipChange = (_tip: number) => {
      tip = _tip;
    };
    const handleCardStateChange = (state: {[key: string]: boolean}) => {
      cardState.value = state;
    };
    // internal
    /*
    const saveLiffCustomer = async () => {
      const uid = this.user.uid;
      const data = {
        uid,
        restaurantId: restaurantId,
        name: props.orderInfo.name || "",
        orderId: orderId.value, //  (this is last)
        updatedAt: serverTimestamp(),
      };
      // TODO: not implemented yet.
    };
    */
    const handlePayment = async (payStripe: boolean) => {
      if (userMessageError.value) {
        return;
      }
      if (requireAddress.value) {
        if (ecCustomerRef.value && ecCustomerRef.value.hasEcError) {
          return;
        }
        if (ecCustomerRef.value.isSaveAddress) {
          await ecCustomerRef.value.saveAddress();
        }
      }
      const timeToPickup = props.shopInfo.isEC
        ? Timestamp.now()
        : timeRef.value.timeToPickup();
      try {
        if (payStripe) {
          isPaying.value = true;
          await stripeRef.value.createToken();
        } else {
          isPlacing.value = true;
        }
        const promotionId = isEnablePaymentPromotion(payStripe) && enablePromotion.value ? selectedPromotion.value?.promotionId : null;
        console.log( isEnablePaymentPromotion(payStripe), enablePromotion.value , promotionId)
        const { data } = await orderPlace({
          timeToPickup,
          restaurantId,
          orderId: orderId.value,
          tip: tip || 0,
          promotionId,
          payStripe,
          memo: memo.value || "",
          customerInfo: ecCustomerRef.value
            ? ecCustomerRef.value.customerInfo || {}
            : {},
        });
        /*
        if (isLiffUser) {
          await saveLiffCustomer();
        }
        */
        sendPurchase();
        store.commit("resetCart", restaurantId);
        window.scrollTo(0, 0);
      } catch (error: any) {
        // alert(JSON.stringify(error));
        console.error(error.message, error.details);
        store.commit("setErrorMessage", {
          code: "order.place",
          error,
        });
      } finally {
        isPlacing.value = false;
        isPaying.value = false;
      }
    };
    const openTransactionsAct = () => {
      ctx.emit("openTransactionsAct");
    };

    return {
      // ref
      notAvailable,
      isPaying,
      isPlacing,
      cardState,
      memo,
      disabledPickupTime,

      // refs
      ecCustomerRef,
      orderPageMapRef,
      timeRef,
      stripeRef,
      
      // computed
      stripeJCB,
      inStorePayment,
      showPayment,
      hasCustomerInfo,
      orderId,
      stripeSmallPayment,
      shippingCost,
      requireAddress,
      notSubmitAddress,
      userMessageError,
      hasPaymentMethods,
      
      selectedPromotion,
      enablePromotion,
      discountPrice,
      
      // const
      paymentMethods,

      // methods
      updateHome,
      updateLocation,
      updateDisabledPickupTime,
      handleOpenMenu,
      handleNotAvailable,
      handleTipChange,
      handleCardStateChange,
      handlePayment,
      openTransactionsAct,
    };
  },
});
</script>
