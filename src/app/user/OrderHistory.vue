<template>
  <section class="section">
    <h2>Order History</h2>
  </section>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";

export default {
  data() {
    return {};
  },
  async created() {
    console.log("created", this.uid);
    if (this.uid) {
      const snapshott = await db
        .collectionGroup("orders")
        .where("uid", "==", this.uid)
        .get();
      console.log("snapshot", snapshot, snapshot.docs);
    }
  },
  computed: {
    uid() {
      return this.$store.getters.uidUser;
    }
  }
};
</script>
