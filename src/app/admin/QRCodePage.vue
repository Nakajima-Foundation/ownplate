<template>
  <section class="section" style="background-color:#fffafa">
    <div class="align-center m-t-24">
      <qrcode :value="urlMenu" :options="{ width: 160 }"></qrcode>
      <p>
        <a :href="urlMenu">{{restaurant.restaurantName}}</a>
      </p>
    </div>
    <div v-if="trace && regionalSetting.covid19trace">
      <div class="align-center m-t-24">
        <qrcode :value="urlEnter" :options="{ width: 160 }"></qrcode>
        <p>
          <a :href="urlEnter">{{$t('admin.qrcode.enter')}}</a>
        </p>
      </div>
      <div class="align-center m-t-24">
        <qrcode :value="urlLeave" :options="{ width: 160 }"></qrcode>
        <p>
          <a :href="urlLeave">{{$t('admin.qrcode.leave')}}</a>
        </p>
      </div>
      <div class="align-center m-t-24">
        <router-link :to="`/admin/restaurants/${restaurantId()}/traces`">
          <div class="op-button-small tertiary">{{ $t("trace.list") }}</div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import { regionalSettings } from "~/plugins/constant.js";
import { ownPlateConfig } from "@/config/project";

export default {
  data() {
    return {
      restaurant: {},
      detacher: null,
      trace: null
    };
  },
  created() {
    const refRestaurant = db.doc(`restaurants/${this.restaurantId()}`);
    this.detacher = refRestaurant.onSnapshot(async snapshot => {
      this.restaurant = snapshot.data();
      if (this.restaurant.trace) {
        this.trace = this.restaurant.trace;
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
              traceId: refEnter.id,
              restaurantId: this.restaurantId()
            });
            transaction.set(refLeave, {
              event: "leave",
              uid: this.user.uid,
              traceId: refLeave.id,
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
    regionalSetting() {
      return regionalSettings[ownPlateConfig.region || "US"];
    },
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
