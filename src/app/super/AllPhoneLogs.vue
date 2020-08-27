<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Logs</h2>
    <table>
      <tr v-for="log in logs" :key="log.id">
        <td class="p-b-4">
          {{moment(log.updatedAt.toDate()).format("YYYY:MM:DD HH:mm")}}/<nuxt-link :to="`/r/${log.restaurantId}`">{{log.restaurantId}}</nuxt-link>/{{ log.orderId }}
        </td>
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
      .collectionGroup("phoneLog")
      .orderBy("updatedAt", "desc")
      .limit(100)
      .onSnapshot(snapshot => {
        this.logs = snapshot.docs.map(doc => {
          const log = doc.data();
          log.id = doc.id;
          log.createdAt = log.updatedAt.toDate();
          return log;
        });
        console.log(this.logs);
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  }
};
</script>
