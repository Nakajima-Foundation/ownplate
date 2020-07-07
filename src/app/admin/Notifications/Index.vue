<template>
  <div>
    <!-- Notification Settings Button -->
    <notification-setting-button
      :notificationData="notificationData || defaultNotificationData"
      @openNotificationSettings="openNotificationSettings"
    />

    <!-- Notification Settings Popup-->
    <notification-settings
      :shopInfo="shopInfo"
      :notificationData="notificationData"
      :NotificationSettingsPopup="NotificationSettingsPopup"
      @close="closeNotificationSettings"
      v-if="notificationData"
    />
  </div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";

import NotificationSettings from "./NotificationSettings";
import NotificationSettingButton from "./NotificationSettingButton";

export default {
  props: {
    shopInfo: {
      type: Object,
      required: true
    }
  },
  components: {
    NotificationSettings,
    NotificationSettingButton
  },
  data() {
    return {
      NotificationSettingsPopup: false,
      notificationData: null,
      defaultNotificationData: {
        soundOn: null,
        infinityNotification: null,
        uid: this.$store.getters.uidAdmin,
        createdAt: firestore.FieldValue.serverTimestamp()
      }
    };
  },
  async created() {
    try {
      const notification = await db
        .doc(`restaurants/${this.restaurantId()}/private/notifications`)
        .get();
      this.notificationData = notification.exists
        ? Object.assign(this.defaultNotificationData, notification.data())
        : this.defaultNotificationData;
    } catch (error) {
      if (error.code === "permission-denied") {
        // We can ignore this type of error here
        console.warn("Ignoring", error.code);
      } else {
        throw error;
      }
    }
  },
  methods: {
    openNotificationSettings() {
      this.NotificationSettingsPopup = true;
    },
    closeNotificationSettings() {
      this.NotificationSettingsPopup = false;
    }
  }
};
</script>
