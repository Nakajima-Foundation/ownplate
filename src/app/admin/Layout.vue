<template>
<div>
  <router-view></router-view>
  <notification-watcher />
  <sound-config-watcher />
</div>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import NotificationWatcher from "./NotificationWatcher";
import SoundConfigWatcher from "./SoundConfigWatcher";

export default {
  components: {
    NotificationWatcher,
    SoundConfigWatcher,
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
