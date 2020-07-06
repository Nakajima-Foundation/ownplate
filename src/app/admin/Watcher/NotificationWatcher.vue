<template></template>

<script>
import { db, firestore } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      message_detacher: () => {},
      uid: this.$store.getters.uidAdmin,
      notifications: [],
      watchingMessage: false
    };
  },
  async created() {
    this.watchingMessage = false;
    this.message_detacher = db
      .doc(`admins/${this.uid}/private/notification`)
      .onSnapshot(
        notification => {
          if (notification.exists) {
            const notification_data = notification.data();
            this.notifications.push(notification_data);
            if (
              this.$route.path.indexOf(notification_data.path) > -1 &&
              notification_data.sound &&
              this.watchingMessage
            ) {
              this.soundPlay("NotificationWatcher: newMessage");
            }
          }
          this.watchingMessage = true;
        },
        error => {
          // We can ignore this error here
          console.error(error.message);
        }
      );
  },
  destroyed() {
    this.message_detacher();
  }
};
</script>
