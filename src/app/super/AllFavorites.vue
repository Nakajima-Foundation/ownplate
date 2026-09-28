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
      <button
        @click="nextLoad"
        class="cursor-pointe cursor-pointer rounded border-2 border-black/40 bg-gray-200 p-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-25"
      >
        more
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import type { ReviewData } from "@/models/reviewData";
import { db } from "@/lib/firebase/firebase9";
import {
  collectionGroup,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import moment from "moment";

import {
  collectionData,
  useSuper,
  resizedProfileImage,
  defaultTitle,
} from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  setup() {
    useSuper();

    // timeLiked で並べて読むので、timeLiked の無い文書は Firestore が返さない。
    type ReviewRow = ReviewData & { timeLiked: Timestamp; uid?: string };
    const reviews = ref<ReviewRow[]>([]);
    const last = ref<QueryDocumentSnapshot | null>(null);
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
            const review = collectionData<ReviewRow>(doc.data());
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
