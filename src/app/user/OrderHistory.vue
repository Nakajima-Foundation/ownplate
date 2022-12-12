<template>
  <div>
    <!-- Back -->
    <div class="mx-6 mt-6">
      <back-button :url="basePath + '/u/profile/'" />
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
          :isInMo="isInMo"
        />
      </template>
      <div v-else>
        <span class="text-base text-black text-opacity-40">
          {{ $t("order.noHistory") }}
        </span>
      </div>
    </div>
    <!-- Phone Login-->
    <o-modal :active.sync="loginVisible" :width="488" scroll="keep">
      <div class="mx-2 my-6 rounded-lg bg-white p-6 shadow-lg">
        <phone-login v-on:dismissed="handleDismissed" />
      </div>
    </o-modal>
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
  collectionGroup,
  query,
  onSnapshot,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import OrderedInfo from "@/app/admin/Order/OrderedInfo.vue";
import PhoneLogin from "@/app/auth/PhoneLogin.vue";
import BackButton from "@/components/BackButton.vue";

import { defaultHeader } from "@/config/header";
import { useBasePath, useTopPath, useIsInMo, getMoPrefix } from "@/utils/utils";

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
  setup(props, ctx) {
    const orders = ref([]);

    const basePath = useBasePath(ctx.root);
    const topPath = useTopPath(ctx.root);

    const isInMo = useIsInMo(ctx.root);
    const moPrefix = getMoPrefix(ctx.root);

    const uid = computed(() => {
      return ctx.root.$store.getters.uidUser || ctx.root.$store.getters.uidLiff;
    });

    const loginVisible = computed(() => {
      return !uid.value;
    });

    let detacher = null;
    const detach = () => {
      detacher && detacher();
      detacher = null;
    };

    const loading = ref(true);
    const getHistory = () => {
      loading.value = true;
      detach();
      if (uid.value) {
        const orderQuery = isInMo.value
          ? query(
              collectionGroup(db, "orders"),
              where("uid", "==", uid.value),
              where("groupId", "==", moPrefix),
              orderBy("orderPlacedAt", "desc"),
              limit(200)
            )
          : query(
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
              return order;
            })
            .filter((data) => {
              if (isInMo.value) {
                return true;
              }
              return data.groupId === undefined;
            });
          loading.value = false;
        });
      }
    };

    const handleDismissed = (success) => {
      console.log("handleDismissed", success);
      if (success) {
        loginVisible.value = false;
      } else {
        ctx.root.$router.push(topPath.value);
      }
    };

    const orderSelected = (order) => {
      const path =
        basePath.value + "/r/" + order.restaurantId + "/order/" + order.id;
      ctx.root.$router.push({
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

      isInMo,
    };
  },
});
</script>
