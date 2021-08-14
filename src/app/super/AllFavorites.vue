<template>
<div class="mt-6 mx-6">
  <div>
    <div v-for="(review, key) in reviews">
      <img :src="resizedProfileImage(review, '600')"
           class="w-12 h-12 rounded-full object-cover"
           />
      <router-link :to="`/r/${review.restaurantId}`">
          {{review.restaurantName}}
      </router-link>
      {{moment(review.timeLiked.toDate()).format("YYYY/MM/DD HH:mm")}}
      {{review.uid}}
    </div>
  </div>
  <div v-if="last">
    <b-button @click="nextLoad">more</b-button>
  </div>
</div>
</template>

<script>
import { db } from "~/plugins/firebase.js";

export default {
  head() {
    return {
      title: [this.defaultTitle, "Super All Favorites"].join(" / ")
    }
  },
  data() {
    return {
      reviews: [],
      isLoading: false,
      last: null,
    }
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      if (!this.isLoading) {
        this.isLoading = true;
        let query = db
            .collectionGroup("reviews")
            .orderBy("timeLiked", "desc")
            .limit(500);
        if (this.last) {
          query = query.startAfter(this.last);
        }
        const snapshot = await query.get();

        if (!snapshot.empty) {
          this.last = snapshot.docs[snapshot.docs.length - 1];
          let i = 0;
          for(; i < snapshot.docs.length; i ++) {
            const doc = snapshot.docs[i];
            const userId = doc.ref.path.split("/")[1];
            const review = doc.data();
            review.uid = userId;
            this.reviews.push(review);
          }
        } else {
          this.last = null;
        }
      }
      this.isLoading = false;
    },

    async nextLoad() {
      if (this.last) {
        this.loadData();
      }
    },
  }
};
</script>
