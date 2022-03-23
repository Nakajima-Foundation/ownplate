<template>
  <div>
    Index
    <div v-for="(doc, k) in docs">
      <router-link :to="`/liff/${liffIndexId}/r/${doc.id}`">{{doc.restaurantName}}</router-link>
    </div>
  </div>
</template>
<script>
import { db } from "~/plugins/firebase.js";
import firebase from "firebase/app";

export default {
  props: {
    config: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      docs: [],
    };
  },
  async created() {
    const collect = await db.collection("restaurants").where(
      firebase.firestore.FieldPath.documentId(),
      "in",
      (this.config.restaurants || [])
    ).get()
    this.docs = collect.docs.map((a) => {
      const data = a.data()
      data.id = a.id
      return data;
    });
    
  },
};
</script>
