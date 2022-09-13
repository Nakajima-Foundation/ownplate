<template>
  <div>
    <template v-if="notFound === null"> </template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else>
      <!-- Header -->
      <AdminHeader
        class="mt-6 mx-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="parentUrl"
        :showSuspend="true"
        :isInMo="isInMo"
        :moPrefix="moPrefix"
      />

      <!-- Body -->
      <div
        v-if="orderInfo.status === order_status.transaction_hide"
        class="mt-6 mx-6"
      >
        <div class="bg-white rounded-lg shadow p-4">
          <div>{{ $t("order.status.transaction_hide") }}</div>
        </div>
      </div>

      <div v-else class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <div class="bg-white shadow rounded-lg p-4">
            <!-- Order ID, Total, Payment, and Tips -->
            <div class="text-center">
              <div class="inline-flex justify-center items-center">
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
                      <div
                        :class="
                          'text-xs font-bold stripe_' + orderInfo.payment.stripe
                        "
                      >
                        {{
                          $t("order.status.stripe_" + orderInfo.payment.stripe)
                        }}
                      </div>
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

            <!-- Notice Delivery -->
            <div v-if="orderInfo.isDelivery" class="text-center mt-2">
              <div
                class="text-base font-bold text-red-700 bg-red-700 bg-opacity-10 rounded-lg p-4 inline-flex"
              >
                {{ $t("admin.order.deliveryOrder") }}
              </div>
            </div>

            <!-- Note for Payment Completion -->
            <div
              v-if="paymentIsNotCompleted"
              class="mt-4 bg-yellow-500 bg-opacity-10 rounded-lg p-4 text-sm font-bold text-yellow-500"
            >
              {{ $t("admin.order.paymentIsNotCompleted") }}
            </div>

            <!-- Cancel Button -->
            <div class="mt-6 text-center">
              <b-button
                class="b-reset-tw"
                v-if="
                  isValidTransition('order_canceled') &&
                  (paymentIsNotCompleted || !hasStripe)
                "
                @click="openCancel()"
              >
                <div
                  class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
                >
                  <i class="material-icons text-lg mr-2 text-red-700">delete</i>
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("admin.order.cancelButton") }}
                  </div>
                </div>
              </b-button>

              <b-button v-if="cancelStatus" class="b-reset-tw">
                <div
                  class="inline-flex justify-center items-center rounded-full h-16 w-64 bg-red-700 bg-opacity-10 text-red-700"
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
              </b-button>
            </div>

            <!-- Cancel Popup-->
            <b-modal :active.sync="cancelPopup" :width="488" scroll="keep">
              <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
                <!-- Title -->
                <div class="text-xl font-bold text-black text-opacity-40">
                  {{ $t("admin.order.cancelTitle") }}
                </div>

                <!-- Message -->
                <div class="mt-6 text-base">
                  {{ $t("admin.order.cancelMessage") }}
                </div>

                <!-- Call -->
                <div v-if="orderInfo.phoneNumber" class="mt-6 text-center">
                  <div>
                    <a
                      :href="nationalPhoneURI"
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full border-2 border-op-teal"
                    >
                      <div class="text-base font-bold text-op-teal">
                        {{ nationalPhoneNumber }}
                      </div>
                    </a>
                  </div>
                  <div class="font-bold mt-2">
                    {{ orderInfo.name }}
                  </div>
                </div>

                <!-- Cancel -->
                <div class="mt-4 text-center">
                  <b-button
                    :loading="updating === 'order_canceled'"
                    @click="handleCancel"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                      <div class="text-base font-bold text-white">
                        {{ $t("admin.order.delete") }}
                      </div>
                    </div>
                  </b-button>
                  <div class="mt-2 text-sm font-bold text-red-700">
                    {{ $t("admin.order.deleteConfirm") }}
                  </div>
                </div>

                <!-- Close -->
                <div class="mt-6 text-center">
                  <a
                    @click="closeCancel()"
                    class="inline-flex justify-center items-center h-12 rounded-full px-6 bg-black bg-opacity-5"
                    style="min-width: 8rem"
                  >
                    <div class="text-base font-bold text-black text-opacity-60">
                      {{ $t("menu.close") }}
                    </div>
                  </a>
                </div>
              </div>
            </b-modal>

            <!-- Pickup Time -->
            <div class="mt-2 text-center">
              <div class="text-xs font-bold">
                {{ $t("order.timeRequested") }}
              </div>
              <div class="text-base mt-1">
                {{ timeRequested }}
              </div>
              <div v-if="timeEstimated" class="mt-2">
                <div class="text-xs font-bold">
                  {{ $t("order.timeToPickup") }}
                </div>
                <div class="text-base mt-1">
                  {{ timeEstimated }}
                </div>
              </div>
            </div>

            <!-- Estimated Time Picker -->
            <div v-if="showTimePicker" class="mt-4 flex flex-col items-center">
              <div class="text-xs font-bold">
                {{ $t("order.timeToPickup") }}
              </div>
              <b-select class="mt-2" v-model="timeOffset">
                <option
                  v-for="time in estimatedTimes"
                  :value="time.offset"
                  :key="time.offset"
                >
                  {{ time.display }}
                </option>
              </b-select>
            </div>
          </div>

          <div class="bg-white shadow rounded-lg p-4 mt-2">
            <!-- Phone Number -->
            <div class="mt-2 text-center">
              <div class="text-xs font-bold" v-if="orderInfo.phoneNumber">
                {{ $t("sms.phonenumber") }}
              </div>
              <!--Line icon -->
              <div class="text-xs font-bold" v-if="orderInfo.isLiff">
                <i
                  class="fab fa-line text-lg mr-2"
                  style="color: #4ec263"
                  v-if="orderInfo.isLiff"
                />LINE ({{ orderInfo.uid.slice(5, 15) }})
              </div>
              <div class="text-base mt-1">
                <div v-if="orderInfo.phoneNumber">
                  <a :href="nationalPhoneURI" class="text-base font-bold">{{
                    nationalPhoneNumber
                  }}</a>
                </div>
                <div class="text-base">{{ orderInfo.name }}</div>
              </div>
              <div>
                {{ $t("order.orderTimes") }}:
                {{ $tc("order.orderTimesUnit", userLog.counter || 0) }} /
                {{ $t("order.cancelTimes") }}:
                {{ $tc("order.cancelTimesUnit", userLog.cancelCounter || 0) }}
              </div>
              <div>
                <div
                  v-if="isWarningOrder"
                  class="bg-red-700 bg-opacity-10 rounded-lg p-4 text-center inline-flex"
                >
                  <div class="text-base font-bold text-red-700">
                    {{ $t("order.continuousOrder") }}<br />
                    {{ $t("order.lastOrder") }}:
                    {{
                      userLog.lastOrder
                        ? moment(userLog.lastOrder.toDate()).format(
                            "YYYY/MM/DD HH:mm"
                          )
                        : "--"
                    }}<br />
                    {{ $t("order.thisOrder") }}:
                    {{
                      orderInfo.timePlaced
                        ? moment(orderInfo.timePlaced.toDate()).format(
                            "YYYY/MM/DD HH:mm"
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
                          "YYYY/MM/DD HH:mm"
                        )
                      : "--"
                  }}
                </div>
              </div>
            </div>
            <div class="mt-6 text-center">
              <router-link
                :to="
                  '/admin/restaurants/' +
                  restaurantId() +
                  '/userhistory/' +
                  orderInfo.uid +
                  '?orderId=' +
                  orderId
                "
              >
                <div
                  class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
                >
                  <i class="material-icons text-lg text-op-teal mr-2">face</i>
                  <span class="text-sm font-bold text-op-teal">{{
                    $t("order.customerOrderHistory")
                  }}</span>
                </div>
              </router-link>
            </div>
          </div>
          <!-- Print -->
          <div
            class="bg-white shadow rounded-lg p-4 mt-2 text-center"
            v-if="isDev"
          >
            <div>
              <b-button @click="print()" class="b-reset-tw">
                <div
                  class="inline-flex justify-center items-center rounded-full h-16 w-64 light"
                >
                  Print
                </div>
              </b-button>
            </div>
            <div class="mt-2">
              <b-button @click="download()" class="b-reset-tw">
                <div
                  class="inline-flex justify-center items-center rounded-full h-16 w-64 light"
                >
                  Download
                </div>
              </b-button>
            </div>
          </div>

          <div class="bg-white shadow rounded-lg p-4 mt-2">
            <!-- Order Status -->
            <div>
              <div
                v-for="orderState in orderStates"
                :key="orderState"
                class="mt-4 text-center"
              >
                <b-button
                  :loading="updating === orderState"
                  :disabled="!isValidTransition(orderState)"
                  @click="handleChangeStatus(orderState)"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex justify-center items-center rounded-full h-16 w-64"
                    :class="classOf(orderState)"
                  >
                    <div>
                      <div class="text-base font-extrabold">
                        {{
                          $t(
                            "order.status." +
                              convOrderStateForText(orderState, orderInfo)
                          )
                        }}
                      </div>
                      <div class="text-xs">
                        {{ timeOfEvents[orderState] }}
                      </div>
                    </div>
                  </div>
                </b-button>
              </div>
            </div>

            <!-- Payment Cancel Button -->
            <div class="mt-6 text-center">
              <b-button
                v-if="paymentIsNotCompleted"
                @click="openPaymentCancel"
                class="b-reset-tw"
              >
                <div
                  class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
                >
                  <i class="material-icons text-lg mr-2 text-red-700"
                    >credit_card</i
                  >
                  <div class="text-sm font-bold text-red-700">
                    {{ $t("admin.order.paymentCancelButton") }}
                  </div>
                </div>
              </b-button>
            </div>

            <!-- Payment Cancel Popup-->
            <b-modal
              :active.sync="paymentCancelPopup"
              :width="488"
              scroll="keep"
            >
              <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
                <!-- Title -->
                <div class="text-xl font-bold text-black text-opacity-40">
                  {{ $t("admin.order.paymentCancelTitle") }}
                </div>

                <!-- Message -->
                <div class="mt-6 text-base">
                  {{ $t("admin.order.paymentCancelMessage") }}
                </div>

                <!-- Call -->
                <div v-if="orderInfo.phoneNumber" class="mt-6 text-center">
                  <div>
                    <a
                      :href="nationalPhoneURI"
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full border-2 border-op-teal"
                    >
                      <div class="text-base font-bold text-op-teal">
                        {{ nationalPhoneNumber }}
                      </div>
                    </a>
                  </div>
                  <div class="font-bold mt-2">
                    {{ orderInfo.name }}
                  </div>
                </div>

                <!-- Cancel -->
                <div class="mt-4 text-center">
                  <b-button
                    :loading="updating === 'payment_canceled'"
                    @click="handlePaymentCancel"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                      <div class="text-base font-bold text-white">
                        {{ $t("admin.order.paymentCancel") }}
                      </div>
                    </div>
                  </b-button>
                  <div class="mt-2 text-sm font-bold text-red-700">
                    {{ $t("admin.order.paymentCancelConfirm") }}
                  </div>
                </div>

                <!-- Close -->
                <div class="mt-6 text-center">
                  <a
                    @click="closePaymentCancel()"
                    class="inline-flex justify-center items-center h-12 rounded-full px-6 bg-black bg-opacity-5"
                    style="min-width: 8rem"
                  >
                    <div class="text-base font-bold text-black text-opacity-60">
                      {{ $t("menu.close") }}
                    </div>
                  </a>
                </div>
              </div>
            </b-modal>
          </div>
        </div>

        <!-- Right -->
        <div class="mt-4 lg:mt-0">
          <div class="grid grid-cols-1 space-y-4">
            <!-- Message from customer -->
            <div v-if="hasMemo" class="bg-white rounded-lg p-4 shadow">
              <div class="text-xs font-bold text-black text-opacity-60">
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
              @input="updateEnable"
            ></order-info>
            <div v-if="editedAvailableOrders.length > 1">
              <div
                class="bg-white rounded-lg shadow p-4 text-center"
                v-if="orderInfo.orderUpdatedAt"
              >
                <div>{{ $t("admin.order.changeOrderDetail") }}</div>
                {{ timeStampToText(orderInfo.orderUpdatedAt) }}
                {{ $t("admin.order.alreadyChanged") }}
              </div>

              <div
                class="bg-white rounded-lg shadow p-4 text-center"
                v-if="availableOrderChange"
              >
                <div>{{ $t("admin.order.changeOrderDetail") }}</div>
                <div class="mt-4">
                  <b-button @click="toggleIsOrderChange" class="b-reset-tw">
                    <div
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                      <div class="text-base font-bold text-white">
                        {{
                          isOrderChange
                            ? $t("admin.order.cancelOrderChange")
                            : $t("admin.order.willOrderChange")
                        }}
                      </div>
                    </div>
                  </b-button>
                </div>
                <div class="mt-4">
                  <b-button
                    @click="handleOrderChange"
                    :loading="changing"
                    :disabled="!availableChangeButton"
                    class="b-reset-tw"
                    v-if="isOrderChange"
                  >
                    <div
                      class="inline-flex justify-center items-center h-12 px-6 rounded-full bg-red-700"
                    >
                      <div class="text-base font-bold text-white">
                        {{ $t("admin.order.confirmOrderChange") }}
                      </div>
                    </div>
                  </b-button>
                </div>
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

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  watch,
} from "@vue/composition-api";

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
import { nameOfOrder, formatOption } from "@/utils/strings";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";
import {
  stripeConfirmIntent,
  stripeCancelIntent,
  stripePaymentCancelIntent,
} from "@/lib/stripe/stripe";
import moment from "moment-timezone";

import { ownPlateConfig } from "@/config/project";

import NotFound from "@/components/NotFound.vue";
import OrderInfo from "@/app/user/OrderPage/OrderInfo.vue";
import CustomerInfo from "@/components/CustomerInfo.vue";
import AdminHeader from "@/app/admin/AdminHeader.vue";

import { costCal } from "@/utils/commonUtils";
import { downloadOrderPdf, printOrder, data2UrlSchema } from "@/lib/pdf/pdf2";
import * as analyticsUtil from "@/lib/firebase/analytics";

import { checkShopAccount } from "@/utils/userPermission";
import {
  doc2data,
  useAdminUids,
  useRestaurantId,
  forcedError,
  notFoundResponse,
  stripeRegion,
} from "@/utils/utils";

import {
  isEmpty,
  isNull,
  getShopOwner,
  getOrderItems,
  arrayChunk,
  array2obj,
} from "@/utils/utils";

const timezone = moment.tz.guess();

export default defineComponent({
  components: {
    OrderInfo,
    AdminHeader,
    CustomerInfo,
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    groupData: {
      type: Object,
      required: false,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
      required: false,
    },
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Order Info",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  // if user is not signined, render login
  // if user is not owner, render 404
  // if restaurant don't have order, render 404.

  setup(props, ctx) {
    const menuObj = ref({});
    const orderInfo = ref({});
    const customer = ref({});
    const postageInfo = ref({});
    const deliveryData = ref({});
    const shopOwner = ref(null);
    const userLog = ref({});

    const updating = ref("");
    const changing = ref(false);

    const cancelPopup = ref(false);
    const paymentCancelPopup = ref(false);
    const isOrderChange = ref(false);

    const notFound = ref(null);
    const timeOffset = ref(0);
    const editedAvailableOrders = ref([]);

    const { ownerUid, uid } = useAdminUids(ctx);
    if (
      !checkShopAccount(props.shopInfo, ownerUid.value) &&
      !ctx.root.$store.getters.isSuperAdmin
    ) {
      return notFoundResponse;
    }
    if (props.shopInfo.isEC) {
      getDoc(doc(db, `restaurants/${ctx.root.restaurantId()}/ec/postage`)).then(
        (snapshot) => {
          postageInfo.value = snapshot.data() || {};
        }
      );
    }
    if (props.shopInfo.enableDelivery) {
      getDoc(
        doc(db, `restaurants/${ctx.root.restaurantId()}/delivery/area`)
      ).then((snapshot) => {
        deliveryData.value = snapshot.data() || {};
      });
    }
    const restaurantId = useRestaurantId(ctx.root);
    const orderId = computed(() => {
      return ctx.root.$route.params.orderId;
    });

    const order_detacher = onSnapshot(
      doc(db, `restaurants/${ctx.root.restaurantId()}/orders/${orderId.value}`),
      async (order) => {
        if (!order.exists()) {
          notFound.value = true;
          return;
        }
        const order_data = order.data();
        orderInfo.value = order_data;
        if (orderInfo.value.isDelivery || props.shopInfo.isEC) {
          const tmpCustomer = await getDoc(
            doc(
              db,
              `restaurants/${ctx.root.restaurantId()}/orders/${
                orderId.value
              }/customer/data`
            )
          );
          customer.value =
            tmpCustomer.data() || orderInfo.value?.customerInfo || {};
        }
        notFound.value = false;
      },
      (e) => {
        notFound.value = true;
        return;
      }
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
          `restaurants/${ctx.root.restaurantId()}/userLog/${
            orderInfo.value.uid
          }`
        )
      ).then((res) => {
        if (res.exists) {
          userLog.value = res.data();
        }
      });
      const menuRestaurantId = props.groupData
        ? props.groupData.restaurantId
        : ctx.root.restaurantId();
      const menuIds = Object.keys(orderInfo.value.menuItems);
      arrayChunk(menuIds, 10).map(async (arr) => {
        getDocs(
          query(
            collection(db, `restaurants/${menuRestaurantId}/menus`),
            where(documentId(), "in", arr)
          )
        ).then((menu) => {
          if (!menu.empty) {
            const tmpMenuObj = array2obj(menu.docs.map(doc2data("menu")));
            menuObj.value = Object.assign({}, { ...menuObj.value }, tmpMenuObj);
          }
        });
      });
    });

    const orderPickupInterval = computed(() => {
      if (orderInfo.value.timePlaced && userLog.value.lastOrder) {
        const intervalHour =
          (orderInfo.value.timePlaced - userLog.value.lastOrder) / 3600;
        return intervalHour;
      }
      return -1000000;
    });
    const isWarningOrder = computed(() => {
      if (orderPickupInterval.value === 0) {
        return true;
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
      Object.keys(orderItems.value).map((key) => {
        editedAvailableOrders.value[key] = true;
      });
    });
    const timeStampToText = (timestamp) => {
      if (timestamp) {
        return ctx.root.$d(timestamp.toDate(), "long");
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
        orderInfo.value.description || orderName.value
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
      return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120].map((offset) => {
        const date = new Date(time + offset * 60000);
        return {
          offset,
          display: `${ctx.root.$d(date, "time")}`,
        };
      });
    });
    const timeRequested = computed(() => {
      if (!orderInfo.value.timePlaced) {
        return "";
      }
      const date = orderInfo.value.timePlaced.toDate();
      return ctx.root.$d(date, "long");
    });
    const timeEstimated = computed(() => {
      if (orderInfo.value.timeEstimated) {
        const date = orderInfo.value.timeEstimated.toDate();
        return ctx.root.$d(date, "long");
      }
      return undefined; // backward compatibility
    });
    const hasStripe = computed(() => {
      return orderInfo.value.payment && orderInfo.value.payment.stripe;
    });
    const paymentIsNotCompleted = computed(() => {
      return (
        // hasStripe.value && orderInfo.value.status < order_status.ready_to_pickup
        hasStripe.value && orderInfo.value.payment.stripe === "pending"
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
    const orderStates = computed(() => {
      return shopOwner.value && !!shopOwner.value.hidePrivacy
        ? [
            "order_placed",
            "order_accepted",
            "ready_to_pickup",
            "transaction_complete",
            "transaction_hide",
          ]
        : [
            "order_placed",
            "order_accepted",
            "ready_to_pickup",
            "transaction_complete",
          ]; // no longer "cooking_completed"
    });
    // for editable order
    const edited_available_order_info = computed(() => {
      const ret = [];
      Object.keys(editedAvailableOrders.value).forEach((key) => {
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
        { sub_total: 0, tax: 0, food_sub_total: 0, alcohol_sub_total: 0 }
      );
      ret.sub_total = ret.food_sub_total + ret.alcohol_sub_total;

      const { alcoholTax, foodTax, inclusiveTax } = props.shopInfo;
      if (inclusiveTax) {
        ret.food_tax =
          Math.round(
            ret.food_sub_total * (1 - 1 / (1 + foodTax / 100)) * multiple
          ) / multiple;
        ret.alcohol_tax =
          Math.round(
            ret.alcohol_sub_total * (1 - 1 / (1 + alcoholTax / 100)) * multiple
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
        orderInfo.value?.customerInfo?.prefectureId,
        ret.total
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
      return (
        orderInfo.value &&
        orderInfo.value.status === order_status.order_placed &&
        isNull(orderInfo.value.orderUpdatedAt)
      );
    });
    const availableChangeButton = computed(() => {
      return (
        edited_available_order_info.value.length !==
          editedAvailableOrders.value.length &&
        edited_available_order_info.value.length > 0 &&
        notDeliveryOrTotalCanDelivery.value
      );
    });

    const updateEnable = (value) => {
      ctx.root.$set(editedAvailableOrders.value, value[0], value[1]);
    };
    const toggleIsOrderChange = () => {
      isOrderChange.value = !isOrderChange.value;
    };
    const isValidTransition = (newStatus) => {
      const newStatusValue = order_status[newStatus];
      return possibleTransitions.value[newStatusValue];
    };
    const download = () => {
      downloadOrderPdf(orderInfo.value, orderItems.value);
    };
    const print = async () => {
      const data = await printOrder(orderInfo.value, orderItems.value);
      const passprnt_uri = data2UrlSchema(data, "2");
      location.href = passprnt_uri;
    };
    const getEestimateTime = () => {
      const time = orderInfo.value.timePlaced.toDate().getTime();
      const date = new Date(time + timeOffset.value * 60000);
      return Timestamp.fromDate(date);
    };
    const handleStripe = async () => {
      //console.log("handleComplete with Stripe", orderId);
      try {
        ctx.root.$store.commit("setLoading", true);
        const params = {
          timezone,
          restaurantId: restaurantId.value + forcedError("confirm", ctx),
          orderId: orderId.value,
        };
        if (timeOffset.value > 0) {
          params.timeEstimated = getEestimateTime();
        }
        const { data } = await stripeConfirmIntent(params);
        ctx.root.$router.push(parentUrl.value);
      } catch (error) {
        console.error(error.message, error.details);
        ctx.root.$store.commit("setErrorMessage", {
          code: "stripe.confirm",
          error,
          message2: "errorPage.code.stripe.confirm2",
        });
      } finally {
        ctx.root.$store.commit("setLoading", false);
        updating.value = "";
      }
    };
    const handleChangeStatus = async (statusKey) => {
      const newStatus = order_status[statusKey];
      if (newStatus === orderInfo.value.status) {
        console.log("same status - no need to process");
        return;
      }
      updating.value = statusKey;
      if (
        (newStatus === order_status.ready_to_pickup ||
          newStatus === order_status.order_accepted) &&
        paymentIsNotCompleted.value
      ) {
        handleStripe();
        return;
      }
      try {
        ctx.root.$store.commit("setLoading", true);
        const params = {
          restaurantId: restaurantId.value + forcedError("update", ctx),
          orderId: orderId.value,
          status: newStatus,
          timezone,
        };
        if (timeOffset.value > 0) {
          params.timeEstimated = getEestimateTime();
        }
        const { data } = await orderUpdate(params);
        // console.log("update", data);
        ctx.root.$router.push(parentUrl.value);
      } catch (error) {
        console.error(error.message, error.details);
        ctx.root.$store.commit("setErrorMessage", {
          code: "order.update",
          error,
        });
      } finally {
        ctx.root.$store.commit("setLoading", false);
        updating.value = "";
      }
    };
    const sendRedunded = () => {
      analyticsUtil.sendRedunded(
        orderInfo.value,
        orderId.value,
        props.shopInfo,
        restaurantId.value
      );
      // console.log(orderItems.value);
    };
    const handleCancel = async () => {
      console.log("handleCancel");

      try {
        updating.value = "order_canceled";
        const { data } = await stripeCancelIntent({
          restaurantId: restaurantId.value + forcedError("cancel", ctx),
          orderId: orderId.value,
        });
        sendRedunded();
        // console.log("cancel", data);
        ctx.root.$router.push(parentUrl.value);
      } catch (error) {
        console.error(error.message, error.details);
        ctx.root.$store.commit("setErrorMessage", {
          code: "order.cancel",
          error,
        });
      } finally {
        updating.value = "";
      }
    };
    const handleOrderChange = async () => {
      ctx.root.$store.commit("setAlert", {
        title: "admin.order.confirmOrderChange",
        code: "admin.order.updateOrderMessage",
        callback: async () => {
          try {
            changing.value = true;
            ctx.root.$store.commit("setLoading", true);
            const params = {
              restaurantId: restaurantId.value + forcedError("update", ctx),
              orderId: orderId.value,
              newOrder: edited_available_order_info.value,
              timezone,
            };

            const { data } = await orderChange(params);
            isOrderChange.value = false;

            // console.log("update", data);
          } catch (error) {
            console.error(error.message, error.details);
            ctx.root.$store.commit("setErrorMessage", {
              code: "order.update",
              error,
            });
          } finally {
            ctx.root.$store.commit("setLoading", false);
            changing.value = false;
          }
        },
      });
    };
    const handlePaymentCancel = async () => {
      console.log("handlePaymentCancel");

      try {
        updating.value = "payment_canceled";
        const { data } = await stripePaymentCancelIntent({
          restaurantId: restaurantId.value + forcedError("cancel", ctx),
          orderId: orderId.value,
        });
        console.log("paymentCancel", data);
        ctx.root.$router.push(parentUrl.value);
      } catch (error) {
        console.error(error.message, error.details);
        ctx.root.$store.commit("setErrorMessage", {
          code: "stripe.cancel",
          error,
        });
      } finally {
        updating.value = "";
      }
    };
    const classOf = (statusKey) => {
      if (order_status[statusKey] == orderInfo.value.status) {
        return statusKey;
      }
      return "light";
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

      // methods
      updateEnable,
      toggleIsOrderChange,
      isValidTransition,
      download,
      print,
      handleStripe,
      handleChangeStatus,
      handleCancel,
      handleOrderChange,
      handlePaymentCancel,
      classOf,

      openCancel,
      closeCancel,
      openPaymentCancel,
      closePaymentCancel,
    };
  },
});
</script>
