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
        // Strictly speaking, we need a transaction here, but practically speaking we don't need.
        const docEnter = await refRestaurant.collection("trace").add({
          event: "enter",
          uid: this.user.uid,
          restaurantId: this.restaurantId()
        });
        const docLeave = await refRestaurant.collection("trace").add({
          event: "leave",
          uid: this.user.uid,
          restaurantId: this.restaurantId()
        });
        console.log("new traceIDs", docEnter.id, docLeave.id);
        refRestaurant.update({
          trace: {
            enter: docEnter.id,
            leave: docLeave.id
          }
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
