<template>
  <div>
    <template v-if="notFound">
      <not-found />
    </template>
    <div v-else>
      <!-- Header -->
      <AdminHeader
        class="mt-6 mx-6 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :backLink="'/admin/restaurants/'"
        :showSuspend="true"
        :isInMo="isInMo"
        :moPrefix="moPrefix"
      />
      <!-- Orders -->
      <div
        class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <template v-for="order in orders">
          <router-link
            :to="'/admin/restaurants/' + restaurantId() + '/orders/' + order.id"
            :key="order.id"
          >
            <ordered-info :order="order" :isSuperView="true" />
          </router-link>
        </template>
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

      <!-- More -->
      <div class="mx-6 mt-6 text-center" v-if="last !== undefined">
        <b-button :disabled="last === null" @click="all" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center w-48 h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <div class="text-sm font-bold text-op-teal">
              {{ $t("admin.order.all") }}
            </div>
          </div>
        </b-button>
      </div>

      <div v-if="isOwner">
        <!-- Download Orders -->
        <div class="mx-6 mt-6 text-center">
          <download-orders :orders="orders" />
        </div>

        <!-- Download Report -->
        <div class="mx-6 mt-6 text-center">
          <report-details
            :orders="orders"
            :fileName="fileName"
            :hideTable="true"
            :withStatus="true"
            :shopInfo="shopInfo"
            :isInMo="isInMo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";

import { db } from "@/plugins/firebase";
import { order_status } from "@/config/constant";

import NotFound from "@/components/NotFound.vue";
import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import DownloadOrders from "@/components/DownloadOrders.vue";
import ReportDetails from "@/app/admin/Order/ReportDetails.vue";

import AdminHeader from "@/app/admin/AdminHeader.vue";

import { arrayChunk, useAdminUids, doc2data } from "@/utils/utils";
import { checkAdminPermission, checkShopAccount } from "@/utils/userPermission";

export default defineComponent({
  components: {
    NotFound,
    OrderedInfo,
    DownloadOrders,
    ReportDetails,
    AdminHeader,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
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
    const limit = 60;
    const last = ref(undefined);
    const orders = ref([]);
    const notFound = ref(null);

    const { isOwner, uid, ownerUid } = useAdminUids(ctx);

    if (
      !checkAdminPermission(ctx) ||
      !checkShopAccount(props.shopInfo, ownerUid.value)
    ) {
      return {
        notFound: true,
      };
    }

    const fileName = ctx.root.$t("order.history");

    const next = async () => {
      let query = db
        .collection(`restaurants/${ctx.root.restaurantId()}/orders`)
        .orderBy("timePlaced", "desc")
        .limit(limit);
      if (last.value) {
        query = query.startAfter(last.value);
      }
      const docs = (await query.get()).docs;
      last.value = docs.length == limit ? docs[limit - 1] : null;
      const tmpOrders = docs
        .map(doc2data("order"))
        .filter((a) => a.status !== order_status.transaction_hide);

      const customers = {};
      if (props.shopInfo.isEC || props.shopInfo.enableDelivery) {
        const ids = tmpOrders.map((order) => order.id);
        await Promise.all(
          arrayChunk(ids, 10).map(async (arr) => {
            try {
              const cuss = await db
                .collectionGroup("customer")
                .where("restaurantId", "==", ctx.root.restaurantId())
                .where("orderId", "in", arr)
                .get();
              cuss.docs.map((cus) => {
                const data = cus.data();
                customers[data.orderId] = data;
              });
            } catch (e) {
              console.log(e);
            }
          })
        );
      }

      tmpOrders.forEach((order) => {
        order.customerInfo = order.customerInfo || customers[order.id] || {};
        order.timePlaced = order.timePlaced.toDate();
        if (order.timeEstimated) {
          order.timeEstimated = order.timeEstimated.toDate();
        }
        if (order.timeConfirmed) {
          order.timeConfirmed = order.timeConfirmed.toDate();
        }
        orders.value.push(order);
      });
    };
    const all = async () => {
      while (last.value) {
        await next();
      }
    };
    next();

    return {
      last,
      orders,
      notFound,
      isOwner,
      fileName,
      // methods
      next,
      all,
    };
  },
});
</script>
