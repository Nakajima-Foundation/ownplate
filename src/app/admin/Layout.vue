<template>
<div>
  {{requestTouch}}
  <router-view></router-view>
  <notification-watcher />
  <sound-config-watcher :notificationConfig="notificationConfig" />
  <new-order-watcher :notificationConfig="notificationConfig" />
</div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import NotificationWatcher from "./Watcher/NotificationWatcher";
import SoundConfigWatcher from "./Watcher/SoundConfigWatcher";
import NewOrderWatcher from "./Watcher/NewOrderWatcher";

export default {
  components: {
    NotificationWatcher,
    SoundConfigWatcher,
    NewOrderWatcher,
  },
  data() {
    return {
      notificationConfig: {
        soundOn: null,
        infinityNotification: null,
        nameKey: null,
      },
    };
  },
  computed: {
    requestTouch() {
      const isIOS = /iP(hone|(o|a)d)/.test(navigator.userAgent)
      console.log(this.notificationConfig.soundOn, !this.$store.state.soundEnable, isIOS);
      return this.notificationConfig.soundOn && !this.$store.state.soundEnable && isIOS;
    },
  },
  async created() {
    this.notification_detacher = db.doc(`restaurants/${this.restaurantId()}/private/notifications`)
      .onSnapshot(notification => {
        if (notification.exists) {
          this.notificationConfig = Object.assign(
            this.notificationConfig,
            notification.data()
          );
        }
      });
  },
  destroyed() {
    this.notification_detacher();
  },
}

</script>
