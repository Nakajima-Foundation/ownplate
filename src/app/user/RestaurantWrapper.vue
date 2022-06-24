<template>
  <router-view
    :shopInfo="shopInfo"
    :paymentInfo="paymentInfo"
    :deliveryData="deliveryData"
    :mode="mode"
    :notFound="notFound"
  />
</template>

<script>
import { db } from "@/plugins/firebase";
import { routeMode } from "@/utils/utils";

export default {
  name: "RestaurantWrapper",
  data() {
    const mode = routeMode(this.$router.currentRoute.path);
    return {
      shopInfo: {},
      paymentInfo: {},
      deliveryData: {},
      detacher: [],
      notFound: null,
      mode,
    };
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(async (restaurant) => {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data || {};
        const exist_and_publig =
          restaurant.exists &&
          !restaurant.data().deletedFlag &&
          restaurant.data().publicFlag;

        if (exist_and_publig) {
          if (this.mode === "liff") {
            this.notFound = !this.shopInfo.supportLiff;
          } else {
            this.notFound = false;
          }
        } else {
          this.notFound = true;
        }
        if (!this.notFound) {
          const uid = restaurant_data.uid;
          db.doc(`/admins/${uid}/public/payment`)
            .get()
            .then((snapshot) => {
              this.paymentInfo = snapshot.data() || {};
            });
          if (this.shopInfo.enableDelivery) {
            db.doc(`restaurants/${this.restaurantId()}/delivery/area`)
              .get()
              .then((snapshot) => {
                this.deliveryData = snapshot.data() || {};
              });
          }
        }
      });
    this.detacher = [restaurant_detacher];
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map((detacher) => {
        detacher();
      });
    }
  },
};
</script>
