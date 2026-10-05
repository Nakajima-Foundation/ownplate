<template>
  <div>
    <div v-if="notFound == null"></div>
    <div v-else-if="notFound == true">
      <NotFound />
    </div>
    <div v-else>
      <AdminHeader
        class="mx-6 mt-4 lg:flex lg:items-center"
        :shopInfo="shopInfo"
        :showSuspend="false"
        backLink="/admin/restaurants"
      />

      <div class="mx-6 mt-4 space-y-2 lg:mx-auto lg:max-w-2xl">
        <div class="text-xl font-bold text-black/30">
          {{ $t("admin.timeline.title") }}
        </div>

        <div v-if="messages.length === 0" class="text-sm text-black/60">
          {{ $t("admin.timeline.empty") }}
        </div>

        <router-link
          v-for="message in messages"
          :key="message.id"
          :to="message.path"
          class="block rounded-lg bg-black/5 p-4"
        >
          <div class="text-sm text-black/80">{{ message.text }}</div>
          <div class="mt-1 text-xs text-black/40">
            {{ sentAt(message.createdAt) }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, PropType, ref } from "vue";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import moment from "moment";

import type { RestaurantInfoData } from "@/models/RestaurantInfo";
import { db } from "@/lib/firebase/firebase9";
import { checkShopAccount } from "@/utils/userPermission";
import {
  defaultTitle,
  notFoundResponse,
  useAdminUids,
  useRestaurantId,
} from "@/utils/utils";

import AdminHeader from "@/app/admin/AdminHeader.vue";
import NotFound from "@/components/NotFound.vue";
import { useHead } from "@unhead/vue";

// 画面に出す分だけ。全部読む画面ではないので上限を切る。
const SHOWN_MESSAGES = 200;

// serverTimestamp() は書き込み直後のローカルスナップショットでは null になる。
type SentAt = { toDate: () => Date } | null | undefined;

type ShopMessage = {
  id: string;
  text: string;
  path: string;
  createdAt: SentAt;
};

export default defineComponent({
  components: {
    AdminHeader,
    NotFound,
  },
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
  setup(props) {
    useHead(() => ({
      title: ["Admin Message Timeline", defaultTitle].join(" / "),
    }));

    const { ownerUid } = useAdminUids();
    if (!checkShopAccount(props.shopInfo, ownerUid.value)) {
      return notFoundResponse;
    }
    const restaurantId = useRestaurantId();

    const messages = ref<ShopMessage[]>([]);

    const detacher = onSnapshot(
      query(
        collection(db, `restaurants/${restaurantId.value}/messages`),
        orderBy("createdAt", "desc"),
        limit(SHOWN_MESSAGES),
      ),
      (snapshot) => {
        messages.value = snapshot.docs.map((myDoc) => {
          const data = myDoc.data();
          return {
            id: myDoc.id,
            text: data.text ?? "",
            path: data.path ?? "",
            createdAt: data.createdAt,
          };
        });
      },
    );
    onUnmounted(() => {
      detacher();
    });

    // 書き込み直後は時刻がまだ無い。空のまま出す。
    const sentAt = (at: SentAt) =>
      at ? moment(at.toDate()).format("YYYY/MM/DD HH:mm") : "";

    return {
      messages,
      sentAt,
      notFound: false,
    };
  },
});
</script>
