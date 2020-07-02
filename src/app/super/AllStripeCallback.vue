<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Callbacks</h2>
    <div v-for="log in logs" :key="log.id">
      <router-link :to="`/s/callbacks/${log.uid}/${log.id}`">
        {{moment(log.created.toDate()).format("YYYY-MM-DD hh:mm")}}/{{log.uid || log.data.uid}}/{{stripeActionStrings[log.action]}}
      </router-link>
    </div>
    <button @click="nextLoad">next</button>
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
      last: null,
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
          this.last = doc;
          const log = doc.data();
          log.id = doc.id;
          return log;
        });
      });
  },
  methods: {
    async nextLoad() {
      const nextData = await db.collectionGroup("stripeLogs")
        .orderBy("created", "desc")
        .startAfter(this.last)
        .limit(100).get();
      if (!nextData.empty) {
        nextData.docs.forEach(doc => {
          this.last = doc;
          const log = doc.data();
          log.id = doc.id;
          this.logs.push(log);
        });
      }

    }
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
}
</script>
