<template>
  <section class="section" style="background-color:#fffafa">
    <p>{{$t("trace.list")}}</p>
    <div class="m-t-16">
      <div v-for="record in records" :key="record.id">
        <span>{{record.timeCreated.toLocaleString()}}</span>
        <span>{{$t('trace.' + record.event)}}</span>
        <span>{{record.restaurantName}}</span>
      </div>
    </div>
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
    console.log(this.restaurantId());
    this.detatcher = db
      .collectionGroup("records")
      .where("restaurantId", "==", this.restaurantId())
      .orderBy("timeCreated", "desc")
      .limit(25)
      .onSnapshot(snapshot => {
        console.log("**** count", snapshot.docs.length);
        this.records = snapshot.docs.map(doc => {
          const record = doc.data();
          record.id = doc.id;
          record.timeCreated = record.timeCreated.toDate();
          return record;
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  }
};
</script>
