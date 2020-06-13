<template>
<div>
  <router-view></router-view>
  <notification-watcher />
</div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import NotificationWatcher from "./NotificationWatcher";

export default {
  components: {
    NotificationWatcher,
  },
  data() {
    return {};
  },
  async created() {
    console.log("created");
  },
  destroyed() {
    console.log("destroyed");
  },
}

</script>
