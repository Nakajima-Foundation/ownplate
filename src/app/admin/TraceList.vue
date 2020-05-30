<template>
  <section class="section" style="background-color:#fffafa">
    <p>$t("trace.list")</p>
  </section>
</template>

<script>
import { db, firestore } from "~/plugins/firebase.js";
export default {
  data() {
    return {
      detatcher: null,
      records: []
    };
  },
  created() {
    this.detatcher = db
      .collectionGroup("records")
      .where("restaurantId", "==", this.restaurantId())
      .orderBy("timeCreated", "desc")
      .limit(25)
      .onSnapshot(snapshot => {
        this.records = snapshot.docs.map(doc => {
          const record = doc.data();
          record.id = doc.id;
          return record;
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  }
};
</script>
