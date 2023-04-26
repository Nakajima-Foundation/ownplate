<template>
  <div>
    <router-view
      v-if="shopInfo.restaurantId"
      :shopInfo="shopInfo"
      :paymentInfo="paymentInfo"
      :deliveryData="deliveryData"
      :mode="mode"
      :moPrefix="moPrefix"
      :moSuspend="moSuspend"
      :moPickupSuspend="moPickupSuspend"
      :notFound="notFound"
      :groupData="groupData"
      :promotions="promotions"
    />
    <NotFound v-else-if="notFound" />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { routeMode, getMoPrefix } from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";

import { usePromotions } from "@/utils/promotion";

export default defineComponent({
  name: "RestaurantWrapper",
  props: {
    groupData: {
      type: Object,
      required: false,
    },
  },
  components: {
    NotFound,
  },
  setup(props, ctx) {
    const mode = routeMode(ctx.root);
    const moPrefix = getMoPrefix(ctx.root);

    const shopInfo = ref({});
    const paymentInfo = ref({});
    const deliveryData = ref({});
    const notFound = ref(null);

    const restaurantId = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });

    const restaurant_detacher = onSnapshot(
      doc(db, `restaurants/${restaurantId.value}`),
      async (restaurant) => {
        shopInfo.value = restaurant.data() || {};
        const exist_and_public =
          restaurant.exists() &&
          !shopInfo.value.deletedFlag &&
          shopInfo.value.publicFlag;

        notFound.value = (() => {
          if (!exist_and_public) {
            return true;
          }
          if (mode.value === "liff") {
            return !shopInfo.value.supportLiff;
          }
          if (mode.value === "mo") {
            return !shopInfo.value.groupId;
          }
          return !!shopInfo.value.groupId || !!shopInfo.value.supportLiff;
        })();

        if (!notFound.value) {
          const uid = shopInfo.value.uid;
          getDoc(doc(db, `/admins/${uid}/public/payment`)).then((snapshot) => {
            paymentInfo.value = snapshot.data() || {};
          });
          if (shopInfo.value.enableDelivery) {
            getDoc(
              doc(db, `restaurants/${restaurantId.value}/delivery/area`)
            ).then((snapshot) => {
              deliveryData.value = snapshot.data() || {};
            });
          }
        }
      },
      (e) => {
        notFound.value = true;
        console.log("no restaurant");
      }
    );

    const groupSuspend = ref({});
    if (props.groupData?.groupId) {
      onSnapshot(
        doc(db, `groups/${props.groupData?.groupId}/groupConfig/suspend`),
        (snapshot) => {
          groupSuspend.value = snapshot.data() || {};
        }
      );
    }

    const moSuspend = computed(() => {
      return !!(
        shopInfo.value?.isSuspendAllOrder ||
        groupSuspend.value.isSuspendAllOrder
      );
    });
    const moPickupSuspend = computed(() => {
      return (
        !!(
          shopInfo.value?.isSuspendPickup || groupSuspend.value.isSuspendPickup
        ) &&
        !moSuspend.value &&
        shopInfo.value.enableMoPickup
      );
    });

    const user = computed(() => {
      return ctx.root.user;
    });

    const id = mode.value === 'mo' ? moPrefix : restaurantId.value;
    const { promotions } = usePromotions(mode.value, id, user);
    
    onUnmounted(() => {
      if (restaurant_detacher) {
        restaurant_detacher();
      }
    });
    return {
      mode,
      moPrefix,

      moSuspend,
      moPickupSuspend,

      shopInfo,
      paymentInfo,
      deliveryData,
      notFound,

      promotions,
    };
  },
});
</script>
