<template>
  <section class="section">
    <back-button url="/s" />
    <h2>Profiles</h2>
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
      prefix: "u",
      detacher: null
    };
  },
  mounted() {
    this.detatcher = db
      .collectionGroup("private")
      .limit(100)
      .where("email", ">=", this.prefix)
      .where("email", "<=", this.prefix + "\uf8ff")
      .onSnapshot(snapshot => {
        const docs = snapshot.docs.map(doc => doc.data());
        console.log(docs);
      });
  },
  destroyed() {
    this.detacher && this.detacher();
  }
};
</script>
