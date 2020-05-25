<template>
  <section class="section" style="background-color:#fffafa">
    <div class="align-center m-t-24">
      <qrcode :value="urlMenu" :options="{ width: 160 }"></qrcode>
      <p>{{$t('admin.qrcode.restaurant')}}</p>
    </div>
    <div v-if="trace">
      <div class="align-center m-t-24">
        <qrcode :value="urlEnter" :options="{ width: 160 }"></qrcode>
        <p>{{$t('admin.qrcode.enter')}}</p>
      </div>
      <div class="align-center m-t-24">
        <qrcode :value="urlLeave" :options="{ width: 160 }"></qrcode>
        <p>{{$t('admin.qrcode.leave')}}</p>
      </div>
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
      if (restaurant.trace) {
        this.trace = restaurant.trace;
      } else {
        const refEnter = refRestaurant.collection("trace").doc();
        const refLeave = refRestaurant.collection("trace").doc();
        console.log("new traceIDs", refEnter.id, refLeave.id);
        await db.runTransaction(async transaction => {
          const data = (await transaction.get(refRestaurant)).data();
          console.log(data);
          if (!data.trace) {
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
    urlEnter() {
      return `${location.origin}/t/${this.trace.enter}`;
    },
    urlLeave() {
      return `${location.origin}/t/${this.trace.leave}`;
    },
    urlMenu() {
      return this.shareUrl();
    }
  }
};
</script>
