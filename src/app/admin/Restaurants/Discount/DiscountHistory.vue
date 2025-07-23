<template>
  <div v-if="notFound">404</div>
  <div v-else>
    <!-- QR Header Area -->
    <div class="columns is-gapless" v-if="shopInfo">
      <!-- Left Gap -->
      <div class="column is-narrow w-6"></div>
      <!-- Center Column -->
      <div class="column">
        <!-- Nav Bar -->
        <!-- Back Button and Restaurant Profile -->
        <AdminHeader
          class="mx-6 mt-4 lg:flex lg:items-center"
          :shopInfo="shopInfo"
          :backLink="`/admin/restaurants/${shopInfo.restaurantId}/discounts`"
          :showSuspend="false"
          backText="button.backToDiscounts"
          iconText="arrow_back"
          pageText="discountHistory"
        />
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-6"></div>
    </div>
    <div class="mx-6 mt-4 lg:flex lg:items-center" v-else>
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <div class="shrink-0">
          <back-button
            backText="button.backToDiscounts"
            iconText="arrow_back"
            url="/admin/discounts/"
          />
        </div>
      </div>
    </div>

    <div class="mx-6 mt-4">
      <div v-if="histories.length === 0" class="mt-8 text-black/30 font-bold">
        {{ $t("admin.promotion.noHistory") }}
      </div>
      <div v-else>
        <div v-for="(h, k) in histories" :key="k">
          <div class="rounded-lg bg-white p-4 shadow-sm mb-2">
            <div class="mt-1 flex items-center">
              <div class="text-sm text-black/40 font-bold">
                {{ $t("admin.promotion.uid") }}:
              </div>
              <div class="ml-1">
                <router-link
                  :to="`/admin/restaurants/${h.restaurantId}/userhistory/${h.uid}`"
                  class="underline"
                >
                  {{ h.uid }}
                </router-link>
              </div>
            </div>

            <div class="mt-1 flex items-center" v-if="false">
              <div class="text-sm text-black/40 font-bold">
                {{ $t("admin.promotion.rid") }}:
              </div>
              <div class="ml-1">
                {{ h.restaurantId }}
              </div>
            </div>

            <div class="mt-1 flex items-center" v-if="false">
              <div class="text-sm text-black/40 font-bold">
                {{ $t("admin.promotion.pid") }}:
              </div>
              <div class="ml-1">
                {{ h.promotionId }}
              </div>
            </div>

            <div class="mt-1 flex items-center">
              <div class="text-sm text-black/40 font-bold">
                {{ $t("admin.promotion.oid") }}:
              </div>
              <div class="ml-1">
                <router-link
                  :to="`/admin/restaurants/${h.restaurantId}/orders/${h.orderId}`"
                  class="underline"
                >
                  {{ h.orderId }}
                </router-link>
              </div>
            </div>

            <div class="mt-1 flex items-center">
              <div class="text-sm text-black/40 font-bold">
                {{ $t("admin.promotion.date") }}:
              </div>
              <div class="ml-1">
                {{ moment(h.usedAt.toDate()).format("YYYY/MM/DD HH:mm") }}
              </div>
            </div>

            <div class="mt-1 flex items-center">
              <div class="text-sm text-black/40 font-bold">
                {{ $t("admin.promotion.total") }}:
              </div>
              <div class="ml-1">
                {{ h.totalCharge }}
              </div>
            </div>

            <div class="mt-1 flex items-center">
              <div class="text-sm text-black/40 font-bold">
                {{ $t("admin.promotion.discountPrice") }}:
              </div>
              <div class="ml-1">
                {{ h.discountPrice }}
              </div>
            </div>

            <button
              v-if="false"
              @click="deleteHistory(h)"
              class="cursor-pointer border-0 flex items-center justify-center mt-3 h-9 w-24 rounded-full bg-black/5 font-bold text-red-700"
            >
              {{ $t("admin.promotion.delete") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  onSnapshot,
  query,
  collectionGroup,
  where,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { useAdminUids, notFoundResponse } from "@/utils/utils";
import { checkShopAccount } from "@/utils/userPermission";

import AdminHeader from "@/app/admin/AdminHeader.vue";
import BackButton from "@/components/BackButton.vue";

import { useRoute } from "vue-router";

import moment from "moment-timezone";

export default defineComponent({
  components: {
    AdminHeader,
    BackButton,
  },
  props: {
    shopInfo: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const route = useRoute();

    const id = props.shopInfo?.restaurantId;
    const idKey = "restaurantId";
    const discountId = route.params.discountId as string;

    const { ownerUid } = useAdminUids();
    if (
      !checkShopAccount(props.shopInfo || {}, ownerUid.value) ||
      !ownerUid.value
    ) {
      return notFoundResponse;
    }

    const histories = ref<any[]>([]);
    const cond = discountId
      ? query(
          collectionGroup(db, "promotionHistories"),
          where(idKey, "==", id),
          where("promotionId", "==", discountId),
        )
      : query(
          collectionGroup(db, "promotionHistories"),
          where(idKey, "==", id),
        );
    const q = query(cond, orderBy("createdAt", "desc"));

    onSnapshot(q, (docs) => {
      const tmp: any[] = [];
      docs.docs.forEach((a) => {
        const d = a.data();
        d.path = a.ref.path;
        tmp.push(d);
      });
      histories.value = tmp;
    });

    const deleteHistory = (history: any) => {
      deleteDoc(doc(db, history.path));
      // console.log(history);
    };
    return {
      histories,
      deleteHistory,
      moment,
      notFound: false,
    };
  },
});
</script>
