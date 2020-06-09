<template>
  <section class="section">
    <back-button url="/s" />
    <h2>Callback</h2>
    <div v-if="log">
      {{moment(log.created.toDate()).format("YYYY-MM-DD hh:mm")}}/{{log.uid || log.data.uid}}/{{stripeActionStrings[log.action]}}
      <pre>{{log.data}}</pre>
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
      log: null,
      detacher: null,
      stripeActionStrings,
      logUid: this.$route.params.uid,
      logId: this.$route.params.logId
    };
  },
  async mounted() {
    if (!this.$store.state.user || this.$store.getters.isNotSuperAdmin) {
      this.$router.push("/");
    }
    const doc =  await db.doc(`admins/${this.logUid}/stripeLogs/${this.logId}`).get();
    this.log = doc.data();
    console.log(this.log);
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
}
</script>
