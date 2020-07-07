<template>
  <div>
    <!-- Notification Settings Popup-->
    <notification-settings
      :notificationData="notificationConfig"
      :NotificationSettingsPopup="NotificationSettingsPopup"
      @close="closeNotificationSettings"
      v-if="NotificationSettingsPopup"
    />
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
import NotificationSettings from "./Notifications/NotificationSettings";

export default {
  components: {
    NotificationWatcher,
    SoundConfigWatcher,
    NewOrderWatcher,
    NotificationSettings
  },
  data() {
    return {
      notificationConfig: {
        soundOn: null,
        infinityNotification: null,
        nameKey: null
      },
      justCreated: true,
      NotificationSettingsPopup: false
    };
  },
  computed: {
    requestTouch() {
      console.log(
        this.notificationConfig.soundOn,
        !this.$store.state.soundEnable,
        this.isIOS
      );
      return (
        this.notificationConfig.soundOn &&
        !this.$store.state.soundEnable &&
        this.isIOS
      );
    }
  },
  async created() {
    this.notification_detacher = db
      .doc(`restaurants/${this.restaurantId()}/private/notifications`)
      .onSnapshot(
        notification => {
          console.log("onSnapshot");
          if (notification.exists) {
            this.notificationConfig = Object.assign(
              this.notificationConfig,
              notification.data()
            );
          }
          if (this.justCreated && this.requestTouch) {
            console.log("*** show Sound Test");
            this.NotificationSettingsPopup = true;
          }
          this.justCreated = false;
        },
        error => {
          if (error.code === "permission-denied") {
            // We can ignore this type of error here
            console.warn("Ignoring", error.code);
          } else {
            throw error;
          }
        }
      );
  },
  destroyed() {
    this.notification_detacher && this.notification_detacher();
  },
  methods: {
    closeNotificationSettings() {
      this.NotificationSettingsPopup = false;
    }
  }
};
</script>
