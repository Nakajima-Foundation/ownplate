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

import { db } from "@/plugins/firebase";
import { routeMode, getMoPrefix } from "@/utils/utils";

export default defineComponent({
  name: "RestaurantWrapper",
  setup(props, ctx) {
    const mode = routeMode(ctx.root.$router.currentRoute.path);
    const mo_prefix = getMoPrefix(ctx.root.$router.currentRoute.path);
    
    const shopInfo = ref({});
    const paymentInfo = ref({});
    const deliveryData = ref({});
    const notFound = ref(null);

    const restaurantId = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });
    
    const restaurant_detacher = db
      .doc(`restaurants/${restaurantId.value}`)
      .onSnapshot(async (restaurant) => {
        const restaurant_data = restaurant.data();
        shopInfo.value = restaurant_data || {};
        const exist_and_publig =
          restaurant.exists &&
          !restaurant.data().deletedFlag &&
          restaurant.data().publicFlag;

        if (exist_and_publig) {
          if (mode === "liff") {
            notFound.value = !shopInfo.value.supportLiff;
          } else {
            notFound.value = false;
          }
        } else {
          notFound.value = true;
        }
        if (!notFound.value) {
          const uid = restaurant_data.uid;
          db.doc(`/admins/${uid}/public/payment`)
            .get()
            .then((snapshot) => {
              paymentInfo.value = snapshot.data() || {};
            });
          if (shopInfo.value.enableDelivery) {
            db.doc(`restaurants/${restaurantId.value}/delivery/area`)
              .get()
              .then((snapshot) => {
                deliveryData.value = snapshot.data() || {};
              });
          }
        }
      });
    const detachers = [restaurant_detacher];
    onUnmounted(() => {
      if (detacher) {
        detacher.map((detacher) => {
          detacher();
        });
      }
    })
    return {
      mode,
      mo_prefix,
      shopInfo,
      paymentInfo,
      deliveryData,
      notFound,
    };
  }
});
</script>
