<template>
  <div>
    <!-- Back -->
    <div class="mt-6 mx-6">
      <back-button :url="basePath + '/u/profile/'" />
    </div>

    <!-- Title -->
    <div class="mt-6 mx-6 text-xl font-bold text-black text-opacity-30">
      {{ $t("order.history") }}
    </div>

    <!-- Orders -->
    <div class="mx-6 mt-6 grid grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4">
      <ordered-info
        v-for="order in orders"
        :key="order.id"
        @selected="orderSelected($event)"
        :order="order"
        :isSuperView="true"
      />
    </div>

    <!-- Phone Login-->
    <b-modal :active.sync="loginVisible" :width="488" scroll="keep">
      <div class="mx-2 my-6 p-6 bg-white shadow-lg rounded-lg">
        <phone-login v-on:dismissed="handleDismissed" />
      </div>
    </b-modal>
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

import OrderedInfo from "@/app/admin/Order/OrderedInfo";
import PhoneLogin from "@/app/auth/PhoneLogin";
import BackButton from "@/components/BackButton";

import { defaultHeader } from "@/config/header";
import { useBasePath, useTopPath } from "@/utils/utils";

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
    
    const uid = computed(() => {
      return ctx.root.$store.getters.uidUser || ctx.root.$store.getters.uidLiff;
    });

    const loginVisible = computed(() => {
      return !uid.value;
    });

    let detacher = null;

    const getHistory = () =>  {
      detacher && detacher();
      if (uid.value) {
        detacher = onSnapshot(
          query(
            collectionGroup(db, "orders"),
            where("uid", "==", uid.value),
            orderBy("orderPlacedAt", "desc"),
            limit(200)
          ),
          (snapshot) => {
            orders.value = snapshot.docs.map((doc) => {
              const order = doc.data();
              order.restaurantId = doc.ref.path.split("/")[1];
              order.id = doc.id;
              // HACK: Remove it later
              order.timePlaced =
                (order.timePlaced && order.timePlaced.toDate()) || new Date();
              new Date();
              if (order.timeEstimated) {
                order.timeEstimated = order.timeEstimated.toDate();
              }
              return order;
            });
          }
        );
      } else {
        detacher = null;
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
      const path  = basePath.value + "/r/" + order.restaurantId + "/order/" + order.id;
      ctx.root.$router.push({
        path,
      });
    };

    getHistory();
    
    watch(uid, () => {
      getHistory();
    });
    
    onUnmounted(() => {
      detacher && detacher();
    });
    
    return {
      loginVisible,
      handleDismissed,

      orders,
      orderSelected,
      basePath,
    };

  },
});
</script>
