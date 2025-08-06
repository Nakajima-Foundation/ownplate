<template>
  <div>
    <router-view
      v-if="shopInfo.restaurantId"
      :shopInfo="shopInfo"
      :paymentInfo="paymentInfo"
      :deliveryData="deliveryData"
      :mode="mode"
      :notFound="notFound"
      :promotions="promotions"
    />
    <NotFound v-else-if="notFound" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";
import { routeMode, useUserData, useRestaurantId } from "@/utils/utils";

import NotFound from "@/components/NotFound.vue";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { usePromotions } from "@/utils/promotion";

export default defineComponent({
  name: "RestaurantWrapper",
  components: {
    NotFound,
  },
  setup() {
    const mode = routeMode();

    const shopInfo = ref<RestaurantInfoData | { [key: string]: any }>({});
    const paymentInfo = ref({});
    const deliveryData = ref({});
    const notFound = ref<boolean | null>(null);

    const restaurantId = useRestaurantId();

    const updateRestaurant = async () => {
      const restaurant = await getDoc(
        doc(db, `restaurants/${restaurantId.value}`),
      );
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
            doc(db, `restaurants/${restaurantId.value}/delivery/area`),
          ).then((snapshot) => {
            deliveryData.value = snapshot.data() || {};
          });
        }
      }
    };
    updateRestaurant();

    const { user } = useUserData();

    const { promotions } = usePromotions(restaurantId.value, user);

    return {
      mode,

      shopInfo,
      paymentInfo,
      deliveryData,
      notFound,

      promotions,
    };
  },
});
</script>
