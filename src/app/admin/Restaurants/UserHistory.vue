<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <div class="mx-6 mt-4 lg:flex lg:items-center">
        <!-- Back and Preview -->
        <div class="flex space-x-4">
          <div class="shrink-0">
            <back-button
              :url="
                `/admin/restaurants/${shopInfo.restaurantId}/orders/` + orderId
              "
              iconText="arrow_back"
              backText="button.backToOrderPage"
            />
          </div>
          <PreviewLink :shopInfo="shopInfo" />
        </div>

        <!-- Photo and Name -->
        <div class="mt-4 lg:mx-4 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
          <div class="flex items-center">
            <div class="mr-4 shrink-0 rounded-full bg-black/10">
              <img
                :src="resizedProfileImage(shopInfo, '600')"
                class="h-9 w-9 rounded-full object-cover"
              />
            </div>
            <div class="text-base font-bold">
              {{ shopInfo.restaurantName }}
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="mt-4 shrink-0 lg:mt-0">
          <notification-index :shopInfo="shopInfo" />
        </div>
      </div>

      <div v-if="orders[0] && orders[0].phoneNumber" class="mt-4 text-center">
        <div class="text-xs font-bold">
          {{ $t("sms.phonenumber") }}
        </div>
        <div class="mt-1 text-base">
          <div>
            <a :href="nationalPhoneURI" class="text-base font-bold">{{
              nationalPhoneNumber
            }}</a>
          </div>
          <div class="text-base">{{ orders[0].name }}</div>
        </div>
        <div>
          {{ $t("order.orderTimes") }}:
          {{ $t("order.orderTimesUnit", { count: userLog.counter || 0 }, 0) }} /
          {{ $t("order.cancelTimes") }}:
          {{
            $t(
              "order.cancelTimesUnit",
              { count: userLog.cancelCounter || 0 },
              0,
            )
          }}
        </div>
        <div>
          {{ $t("order.lastOrder") }}:
          {{
            userLog.lastOrder
              ? moment(userLog.lastOrder.toDate()).format("YYYY/MM/DD HH:mm")
              : "--"
          }}
        </div>
      </div>

      <!-- Orders -->
      <div
        class="mx-6 mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <ordered-info
          v-for="order in orders"
          :key="order.id"
          @selected="orderSelected($event)"
          :order="order"
          :isSuperView="true"
        />
      </div>

      <!-- More -->
      <div class="mx-6 mt-2 text-center" v-if="last !== undefined">
        <o-button :disabled="last === null" @click="next" class="b-reset-tw">
          <div
            class="inline-flex h-9 w-48 items-center justify-center rounded-full bg-black/5 px-4"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.more") }}
            </div>
          </div>
        </o-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  where,
  orderBy,
  startAfter,
  limit,
  query,
  QueryConstraint,
} from "firebase/firestore";

import { order_status } from "@/config/constant";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";
import { OrderInfoData } from "@/models/orderInfo";

import { checkShopAccount } from "@/utils/userPermission";
import {
  doc2data,
  useAdminUids,
  useRestaurantId,
  resizedProfileImage,
  defaultTitle,
} from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";
import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import NotFound from "@/components/NotFound.vue";
import NotificationIndex from "@/app/admin/Notifications/Index.vue";
import PreviewLink from "@/app/admin/common/PreviewLink.vue";

import { useRouter, useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import moment from "moment-timezone";

export default defineComponent({
  components: {
    NotFound,
    OrderedInfo,
    BackButton,
    NotificationIndex,
    PreviewLink,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const orders = ref<OrderInfoData[]>([]);
    const userLog = ref({});
    const limitNum = 30;
    const last = ref();
    const restaurantId = useRestaurantId();

    const customerUid = computed(() => {
      return route.params.userId;
    });
    const { ownerUid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return {
        notFound: true,
      };
    }

    useHead(() => ({
      title: props.shopInfo.restaurantName
        ? [
            "Admin Order History",
            props.shopInfo.restaurantName,
            defaultTitle,
          ].join(" / ")
        : defaultTitle,
    }));

    const orderId = route.query.orderId;

    const phoneNumber = computed(() => {
      if (orders.value[0] && orders.value[0].phoneNumber) {
        return parsePhoneNumber(orders.value[0].phoneNumber);
      }
      return "";
    });
    const nationalPhoneNumber = computed(() => {
      return phoneNumber.value ? formatNational(phoneNumber.value) : "";
    });
    const nationalPhoneURI = computed(() => {
      return phoneNumber.value ? formatURL(phoneNumber.value) : "";
    });

    const getUserLog = async () => {
      const res = await getDoc(
        doc(
          db,
          `restaurants/${restaurantId.value}/userLog/${customerUid.value}`,
        ),
      );
      if (res.exists()) {
        userLog.value = res.data();
      }
    };
    const next = async () => {
      const queryConditions: QueryConstraint[] = [
        where("uid", "==", customerUid.value),
        orderBy("timePlaced", "desc"),
        limit(limitNum),
      ];
      if (last.value) {
        queryConditions.push(startAfter(last.value));
      }
      const docs = (
        await getDocs(
          query(
            collection(db, `restaurants/${restaurantId.value}/orders`),
            ...queryConditions,
          ),
        )
      ).docs;
      last.value = docs.length === limitNum ? docs[limitNum - 1] : null;
      orders.value = docs
        .map(doc2data("order"))
        .filter((a) => a.status !== order_status.transaction_hide)
        .map((order) => {
          order.timePlaced = order.timePlaced.toDate();
          if (order.timeEstimated) {
            order.timeEstimated = order.timeEstimated.toDate();
          }
          if (order.timeConfirmed) {
            order.timeConfirmed = order.timeConfirmed.toDate();
          }
          return order as OrderInfoData;
        })
        .sort((a, b) => {
          if (a.timePlaced.getTime() === b.timePlaced.getTime()) {
            return a.number > b.number ? -1 : 1;
          }
          return a.timePlaced > b.timePlaced ? -1 : 1;
        });
    };
    const orderSelected = (order: OrderInfoData) => {
      router.push({
        path:
          "/admin/restaurants/" + restaurantId.value + "/orders/" + order.id,
      });
    };

    next();
    getUserLog();

    return {
      orders,
      orderId,
      last,

      userLog,
      nationalPhoneURI,
      nationalPhoneNumber,

      notFound: false,

      next,
      orderSelected,

      moment,
      restaurantId,
      resizedProfileImage,
    };
  },
});
</script>
