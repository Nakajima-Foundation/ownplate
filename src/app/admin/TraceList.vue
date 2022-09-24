<template>
  <section
    class="mx-auto max-w-full px-6 pb-12 pt-4"
    style="background-color: #fffafa"
  >
    <div class="mb-2 text-xl font-bold text-black text-opacity-40">
      {{ $t("trace.list") }}
    </div>
    <div class="mt-4">
      <div v-for="record in records" :key="record.id">
        <span>{{ record.timeCreated.toLocaleString() }}</span>
        <span>{{ $t("trace." + record.event) }}</span>
        <span>{{ record.uid.slice(-4) }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import { db, firestore } from "@/plugins/firebase";
export default {
  data() {
    return {
      detatcher: null,
      records: [],
    };
  },
  created() {
    console.log(this.restaurantId());
    this.detatcher = db
      .collectionGroup("records")
      .where("restaurantId", "==", this.restaurantId())
      .orderBy("timeCreated", "desc")
      .limit(25)
      .onSnapshot((snapshot) => {
        console.log("**** count", snapshot.docs.length);
        this.records = snapshot.docs.map((doc) => {
          const record = doc.data();
          record.id = doc.id;
          record.timeCreated = record.timeCreated.toDate();
          return record;
        });
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
};
</script>
