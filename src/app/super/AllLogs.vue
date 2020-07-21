<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Logs</h2>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";

export default {
  components: {
    BackButton
  },
  data() {
    return {
      logs: [],
      detacher: null
    };
  },
  async mounted() {
    if (!this.$store.state.user || this.$store.getters.isNotSuperAdmin) {
      this.$router.push("/");
    }
  },
  created() {
    this.detatcher = db
      .collectionGroup("logs")
      .orderBy("createdAt", "desc")
      .where("admin", "==", true)
      .limit(100)
      .onSnapshot(snapshot => {
        this.logs = snapshot.docs.map(doc => {
          const log = doc.data();
          log.id = doc.id;
          log.createdAt = log.createdAt.toDate();
          return log;
        });
        console.log("***", this.logs);
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  }
};
</script>
