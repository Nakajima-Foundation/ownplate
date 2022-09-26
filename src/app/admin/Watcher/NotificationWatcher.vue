<template></template>

<script>
import { defineComponent, ref, onUnmounted } from "@vue/composition-api";
import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot } from "firebase/firestore";

export default defineComponent({
  props: {
    notificationConfig: Object,
  },
  setup(props, ctx) {
    const watchingMessage = ref(false);
    const uid = ctx.root.$store.getters.uidAdmin;

    const message_detacher = onSnapshot(
      doc(db, `admins/${uid}/private/notification`),
      (notification) => {
        if (notification.exists) {
          const notification_data = notification.data();
          if (
            ctx.root.$route.path.indexOf(notification_data.path) > -1 &&
            notification_data.sound &&
            props.notificationConfig.soundOn &&
            watchingMessage.value
          ) {
            ctx.root.soundPlay("NotificationWatcher: newMessage");
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
