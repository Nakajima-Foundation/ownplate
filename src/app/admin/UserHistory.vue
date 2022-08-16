<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <div class="mt-6 mx-6 lg:flex lg:items-center">
        <!-- Back and Preview -->
        <div class="flex space-x-4">
          <div class="flex-shrink-0">
            <back-button
              :url="`/admin/restaurants/${restaurantId()}/orders/` + orderId"
            />
          </div>
          <div class="flex-shrink-0">
            <router-link :to="'/r/' + restaurantId()">
              <div
                class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
              >
                <i class="material-icons text-lg text-op-teal mr-2">launch</i>
                <span class="text-sm font-bold text-op-teal">{{
                  $t("admin.viewPage")
                }}</span>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Photo and Name -->
        <div class="mt-4 lg:mt-0 lg:flex-1 lg:flex lg:items-center lg:mx-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 rounded-full bg-black bg-opacity-10 mr-4">
              <img
                :src="resizedProfileImage(shopInfo, '600')"
                class="w-9 h-9 rounded-full object-cover"
              />
            </div>
            <div class="text-base font-bold">
              {{ shopInfo.restaurantName }}
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="mt-4 lg:mt-0 flex-shrink-0">
          <notification-index :shopInfo="shopInfo" />
        </div>
      </div>

      <div v-if="orders[0] && orders[0].phoneNumber" class="mt-4 text-center">
        <div class="text-xs font-bold">
          {{ $t("sms.phonenumber") }}
        </div>
        <div class="text-base mt-1">
          <div>
            <a :href="nationalPhoneURI" class="text-base font-bold">{{
              nationalPhoneNumber
            }}</a>
          </div>
          <div class="text-base">{{ orders[0].name }}</div>
        </div>
        <div>
          {{ $t("order.orderTimes") }}:
          {{ $tc("order.orderTimesUnit", userLog.counter || 0) }} /
          {{ $t("order.cancelTimes") }}:
          {{ $tc("order.cancelTimesUnit", userLog.cancelCounter || 0) }}
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
        class="mx-6 mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
      <div class="mx-6 mt-6 text-center" v-if="last !== undefined">
        <b-button :disabled="last === null" @click="next" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center w-48 h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.more") }}
            </div>
          </div>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
} from "@vue/composition-api";
import { db, firestore } from "@/plugins/firebase";
import { midNight } from "@/utils/dateUtils";
import { order_status } from "@/config/constant";
import moment from "moment";
import { parsePhoneNumber, formatNational, formatURL } from "@/utils/phoneutil";

import { checkAdminPermission, checkShopAccount } from "@/utils/userPermission";
import { doc2data, useAdminUids } from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";
import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import NotFound from "@/components/NotFound.vue";
import NotificationIndex from "./Notifications/Index.vue";

export default defineComponent({
  components: {
    NotFound,
    OrderedInfo,
    BackButton,
    NotificationIndex,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  metaInfo() {
    return {
      title: this.shopInfo.restaurantName
        ? [
            "Admin Order History",
            this.shopInfo.restaurantName,
            this.defaultTitle,
          ].join(" / ")
        : this.defaultTitle,
    };
  },
  setup(props, ctx) {
    const orders = ref([]);
    const userLog = ref({});
    const limit = 30;
    const last = ref();

    const fileName = ctx.root.$t("order.history");

    if (!checkAdminPermission(ctx)) {
      return {
        notFound: true,
      };
    }
    const uid = computed(() => {
      return ctx.root.$route.params.userId;
    });
    const { ownerUid } = useAdminUids(ctx);
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return {
        notFound: true,
      };
    }

    const orderId = ctx.root.$route.query.orderId;

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
    })

    // ctx.root.restaurantId() +
    const getUserLog = async () => {
      const res = await db
        .doc(`restaurants/${ctx.root.restaurantId()}/userLog/${uid.value}`)
        .get();
      if (res.exists) {
        userLog.value = res.data();
      }
    };
    const next = async () => {
      let query = db
        .collection(`restaurants/${ctx.root.restaurantId()}/orders`)
        .where("uid", "==", uid.value)
        .orderBy("timePlaced", "desc")
        .limit(limit);
      if (last.value) {
        query = query.startAfter(last.value);
      }
      const docs = (await query.get()).docs;
      last.value = docs.length == limit ? docs[limit - 1] : null;
      orders.value = docs.map(doc2data("order"))
        .filter((a) => a.status !== order_status.transaction_hide)
        .map((order) => {
          order.timePlaced = order.timePlaced.toDate();
          if (order.timeEstimated) {
            order.timeEstimated = order.timeEstimated.toDate();
          }
          if (order.timeConfirmed) {
            order.timeConfirmed = order.timeConfirmed.toDate();
          }
          return order;
        });
    };
    const orderSelected = (order) => {
      ctx.root.$router.push({
        path:
          "/admin/restaurants/" + ctx.root.restaurantId() + "/orders/" + order.id,
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
    }
  },
});
</script>
