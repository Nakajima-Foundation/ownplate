<template>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
import { soundFiles } from "~/plugins/constant.js";

export default {
  props: {
    notificationConfig: Object,
  },
  data() {
    return {
      soundIndex: undefined,
    }
  },
  watch: {
    async "notificationConfig.soundOn"(newData) {
      this.$store.commit("setSoundOn", newData);
    },
    async "notificationConfig.nameKey"(newData) {
      this.soundIndex = this.getSoundIndex(newData);
    },
    async soundIndex(newData) {
      this.$store.commit("setSoundFile", soundFiles[newData].file);
    }
  },
}

</script>
