<template>
  <div>
    <router-view
      v-if="shopInfo.restaurantId"
      :shopInfo="shopInfo"
      :paymentInfo="paymentInfo"
      :deliveryData="deliveryData"
      :mode="mode"
      :moPrefix="moPrefix"
      :notFound="notFound"
      :groupData="groupData"
      :promotions="promotions"
    />
    <NotFound v-else-if="notFound" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
} from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { routeMode, getMoPrefix, useUserData } from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";

import { useRestaurantId } from "@/utils/utils";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
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
  setup(props) {
    const mode = routeMode();
    const moPrefix = getMoPrefix();

    const shopInfo = ref<RestaurantInfoData|{[key: string]: any}>({});
    const paymentInfo = ref({});
    const deliveryData = ref({});
    const notFound = ref<boolean | null>(null);

    const restaurantId = useRestaurantId();

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
          return !!shopInfo.value.supportLiff;
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

    const { user } = useUserData();

    const { promotions } = usePromotions(restaurantId.value, user);
    
    onUnmounted(() => {
      if (restaurant_detacher) {
        restaurant_detacher();
      }
    });
    return {
      mode,
      moPrefix,

      shopInfo,
      paymentInfo,
      deliveryData,
      notFound,

      promotions,
    };
  },
});
</script>
