<template>
  <div>
    <!-- Notification Settings Button -->
    <notification-setting-button
      :notificationData="notificationData"
      @openNotificationSettings="openNotificationSettings"
    />

    <!-- Notification Settings Popup-->
    <notification-settings
      :shopInfo="shopInfo"
      :notificationData="notificationData"
      :notificationSettingsPopup="notificationSettingsPopup"
      @close="closeNotificationSettings"
      v-if="notificationData && loaded"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";

import NotificationSettings from "@/app/admin/Notifications/NotificationSettings.vue";
import NotificationSettingButton from "@/app/admin/Notifications/NotificationSettingButton.vue";
import {
  useRestaurantId
} from "@/utils/utils";
import { useStore } from "vuex";

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
  setup() {
    const store = useStore();
    
    const restaurantId = useRestaurantId();
    const notificationSettingsPopup = ref(false);
    const defaultNotificationData = {
      soundOn: null,
      infinityNotification: null,
      uid: store.getters.uidAdmin,
      createdAt: serverTimestamp(),
    };
    const notificationData = ref(defaultNotificationData);
    const loaded = ref(false);
    (async () => {
      try {
        const notification = await getDoc(
          doc(
            db,
            `restaurants/${restaurantId.value}/private/notifications`
          )
        );
        notificationData.value = notification.exists()
          ? Object.assign(defaultNotificationData, notification.data())
          : defaultNotificationData;
        loaded.value = true;
      } catch (error: any) {
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
      notificationData,
      notificationSettingsPopup,

      openNotificationSettings,
      closeNotificationSettings,

      loaded,
    };
  },
});
</script>
