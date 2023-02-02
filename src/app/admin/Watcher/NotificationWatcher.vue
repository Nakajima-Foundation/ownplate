<template></template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from "vue";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot } from "firebase/firestore";

import { useAdminUids, useSoundPlay } from "@/utils/utils";
import { useRoute } from "vue-router";

export default defineComponent({
  props: {
    notificationConfig: Object,
  },
  setup(props) {
    const route = useRoute();

    const watchingMessage = ref(false);

    const { ownerUid } = useAdminUids();

    const soundPlay = useSoundPlay();
    const message_detacher = onSnapshot(
      doc(db, `admins/${ownerUid.value}/private/notification`),
      (notification) => {
        if (notification.exists()) {
          const notification_data = notification.data();
          if (
            route.path.indexOf(notification_data.path) > -1 &&
            notification_data.sound &&
            props?.notificationConfig?.soundOn &&
            watchingMessage.value
          ) {
            soundPlay("NotificationWatcher: newMessage");
          }
        }
        watchingMessage.value = true;
      },
      (error) => {
        if (error.code === "permission-denied") {
          // We can ignore this type of error here
          console.warn("Ignoring", error.code);
        } else {
          throw error;
        }
      }
    );
    onUnmounted(() => {
      message_detacher();
    });
  },
});
</script>
