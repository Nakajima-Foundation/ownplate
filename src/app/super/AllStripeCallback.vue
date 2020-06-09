<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Callbacks</h2>
    <div v-for="log in logs" :key="log.id">
      <router-link :to="`/s/callbacks/${log.uid}/${log.id}`">
        {{moment(log.created.toDate()).format("YYYY-MM-DD hh:mm")}}/{{log.uid || log.data.uid}}/{{stripeActionStrings[log.action]}}
      </router-link>
    </div>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import { stripeActionStrings } from "~/plugins/stripe"
export default {
  components: {
    BackButton
  },
  data() {
    return {
      logs: [],
      detacher: null,
      stripeActionStrings,
    };
  },
  async mounted() {
    if (!this.$store.state.user || this.$store.getters.isNotSuperAdmin) {
      this.$router.push("/");
    }
    this.detatcher = db
      .collectionGroup("stripeLogs")
      .orderBy("created", "desc")
      .limit(100)
      .onSnapshot(snapshot => {
        this.logs = snapshot.docs.map(doc => {
          const log = doc.data();
          log.id = doc.id;
          return log;
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
}
</script>
