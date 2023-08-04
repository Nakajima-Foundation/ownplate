<template>
  <div>
    <!-- Back -->
    <div class="mx-6 mt-6">
      <back-button :url="basePath + '/u/profile/'"
                   backText="button.myPage"
                   iconText="arrow_back"
                   />
    </div>

    <!-- Title -->
    <div class="mx-6 mt-6 text-xl font-bold text-black text-opacity-30">
      {{ $t("order.history") }}
    </div>

    <!-- Orders -->
    <div
      class="mx-6 mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-if="loading" />
      <template v-else-if="orders.length > 0">
        <ordered-info
          v-for="order in orders"
          :key="order.id"
          @selected="orderSelected($event)"
          :order="order"
          :isSuperView="true"
        />
      </template>
      <div v-else>
        <span class="text-base text-black text-opacity-40">
          {{ $t("order.noHistory") }}
        </span>
      </div>
    </div>
    <!-- Phone Login-->
    <o-modal v-model:active="loginVisible" :width="488" scroll="keep">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <phone-login v-on:dismissed="handleDismissed" />
      </div>
    </o-modal>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
  watch,
} from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  collectionGroup,
  query,
  onSnapshot,
  where,
  orderBy,
  limit,
  Unsubscribe,
} from "firebase/firestore";

import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import PhoneLogin from "@/app/auth/PhoneLogin.vue";
import BackButton from "@/components/BackButton.vue";

import { defaultHeader } from "@/config/header";
import { useBasePath, useTopPath } from "@/utils/utils";

import { useStore } from "vuex";
import { useRouter } from "vue-router";

import { OrderInfoData } from "@/models/orderInfo";

export default defineComponent({
  metaInfo() {
    return {
      title: [defaultHeader.title, "User Order History"].join(" / "),
    };
  },
  components: {
    OrderedInfo,
    PhoneLogin,
    BackButton,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const orders = ref<OrderInfoData[]>([]);

    const basePath = useBasePath();
    const topPath = useTopPath();

    const uid = computed(() => {
      return store.getters.uidUser || store.getters.uidLiff;
    });

    const loginVisible = computed(() => {
      return !uid.value;
    });

    let detacher: Unsubscribe | null = null;
    const detach = () => {
      detacher && detacher();
      detacher = null;
    };

    const loading = ref(true);
    const getHistory = () => {
      loading.value = true;
      detach();
      if (uid.value) {
        const orderQuery = query(
              collectionGroup(db, "orders"),
              where("uid", "==", uid.value),
              orderBy("orderPlacedAt", "desc"),
              limit(200)
            );

        detacher = onSnapshot(orderQuery, (snapshot) => {
          orders.value = snapshot.docs
            .map((doc) => {
              const order = doc.data();
              order.restaurantId = doc.ref.path.split("/")[1];
              order.id = doc.id;
              // HACK: Remove it later
              order.timePlaced =
                (order.timePlaced && order.timePlaced.toDate()) || new Date();
              if (order.timeEstimated) {
                order.timeEstimated = order.timeEstimated.toDate();
              }
              return order as OrderInfoData;
            })
            .filter((data) => {
              // filter mo order for safe // todo remove
              return data.groupId === undefined;
            });
          loading.value = false;
        });
      }
    };

    const handleDismissed = (success: boolean) => {
      console.log("handleDismissed", success);
      if (!success) {
        router.push(topPath.value);
      }
    };

    const orderSelected = (order: OrderInfoData) => {
      const path =
        basePath.value + "/r/" + order.restaurantId + "/order/" + order.id;
      router.push({
        path,
      });
    };

    getHistory();

    watch(uid, () => {
      getHistory();
    });

    onUnmounted(() => {
      detach();
    });

    return {
      loginVisible,
      handleDismissed,

      orders,
      orderSelected,
      basePath,

      loading,

    };
  },
});
</script>
