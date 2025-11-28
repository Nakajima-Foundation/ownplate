<template>
  <div>
    <template v-if="notFound === null"> </template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <AdminHeader
        class="mx-6 mt-4 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="parentUrl"
        :showSuspend="true"
        backText="button.backToOrderListPage"
        iconText="arrow_back"
        pageText="orderDetail"
      />

      <!-- Body -->
      <div class="mx-6 mt-2 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <div class="rounded-lg bg-white p-4 shadow-sm">
            <!-- Order ID, Total, Payment, and Tips -->
            <div class="text-center">
              <div class="inline-flex items-center justify-center">
                <div class="text-4xl">
                  {{ orderName }}
                </div>

                <div class="ml-4">
                  <div class="text-xs">
                    {{ $t("order.totalCharge") }}
                  </div>
                  <div v-if="hasStripe" class="text-base">
                    <a :href="search" target="stripe">
                      <div>{{ $n(orderInfo.totalCharge, "currency") }}</div>
                      <StripeStatus
                        :stripeState="orderInfo.payment.stripe"
                        class="stripe_ text-xs font-bold"
                      >
                        {{
                          $t("order.status.stripe_" + orderInfo.payment.stripe)
                        }}
                      </StripeStatus>
                    </a>
                  </div>

                  <div v-else class="text-base">
                    <div>{{ $n(orderInfo.totalCharge, "currency") }}</div>
                    <div class="text-xs font-bold text-yellow-500">
                      {{ $t("order.status.onsitePayment") }}
                    </div>
                  </div>

                  <div
                    v-if="orderInfo.tip"
                    class="text-xs font-bold text-blue-500"
                  >
                    {{ $t("order.includingTip") }}
                    {{ $n(orderInfo.tip, "currency") }}
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="orderInfo.status === order_status.waiting_payment"
              class="mt-2 inline-flex h-9 w-full justify-center rounded-lg bg-red-700/10 px-4 py-1 font-bold text-red-700"
            >
              {{ $t("admin.order.waitingPaymentWarninig") }}
            </div>
            <div v-if="hasStripe && orderInfo.payment.stripe !== 'canceled'">
              <div
                class="mt-2 inline-flex h-9 w-full justify-center rounded-lg bg-yellow-500/10 px-4 py-1 font-bold text-yellow-500"
              >
                <span class="mt-1 ml-1 text-sm">
                  {{ $t("admin.order.cardPaymentMessage") }}
                </span>
              </div>
            </div>
            <div v-else-if="orderInfo.status !== order_status.order_canceled">
              <div
                class="mt-2 inline-flex h-9 w-full justify-center rounded-lg bg-red-700/10 px-4 py-1 font-bold text-red-700"
              >
                <span class="mt-1 ml-1 text-sm">
                  {{ $t("admin.order.storePaymentMessage") }}
                </span>
              </div>
            </div>

            <div v-if="orderInfo.promotionId">
              <div
                class="mt-2 inline-flex h-9 w-full justify-center rounded-lg bg-green-600/10 px-4 py-1 font-bold text-green-600"
              >
                <span class="mt-1 ml-1 text-sm">
                  {{ $n(orderInfo.discountPrice, "currency")
                  }}{{ $t("order.discountPriceMessage") }}
                </span>
              </div>
            </div>

            <!-- Notice Delivery -->
            <div v-if="orderInfo.isDelivery" class="mt-2 text-center">
              <div
                class="inline-flex rounded-lg bg-red-700/10 p-4 text-base font-bold text-red-700"
              >
                {{ $t("admin.order.deliveryOrder") }}
              </div>
            </div>

            <!-- Note for Payment Completion -->
            <div v-if="paymentIsNotCompleted">
              <div
                class="mt-2 inline-flex h-9 w-full justify-center rounded-lg bg-yellow-500/10 px-4 py-1 font-bold text-yellow-500"
              >
                <span class="mt-1 ml-1 text-sm">
                  {{ $t("admin.order.paymentIsNotCompleted") }}
                </span>
              </div>
            </div>

            <!-- Cancel Button -->
            <div
              class="mt-4 text-center"
              v-if="
                isValidTransition('order_canceled') &&
                (paymentIsNotCompleted || !hasStripe)
              "
            >
              <button @click="openCancel()">
                <div
                  class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-red-700">delete</i>
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("admin.order.cancelButton") }}
                  </div>
                </div>
              </button>
            </div>
            <div class="mt-4 text-center" v-if="cancelStatus">
              <div
                class="inline-flex h-16 w-64 items-center justify-center rounded-full bg-red-700/10 text-red-700"
              >
                <div>
                  <div class="text-base font-extrabold">
                    {{ $t("order." + cancelStatus) }}
                  </div>
                  <div class="text-xs">
                    {{ timeOfEvents[cancelStatus] }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Cancel Popup-->
            <t-modal v-model:active="cancelPopup" width="488" scroll="keep">
              <CancelModal
                :shopInfo="shopInfo"
                :orderInfo="orderInfo"
                :orderId="orderId"
                :parentUrl="parentUrl"
                :nationalPhoneURI="nationalPhoneURI"
                :nationalPhoneNumber="nationalPhoneNumber"
                @close="closeCancel()"
              />
            </t-modal>

            <!-- Pickup Time -->
            <div class="mt-2 text-center" v-if="!cancelStatus">
              <div class="text-xs font-bold">
                {{ $t("order.timeRequested") }}
              </div>
              <div class="mt-1 text-base">
                {{ timeRequested }}
              </div>
              <div v-if="timeEstimated" class="mt-2">
                <div class="text-xs font-bold">
                  {{ $t("order.timeToPickup") }}
                </div>
                <div class="mt-1 text-base">
                  {{ timeEstimated }}
                </div>
              </div>
            </div>

            <!-- Estimated Time Picker -->
            <div v-if="showTimePicker" class="mt-4 flex flex-col items-center">
              <div class="text-xs font-bold">
                {{ $t("order.timeToPickup") }}
              </div>
              <select
                v-model="timeOffset"
                class="mt-1 mt-2 rounded-lg border border-teal-400 bg-white px-3 py-2 hover:border-teal-400 focus:ring-teal-400"
              >
                <option
                  v-for="time in estimatedTimes"
                  :value="time.offset"
                  :key="time.offset"
                >
                  {{ time.display }}
                </option>
              </select>
            </div>
          </div>

          <div class="mt-2 rounded-lg bg-white p-4 shadow-sm">
            <!-- Phone Number -->
            <div class="mt-2 text-center">
              <div class="text-xs font-bold" v-if="orderInfo.phoneNumber">
                {{ $t("sms.phonenumber") }}
              </div>
              <!--Line icon -->
              <div class="text-xs font-bold" v-if="orderInfo.isLiff">
                <i
                  class="fab fa-line mr-2 text-lg"
                  style="color: #4ec263"
                  v-if="orderInfo.isLiff"
                />LINE ({{ orderInfo.uid.slice(5, 15) }})
              </div>
              <div class="mt-1 text-base">
                <div v-if="orderInfo.phoneNumber">
                  <a :href="nationalPhoneURI" class="text-base font-bold">{{
                    nationalPhoneNumber
                  }}</a>
                </div>
                <div class="text-base">{{ orderInfo.name }}</div>
              </div>
              <div>
                {{ $t("order.orderTimes") }}:
                {{
                  $t("order.orderTimesUnit", { count: userLog.counter || 0 }, 0)
                }}
                / {{ $t("order.cancelTimes") }}:
                {{
                  $t(
                    "order.cancelTimesUnit",
                    { count: userLog.cancelCounter || 0 },
                    0,
                  )
                }}
              </div>
              <div>
                <div
                  v-if="isWarningOrder"
                  class="inline-flex rounded-lg bg-red-700/10 p-4 text-center"
                >
                  <div class="text-base font-bold text-red-700">
                    {{ $t("order.continuousOrder") }}<br />
                    {{ $t("order.lastOrder") }}:
                    {{
                      userLog.lastOrder
                        ? moment(userLog.lastOrder.toDate()).format(
                            "YYYY/MM/DD HH:mm",
                          )
                        : "--"
                    }}<br />
                    {{ $t("order.thisOrder") }}:
                    {{
                      orderInfo.timePlaced
                        ? moment(orderInfo.timePlaced.toDate()).format(
                            "YYYY/MM/DD HH:mm",
                          )
                        : "--"
                    }}
                  </div>
                </div>
                <div v-else>
                  {{ $t("order.lastOrder") }}:
                  {{
                    userLog.lastOrder
                      ? moment(userLog.lastOrder.toDate()).format(
                          "YYYY/MM/DD HH:mm",
                        )
                      : "--"
                  }}
                </div>
              </div>
            </div>
            <div class="mt-2 text-center">
              <router-link
                :to="
                  '/admin/restaurants/' +
                  restaurantId +
                  '/userhistory/' +
                  orderInfo.uid +
                  '?orderId=' +
                  orderId
                "
              >
                <div
                  class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons text-op-teal mr-2 text-lg">face</i>
                  <span class="text-op-teal text-sm font-bold">{{
                    $t("order.customerOrderHistory")
                  }}</span>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Print for debug-->
          <div
            class="mt-2 rounded-lg bg-white p-4 text-center shadow-sm"
            v-if="isDev"
          >
            <div class="mt-2">
              <button @click="download()">
                <div
                  class="inline-flex h-16 w-64 items-center justify-center rounded-full bg-black/5"
                >
                  Download
                </div>
              </button>
            </div>
          </div>

          <!-- Print for debug-->
          <div
            class="mt-2 rounded-lg bg-white p-4 text-center shadow-sm"
            v-if="
              orderInfo.status !== order_status.order_placed &&
              shopInfo.enablePrinter
            "
          >
            <div>
              <button @click="print()">
                <div
                  class="inline-flex h-16 w-64 items-center justify-center rounded-full bg-black/5"
                >
                  {{ $t("order.print") }}
                </div>
              </button>
            </div>
          </div>

          <div class="mt-2 rounded-lg bg-white p-4 shadow-sm">
            <!-- Order Status -->
            <div>
              <div
                v-for="orderState in orderStates"
                :key="orderState"
                class="mt-4 text-center"
              >
                <button
                  :disabled="
                    !isValidTransition(orderState) || updating === orderState
                  "
                  @click="handleChangeStatus(orderState)"
                  class="mx-2 mb-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <OrderState
                    :orderState="
                      order_status[orderState] === orderInfo.status
                        ? orderState
                        : ''
                    "
                    class="inline-flex h-16 w-64 items-center justify-center rounded-full"
                  >
                    <ButtonLoading v-if="updating === orderState" />
                    <div>
                      <div class="text-base font-extrabold">
                        {{
                          $t(
                            "order.status." +
                              convOrderStateForText(orderState, orderInfo),
                          )
                        }}
                      </div>
                      <div class="text-xs">
                        {{ timeOfEvents[orderState] }}
                      </div>
                    </div>
                  </OrderState>
                </button>
              </div>
            </div>

            <!-- Payment Cancel Button -->
            <div class="mt-4 text-center">
              <button
                v-if="paymentIsNotCompleted"
                @click="openPaymentCancel"
                class="cursor-pointer"
              >
                <div
                  class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-red-700"
                    >credit_card</i
                  >
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("admin.order.paymentCancelButton") }}
                  </div>
                </div>
              </button>
            </div>

            <!-- Payment Cancel Popup-->
            <t-modal
              v-model:active="paymentCancelPopup"
              width="488"
              scroll="keep"
            >
              <PaymentCancelModal
                :shopInfo="shopInfo"
                :orderInfo="orderInfo"
                :orderId="orderId"
                :parentUrl="parentUrl"
                :nationalPhoneURI="nationalPhoneURI"
                :nationalPhoneNumber="nationalPhoneNumber"
                @close="closePaymentCancel()"
              />
            </t-modal>
          </div>
        </div>

        <!-- Right -->
        <div class="mt-4 lg:mt-0">
          <div class="grid grid-cols-1 space-y-4">
            <!-- Message from customer -->
            <div v-if="hasMemo" class="rounded-lg bg-white p-4 shadow-sm">
              <div class="text-xs font-bold text-black/60">
                {{ $t("admin.order.messageFromCustomer") }}
              </div>
              <div class="mt-2 text-base">
                {{ orderInfo.memo }}
              </div>
            </div>

            <!-- Order Details -->
            <order-info
              :shopInfo="shopInfo || {}"
              :orderItems="orderItems"
              :orderInfo="isOrderChange ? editable_order_info : orderInfo || {}"
              :editable="isOrderChange"
              :editedAvailableOrders="editedAvailableOrders"
              @update="updateEnable"
            ></order-info>

            <!-- Order Changed -->
            <div v-if="orderInfo.orderUpdatedAt">
              <div
                class="rounded-lg bg-white p-4 text-center shadow-sm"
                v-if="orderInfo.orderUpdatedAt"
              >
                <div>{{ $t("admin.order.changeOrderDetail") }}</div>
                {{ timeStampToText(orderInfo.orderUpdatedAt) }}
                {{ $t("admin.order.alreadyChanged") }}
              </div>
            </div>

            <!-- Order Change -->
            <div
              class="rounded-lg bg-white p-4 text-center shadow-sm"
              v-if="availableOrderChange"
            >
              <div>{{ $t("admin.order.changeOrderDetail") }}</div>
              <div class="mt-4">
                <button @click="toggleIsOrderChange" class="cursor-pointer">
                  <div
                    class="inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6"
                  >
                    <div class="text-base font-bold text-white">
                      {{
                        isOrderChange
                          ? $t("admin.order.cancelOrderChange")
                          : $t("admin.order.willOrderChange")
                      }}
                    </div>
                  </div>
                </button>
              </div>
              <div class="mt-4">
                <button
                  @click="handleOrderChange"
                  :disabled="!availableChangeButton || changing"
                  class="mx-2 mb-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  v-if="isOrderChange"
                >
                  <div
                    class="inline-flex h-12 items-center justify-center rounded-full bg-red-700 px-6"
                  >
                    <ButtonLoading v-if="changing" />
                    <div class="text-base font-bold text-white">
                      {{ $t("admin.order.confirmOrderChange") }}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Customer info -->
            <CustomerInfo
              :shopInfo="shopInfo"
              :customer="customer"
              :phoneNumber="nationalPhoneNumber"
              v-if="shopInfo && (shopInfo.isEC || orderInfo.isDelivery)"
            />
          </div>
        </div>
      </div>
    </template>
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

import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  collection,
  query,
  where,
  documentId,
  Timestamp,
} from "firebase/firestore";

import { orderUpdate, orderChange } from "@/lib/firebase/functions";

import {
  order_status,
  possible_transitions,
  timeEventMapping,
} from "@/config/constant";
import { nameOfOrder } from "@/utils/strings";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";
import moment from "moment-timezone";

import { ownPlateConfig } from "@/config/project";

import NotFound from "@/components/NotFound.vue";
import OrderInfo from "@/app/user/OrderPage/OrderInfo.vue";
import CustomerInfo from "@/components/CustomerInfo.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";
import OrderState from "@/components/OrderStatus.vue";
import StripeStatus from "@/components/StripeStatus.vue";

import ButtonLoading from "@/components/form/Loading.vue";
import CancelModal from "@/app/admin/Order/CancelModal.vue";
import PaymentCancelModal from "@/app/admin/Order/PaymentCancelModal.vue";

import { costCal } from "@/utils/commonUtils";
import { downloadOrderPdf, printOrder, data2UrlSchema } from "@/lib/pdf/pdf2";

import { checkShopAccount } from "@/utils/userPermission";
import {
  doc2data,
  useAdminUids,
  useRestaurantId,
  notFoundResponse,
  stripeRegion,
  convOrderStateForText,
  isDev,
  isEmpty,
  // isNull,
  getShopOwner,
  getOrderItems,
  arrayChunk,
  array2obj,
  defaultTitle,
} from "@/utils/utils";

import { useUserStore } from "@/store/user";
import { useGeneralStore } from "@/store";
import { useDialogStore } from "@/store/dialog";

import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useHead } from "@unhead/vue";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { OrderInfoData } from "@/models/orderInfo";
import { ShopOwnerData } from "@/models/ShopOwner";

export default defineComponent({
  components: {
    OrderInfo,
    AdminHeader,
    CustomerInfo,
    NotFound,
    ButtonLoading,
    CancelModal,
    PaymentCancelModal,
    OrderState,
    StripeStatus,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  // if user is not signined, render login
  // if user is not owner, render 404
  // if restaurant don't have order, render 404.

  setup(props) {
    const userStore = useUserStore();
    const generalStore = useGeneralStore();
    const dialogStore = useDialogStore();
    const route = useRoute();
    const router = useRouter();
    const { d } = useI18n({ useScope: "global" });
    const menuObj = ref({});
    const orderInfo = ref<OrderInfoData>({} as OrderInfoData);
    const customer = ref({});
    const postageInfo = ref({});
    const deliveryData = ref<any>({});
    const shopOwner = ref<ShopOwnerData | null>(null);
    const userLog = ref<any>({});

    const updating = ref("");
    const changing = ref(false);

    const cancelPopup = ref(false);
    const paymentCancelPopup = ref(false);
    const isOrderChange = ref(false);

    const notFound = ref<boolean | null>(null);
    const timeOffset = ref(0);
    const editedAvailableOrders = ref<boolean[]>([]);
    const restaurantId = useRestaurantId();

    const { ownerUid, uid } = useAdminUids();

    useHead(() => ({
      title: props.shopInfo.restaurantName
        ? [
            "Admin Order Info",
            props.shopInfo.restaurantName,
            defaultTitle,
          ].join(" / ")
        : defaultTitle,
    }));

    if (
      !checkShopAccount(props.shopInfo, ownerUid.value) &&
      !userStore.isSuperAdmin
    ) {
      return notFoundResponse;
    }
    if (props.shopInfo.isEC) {
      getDoc(doc(db, `restaurants/${restaurantId.value}/ec/postage`)).then(
        (snapshot) => {
          postageInfo.value = snapshot.data() || {};
        },
      );
    }
    if (props.shopInfo.enableDelivery) {
      getDoc(doc(db, `restaurants/${restaurantId.value}/delivery/area`)).then(
        (snapshot) => {
          deliveryData.value = snapshot.data() || {};
        },
      );
    }
    const orderId = computed(() => {
      return route.params.orderId as string;
    });

    const order_detacher = onSnapshot(
      doc(db, `restaurants/${restaurantId.value}/orders/${orderId.value}`),
      async (order) => {
        if (!order.exists()) {
          notFound.value = true;
          return;
        }
        const order_data = order.data();
        orderInfo.value = order_data as OrderInfoData;
        if (orderInfo.value.isDelivery || props.shopInfo.isEC) {
          const tmpCustomer = await getDoc(
            doc(
              db,
              `restaurants/${restaurantId.value}/orders/${orderId.value}/customer/data`,
            ),
          );
          customer.value =
            tmpCustomer.data() || orderInfo.value?.customerInfo || {};
        }
        notFound.value = false;
      },
      () => {
        notFound.value = true;
      },
    );

    getShopOwner(uid.value).then((data) => {
      shopOwner.value = data;
    });
    onUnmounted(() => {
      order_detacher();
    });

    watch(orderInfo, () => {
      getDoc(
        doc(
          db,
          `restaurants/${restaurantId.value}/userLog/${orderInfo.value.uid}`,
        ),
      ).then((res) => {
        if (res.exists()) {
          userLog.value = res.data();
        }
      });
      const menuRestaurantId = restaurantId.value;
      const menuIds = Object.keys(orderInfo.value.menuItems);
      arrayChunk(menuIds, 10).forEach((arr) => {
        getDocs(
          query(
            collection(db, `restaurants/${menuRestaurantId}/menus`),
            where(documentId(), "in", arr),
          ),
        ).then((menu) => {
          if (!menu.empty) {
            const tmpMenuObj = array2obj(menu.docs.map(doc2data("menu")));
            menuObj.value = Object.assign({}, { ...menuObj.value }, tmpMenuObj);
          }
        });
      });
    });

    const orderUpdateInterval = computed(() => {
      if (orderInfo.value.orderPlacedAt && userLog.value.lastUpdatedAt) {
        const intervalHour =
          (orderInfo.value.orderPlacedAt - userLog.value.lastUpdatedAt) / 3600;
        return intervalHour;
      }
      return -1000000;
    });
    const orderPickupInterval = computed(() => {
      if (orderInfo.value.timeCreated && userLog.value.lastUpdatedAt) {
        const intervalHour =
          (orderInfo.value.timeCreated - userLog.value.lastUpdatedAt) / 3600;
        return intervalHour;
      }
      return -1000000;
    });
    const isWarningOrder = computed(() => {
      if (orderUpdateInterval.value < 4 && orderUpdateInterval.value > -4) {
        if (orderUpdateInterval.value !== orderUpdateInterval.value) {
          return true;
        }
      }

      if (orderPickupInterval.value === 0) {
        return false;
      }
      if (orderPickupInterval.value < 4 && orderPickupInterval.value > -4) {
        return true;
      }
      return false;
    });

    const hasMemo = computed(() => {
      return orderInfo.value && !isEmpty(orderInfo.value.memo);
    });
    const possibleTransitions = computed(() => {
      return possible_transitions[orderInfo.value.status] || {};
    });
    const cancelStatus = computed(() => {
      if (orderInfo.value.status === order_status.order_canceled) {
        if (orderInfo.value.orderCustomerCanceledAt) {
          return "order_canceled_by_customer";
        }
        return "order_canceled_by_restaurant";
      }
      return false;
    });
    const orderItems = computed(() => {
      return getOrderItems(orderInfo.value, menuObj.value);
    });
    watch(orderItems, () => {
      Object.keys(orderItems.value).forEach((key: string) => {
        editedAvailableOrders.value[key] = true;
      });
    });
    const timeStampToText = (timestamp: Timestamp) => {
      if (timestamp) {
        return d(timestamp.toDate(), "long");
      }
      return "";
    };
    const timeOfEvents = computed(() => {
      const mapping = Object.keys(timeEventMapping).reduce((tmp, key) => {
        tmp[key] = timeStampToText(orderInfo.value[timeEventMapping[key]]);
        return tmp;
      }, {});
      return mapping;
    });
    const orderName = computed(() => {
      return nameOfOrder(orderInfo.value);
    });
    const search = computed(() => {
      const value = encodeURIComponent(
        orderInfo.value.description || orderName.value,
      );
      return `${ownPlateConfig.stripe.search}?query=${value}`;
    });

    const showTimePicker = computed(() => {
      return orderInfo.value.status === order_status.order_placed;
    });
    const estimatedTimes = computed(() => {
      if (!orderInfo.value.timePlaced) {
        return [];
      }
      const time = orderInfo.value.timePlaced.toDate().getTime();
      return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120].map(
        (offset) => {
          const date = new Date(time + offset * 60000);
          return {
            offset,
            display: `${d(date, "time")}`,
          };
        },
      );
    });
    const timeRequested = computed(() => {
      if (!orderInfo.value.timePlaced) {
        return "";
      }
      const date = orderInfo.value.timePlaced.toDate();
      return d(date, "long");
    });
    const timeEstimated = computed(() => {
      if (orderInfo.value.timeEstimated) {
        const date = orderInfo.value.timeEstimated.toDate();
        return d(date, "long");
      }
      return undefined; // backward compatibility
    });
    const hasStripe = computed(() => {
      return orderInfo.value.payment && orderInfo.value.payment.stripe;
    });
    const paymentIsNotCompleted = computed(() => {
      return (
        // hasStripe.value && orderInfo.value.status < order_status.ready_to_pickup
        hasStripe.value && orderInfo.value.payment?.stripe === "pending"
      );
    });
    const phoneNumber = computed(() => {
      if (orderInfo.value && orderInfo.value.phoneNumber) {
        return parsePhoneNumber(orderInfo.value.phoneNumber);
      }
      return "";
    });
    const nationalPhoneNumber = computed(() => {
      return phoneNumber.value ? formatNational(phoneNumber.value) : "";
    });
    const nationalPhoneURI = computed(() => {
      return phoneNumber.value ? formatURL(phoneNumber.value) : "";
    });
    const parentUrl = computed(() => {
      if (props.shopInfo.isEC) {
        return `/admin/restaurants/${restaurantId.value}/history`;
      }
      const day = orderInfo.value.timePlaced
        ? moment(orderInfo.value.timePlaced.toDate()).format("YYYY-MM-DD")
        : null;
      return `/admin/restaurants/${restaurantId.value}/orders?day=${day}`;
    });
    const orderStates = [
      "order_placed",
      "order_accepted",
      "ready_to_pickup",
      "transaction_complete",
    ];

    // for editable order
    const edited_available_order_info = computed(() => {
      const ret: { menuId: string; index: number }[] = [];
      Object.keys(editedAvailableOrders.value).forEach((key: string) => {
        if (editedAvailableOrders.value[key]) {
          const indexes = orderItems.value[key]?.orderIndex;
          if (indexes) {
            ret.push({ menuId: indexes[0], index: Number(indexes[1]) });
          }
        }
      });
      return ret;
    });

    const editable_order_info = computed(() => {
      const tmpMenuObj = orderInfo.value.menuItems;
      const multiple = stripeRegion.multiple;
      const ret = edited_available_order_info.value.reduce(
        (tmp, info) => {
          const { menuId, index } = info;
          const menu = tmpMenuObj[menuId];
          if (menu.tax === "alcohol") {
            tmp.alcohol_sub_total =
              tmp.alcohol_sub_total + orderInfo.value.prices[menuId][index];
          } else {
            tmp.food_sub_total =
              tmp.food_sub_total + orderInfo.value.prices[menuId][index];
          }
          return tmp;
        },
        {
          sub_total: 0,
          tax: 0,
          food_sub_total: 0,
          alcohol_sub_total: 0,
          food_tax: 0,
          alcohol_tax: 0,
          total: 0,
        },
      );
      ret.sub_total = ret.food_sub_total + ret.alcohol_sub_total;

      const { alcoholTax, foodTax, inclusiveTax } = props.shopInfo;
      if (inclusiveTax) {
        ret.food_tax =
          Math.round(
            ret.food_sub_total * (1 - 1 / (1 + foodTax / 100)) * multiple,
          ) / multiple;
        ret.alcohol_tax =
          Math.round(
            ret.alcohol_sub_total * (1 - 1 / (1 + alcoholTax / 100)) * multiple,
          ) / multiple;
        ret.tax = ret.food_tax + ret.alcohol_tax;
        ret.total = ret.sub_total;
      } else {
        ret.food_tax =
          Math.round(((ret.food_sub_total * foodTax) / 100) * multiple) /
          multiple;
        ret.alcohol_tax =
          Math.round(((ret.alcohol_sub_total * alcoholTax) / 100) * multiple) /
          multiple;
        ret.tax = ret.food_tax + ret.alcohol_tax;
        ret.total = ret.sub_total + ret.tax;
      }
      const shippingCost = costCal(
        postageInfo.value,
        orderInfo.value?.customerInfo?.prefectureId as number,
        ret.total,
      );

      const deliveryFee = (() => {
        // console.log(deliveryData.value.enableDeliveryFree, ret.total , deliveryData.value.deliveryThreshold);
        if (!props.shopInfo.enableDelivery) {
          return 0;
        }
        if (!orderInfo.value.isDelivery) {
          return 0;
        }
        if (
          deliveryData.value.enableDeliveryFree &&
          (ret.total || 0) >= deliveryData.value.deliveryFreeThreshold
        ) {
          return 0;
        }
        return deliveryData.value.deliveryFee;
      })();
      return Object.assign({}, orderInfo.value, ret, {
        shippingCost,
        deliveryFee,
      });
    });
    const notDeliveryOrTotalCanDelivery = computed(() => {
      if (!orderInfo.value.isDelivery) {
        return true;
      }
      return (
        editable_order_info.value.total >= deliveryData.value.deliveryThreshold
      );
    });
    const availableOrderChange = computed(() => {
      return false;
      /*
      return (
        orderInfo.value &&
        orderInfo.value.status === order_status.order_placed &&
        isNull(orderInfo.value.orderUpdatedAt) &&
        editedAvailableOrders.value.length > 0
      );
      */
    });
    const availableChangeButton = computed(() => {
      return (
        edited_available_order_info.value.length !==
          editedAvailableOrders.value.length &&
        edited_available_order_info.value.length > 0 &&
        notDeliveryOrTotalCanDelivery.value
      );
    });

    const updateEnable = (value: [number, boolean]) => {
      const newData = editedAvailableOrders.value.concat();
      newData[value[0] as number] = value[1];
      editedAvailableOrders.value = newData;
    };
    const toggleIsOrderChange = () => {
      isOrderChange.value = !isOrderChange.value;
    };
    const isValidTransition = (newStatus: string) => {
      const newStatusValue = order_status[newStatus];
      return possibleTransitions.value[newStatusValue];
    };
    const download = () => {
      downloadOrderPdf(props.shopInfo, orderInfo.value, orderItems.value);
    };
    const print = async () => {
      const data = await printOrder(
        props.shopInfo,
        orderInfo.value,
        orderItems.value,
      );
      const passprnt_uri = data2UrlSchema(data, "2");
      location.href = passprnt_uri;
    };
    const getEestimateTime = () => {
      const time = orderInfo.value.timePlaced.toDate().getTime();
      const date = new Date(time + timeOffset.value * 60000);
      return Timestamp.fromDate(date);
    };
    const handleChangeStatus = async (statusKey: string) => {
      const newStatus = order_status[statusKey];
      if (newStatus === orderInfo.value.status) {
        console.log("same status - no need to process");
        return;
      }
      updating.value = statusKey;
      try {
        generalStore.setLoading(true);
        const params = {
          restaurantId: restaurantId.value,
          orderId: orderId.value,
          status: newStatus,
        } as any;
        if (timeOffset.value > 0) {
          params.timeEstimated = getEestimateTime();
        }
        const { data } = await orderUpdate(params);
        // console.log("update", data);
        if (data.result) {
          router.push(parentUrl.value);
        } else {
          if (data.type === "StripeCardError") {
            dialogStore.setErrorMessage({
              code: "order.updateCard",
              message2: "errorPage.message.cardError",
            });
          } else {
            dialogStore.setErrorMessage({
              code: "order.update",
            });
          }
        }
      } catch (error: any) {
        console.error(error.message, error.details);
        dialogStore.setErrorMessage({
          code: "order.update",
          error,
        } as any);
      } finally {
        generalStore.setLoading(false);
        updating.value = "";
      }
    };
    const handleOrderChange = () => {
      dialogStore.setAlert({
        title: "admin.order.confirmOrderChange",
        code: "admin.order.updateOrderMessage",
        callback: async () => {
          try {
            changing.value = true;
            generalStore.setLoading(true);
            const params = {
              restaurantId: restaurantId.value,
              orderId: orderId.value,
              newOrder: edited_available_order_info.value,
            };

            await orderChange(params);
            isOrderChange.value = false;

            // console.log("update", data);
          } catch (error: any) {
            console.error(error.message, error.details);
            dialogStore.setErrorMessage({
              code: "order.update",
              error,
            } as any);
          } finally {
            generalStore.setLoading(false);
            changing.value = false;
          }
        },
      });
    };
    const classOf = (statusKey: string) => {
      if (order_status[statusKey] === orderInfo.value.status) {
        return statusKey;
      }
      return "bg-black/5";
    };
    const openCancel = () => {
      cancelPopup.value = true;
    };
    const closeCancel = () => {
      cancelPopup.value = false;
    };
    const openPaymentCancel = () => {
      console.log("openPaymentCancel");
      paymentCancelPopup.value = true;
    };
    const closePaymentCancel = () => {
      console.log("closePaymentCancel");
      paymentCancelPopup.value = false;
    };
    return {
      order_status,
      orderId,

      menuObj,
      orderInfo,
      customer,
      postageInfo,
      deliveryData,
      shopOwner,
      userLog,

      updating,
      changing,

      cancelPopup,
      paymentCancelPopup,
      isOrderChange,

      notFound,
      timeOffset,
      editedAvailableOrders,

      timeOfEvents,
      timeStampToText,

      orderName,
      search,
      showTimePicker,
      estimatedTimes,
      timeRequested,
      timeEstimated,
      hasStripe,
      paymentIsNotCompleted,

      nationalPhoneNumber,
      nationalPhoneURI,
      parentUrl,

      orderStates,
      editable_order_info,
      availableOrderChange,
      availableChangeButton,

      orderItems,
      isWarningOrder,
      hasMemo,
      cancelStatus,

      isDev,

      // methods
      updateEnable,
      toggleIsOrderChange,
      isValidTransition,
      download,
      print,
      handleChangeStatus,
      handleOrderChange,
      classOf,

      openCancel,
      closeCancel,
      openPaymentCancel,
      closePaymentCancel,

      convOrderStateForText,

      moment,
      restaurantId,
    };
  },
});
</script>
