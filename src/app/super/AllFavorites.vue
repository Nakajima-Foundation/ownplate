<template>
  <div class="mx-6 mt-6">
    <div>
      <div v-for="(review, key) in reviews">
        <img
          :src="resizedProfileImage(review, '600')"
          class="h-12 w-12 rounded-full object-cover"
        />
        <router-link :to="`/r/${review.restaurantId}`">
          {{ review.restaurantName }}
        </router-link>
        {{ moment(review.timeLiked.toDate()).format("YYYY/MM/DD HH:mm") }}
        {{ review.uid }}
      </div>
    </div>
    <div v-if="last">
      <o-button @click="nextLoad">more</o-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { db } from "@/plugins/firebase";

import { useSuper } from "@/utils/utils";

export default defineComponent({
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super All Favorites"].join(" / "),
    };
  },
  setup() {
    useSuper();
    
    const reviews = ref<any[]>([]);
    const last = ref<any>(null)
    let isLoading = false

    const loadData = async () => {
      if (!isLoading) {
        isLoading = true;
        let query = db
          .collectionGroup("reviews")
          .orderBy("timeLiked", "desc")
          .limit(500);
        if (last.value) {
          query = query.startAfter(last.value);
        }
        const snapshot = await query.get();

        if (!snapshot.empty) {
          last.value = snapshot.docs[snapshot.docs.length - 1];
          let i = 0;
          for (; i < snapshot.docs.length; i++) {
            const doc = snapshot.docs[i];
            const userId = doc.ref.path.split("/")[1];
            const review = doc.data();
            review.uid = userId;
            reviews.value.push(review);
          }
        } else {
          last.value = null;
        }
      }
      isLoading = false;
    };
    loadData();

    const nextLoad = () => {
      if (last.value) {
        loadData();
      }
    };
    return {
      reviews,
      nextLoad,
      last,
    };

  },
});
</script>
