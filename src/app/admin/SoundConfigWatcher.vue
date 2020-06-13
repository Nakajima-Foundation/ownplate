<template>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import { soundFiles } from "~/plugins/constant.js";

export default {
  data() {
    return {
      soundIndex: undefined,
      message_detacher: () => {},
      notification_data: {
        soundOn: null,
        infinityNotification: null,
      },
    }
  },
  async created() {
    this.notification_detacher = db.doc(`restaurants/${this.restaurantId()}/private/notifications`)
      .onSnapshot(notification => {
        let soundIndex = 0;
        if (notification.exists) {
          this.notification_data = Object.assign(
            this.notification_data,
            notification.data()
          );
        }
        this.soundIndex = this.getSoundIndex(this.notification_data.nameKey);
      });
    /*
    this.intervalTask = setInterval(() => {
      if (this.notification_data.infinityNotification && this.hasNewOrder) {
        this.soundPlay();
      }
    }, 1000 * this.intervalTime);
*/

  },
  destroyed() {
    this.notification_detacher();
  },
  watch: {
    async "notification_data.soundOn"() {
      this.$store.commit("setSoundOn", this.notification_data.soundOn);
    },
    async soundIndex(newData) {
      this.$store.commit("setSoundFile", soundFiles[this.soundIndex].file);
    }
  },
}

</script>
