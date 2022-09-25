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
      :notificationSettingsPopup="notificationSettingsPopup"
      @close="closeNotificationSettings"
      v-if="notificationData"
    />
  </div>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
import { db, firestore } from "@/plugins/firebase";

import NotificationSettings from "./NotificationSettings";
import NotificationSettingButton from "./NotificationSettingButton";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  components: {
    NotificationSettings,
    NotificationSettingButton,
  },
  setup(_, ctx) {
    const notificationSettingsPopup = ref(false);
    const notificationData = ref(null);

    const defaultNotificationData = {
      soundOn: null,
      infinityNotification: null,
      uid: ctx.root.$store.getters.uidAdmin,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    (async () => {
      try {
        const notification = await db
          .doc(`restaurants/${ctx.root.restaurantId()}/private/notifications`)
          .get();
        notificationData.value = notification.exists
          ? Object.assign(defaultNotificationData, notification.data())
          : defaultNotificationData;
      } catch (error) {
        if (error.code === "permission-denied") {
          // We can ignore this type of error here
          console.warn("Ignoring", error.code);
        } else {
          throw error;
        }
      }
    })();
    const openNotificationSettings = () => {
      notificationSettingsPopup.value = true;
    };
    const closeNotificationSettings = () => {
      notificationSettingsPopup.value = false;
    };
    return {
      defaultNotificationData,
      notificationData,
      notificationSettingsPopup,

      openNotificationSettings,
      closeNotificationSettings,
    };
  },
});
</script>
