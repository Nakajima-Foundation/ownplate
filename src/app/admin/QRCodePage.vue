<template>
  <section class="section" style="background-color:#fffafa">
    <div class="align-center m-t-24">
      <qrcode :value="url" :options="{ width: 160 }"></qrcode>
      <p>{{$t('admin.qrcode.restaurant')}}</p>
    </div>
  </section>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
export default {
  data() {
    return {
      detacher: null,
      trace: null
    };
  },
  created() {
    const refRestaurant = db.doc(`restaurants/${this.restaurantId()}`);
    this.detacher = refRestaurant.onSnapshot(async snapshot => {
      const restaurant = snapshot.data();
      if (!restaurant.trace) {
        const refEnter = refRestaurant.collection("trace").doc();
        const refLeave = refRestaurant.collection("trace").doc();
        console.log("new traceIDs", refEnter.id, refLeave.id);
        await db.runTransaction(async transaction => {
          transaction.set(refEnter, {
            event: "enter",
            uid: this.user.uid,
            id: refEnter.id,
            restaurantId: this.restaurantId()
          });
          transaction.set(refLeave, {
            event: "leave",
            uid: this.user.uid,
            id: refLeave.id,
            restaurantId: this.restaurantId()
          });
          transaction.update(refRestaurant, {
            trace: {
              enter: refEnter.id,
              leave: refLeave.id
            }
          });
        });
      }
    });
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    url() {
      return this.shareUrl();
    }
  }
};
</script>
