<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Logs</h2>
    <table>
      <tr v-for="log in logs" :key="log.id">
        <td class="p-b-4">
          {{ log.cmd }}
          <div class="m-l-8">{{log.key}} {{log.value}}</div>
        </td>
        <td class="p-l-8">{{log.success ? "success": log.error}}</td>
        <td class="p-l-8">
          <nuxt-link :to="`/s/admins/${log.uid}`">{{log.email || log.uid}}</nuxt-link>
        </td>
        <td class="p-l-8">{{log.uidSuper.slice(0,8) + "..."}}</td>
      </tr>
    </table>
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
      .collectionGroup("adminlogs")
      .orderBy("createdAt", "desc")
      .limit(100)
      .onSnapshot(snapshot => {
        this.logs = snapshot.docs.map(doc => {
          const log = doc.data();
          log.id = doc.id;
          log.createdAt = log.createdAt.toDate();
          return log;
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  }
};
</script>
