<template>
  <div class="mx-6 mt-4">
    <div>
      <div v-for="(review, key) in reviews" :key="key">
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
      <button @click="nextLoad">more</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { db } from "@/lib/firebase/firebase9";
import {
  collectionGroup,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
} from "firebase/firestore";
import moment from "moment";

import { useSuper, resizedProfileImage, defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  setup() {
    useSuper();

    const reviews = ref<any[]>([]);
    const last = ref<any>(null);
    let isLoading = false;

    useHead(() => ({
      title: [defaultTitle, "Super All Favorites"].join(" / "),
    }));

    const loadData = async () => {
      if (!isLoading) {
        isLoading = true;
        let myQuery = query(
          collectionGroup(db, "reviews"),
          orderBy("timeLiked", "desc"),
          limit(500),
        );
        if (last.value) {
          myQuery = query(myQuery, startAfter(last.value));
        }
        const snapshot = await getDocs(myQuery);

        if (snapshot.empty) {
          last.value = null;
        } else {
          last.value = snapshot.docs[snapshot.docs.length - 1];
          let i = 0;
          for (; i < snapshot.docs.length; i++) {
            const doc = snapshot.docs[i];
            const userId = doc.ref.path.split("/")[1];
            const review = doc.data();
            review.uid = userId;
            reviews.value.push(review);
          }
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
      moment,
      resizedProfileImage,
    };
  },
});
</script>
