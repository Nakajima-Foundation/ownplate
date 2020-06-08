<template>
  <div>
    <div>{{prefectureName}}</div>
    <div v-for="restaurant in restaurants">
      {{restaurant.restaurantName}}
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { db, storage, firestore } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      prefectureName: "",
      restaurants: [],
    }
  },
  methods: {
    prefectureId() {
      return this.$route.params.prefectureId;
    }
  },
  async created() {
    this.prefectureName = this.regionalSetting.AddressStates[this.prefectureId()];
    if (this.prefectureName) {
      const res = await db.collection("restaurants")
            .where("publicFlag", "==", true)
            .where("deletedFlag", "==", false)
            .where("state", "==", this.prefectureName)
            .get();
      this.restaurants = (res.docs || []).map(doc => {
        const data = doc.data();
        data.id = doc.id;
        return data;
      });
    }
  }
}
</script>
