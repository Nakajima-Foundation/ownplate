<template>
<router-view
  :shopInfo="shopInfo"
  :paymentInfo="paymentInfo"
  :deliveryData="deliveryData"
  :notFound="notFound"
  />
</template>

<script>
import { db } from "~/plugins/firebase.js";

export default {
  name: "RestaurantWrapper",
  data() {
    return {
      shopInfo: {},
      paymentInfo: {},
      deliveryData: {},
      detacher: [],
      notFound: null,
    }
  },
  created() {
    const restaurant_detacher = db
      .doc(`restaurants/${this.restaurantId()}`)
      .onSnapshot(async restaurant => {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data || {};
        if (
          restaurant.exists &&
          !restaurant.data().deletedFlag &&
          restaurant.data().publicFlag
        ) {
          this.notFound = false;
        } else {
          this.notFound = true;
        }
        if (!this.notFound) {
          const uid = restaurant_data.uid;
          db.doc(`/admins/${uid}/public/payment`)
            .get().then((snapshot) => {
              this.paymentInfo = snapshot.data() || {};
            });
          if (this.shopInfo.enableDelivery) {
            db.doc(`restaurants/${this.restaurantId()}/delivery/area`)
              .get().then((snapshot) => {
                this.deliveryData = snapshot.data() || {};
              });
          }
        }
      });
    this.detacher = [restaurant_detacher];
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map(detacher => {
        detacher();
      });
    }
  },

                  
};

</script>