<template>
  <router-view
    :shopInfo="shopInfo"
    :paymentInfo="paymentInfo"
    :deliveryData="deliveryData"
    :mode="mode"
    :mo_prefix="mo_prefix"
    :notFound="notFound"
  />
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

export default defineComponent({
  name: "RestaurantWrapper",
  setup(props, ctx) {
    const mode = routeMode(ctx.root);
    const mo_prefix = getMoPrefix(ctx.root);

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
        const restaurant_data = restaurant.data();
        shopInfo.value = restaurant_data || {};
        const exist_and_publig =
          restaurant.exists() &&
          !shopInfo.value.deletedFlag &&
          shopInfo.value.publicFlag;

        if (exist_and_publig) {
          if (mode.value === "liff") {
            notFound.value = !shopInfo.value.supportLiff;
          } else {
            notFound.value = false;
          }
        } else {
          notFound.value = true;
        }
        if (!notFound.value) {
          const uid = restaurant_data.uid;
          getDoc(doc(db, `/admins/${uid}/public/payment`)).then((snapshot) => {
            paymentInfo.value = snapshot.data() || {};
            console.log(paymentInfo.value);
          });
          if (shopInfo.value.enableDelivery) {
            getDoc(
              doc(db, `restaurants/${restaurantId.value}/delivery/area`)
            ).then((snapshot) => {
              deliveryData.value = snapshot.data() || {};
            });
          }
        }
      }
    );
    const detachers = [restaurant_detacher];
    onUnmounted(() => {
      if (detachers) {
        detachers.map((detacher) => {
          detacher();
        });
      }
    });
    return {
      mode,
      mo_prefix,
      shopInfo,
      paymentInfo,
      deliveryData,
      notFound,
    };
  },
});
</script>
