<template>
  <div class="inline-block" v-if="isUser">
    <a @click="handleLike">
      <div v-if="likes" class="inline-flex items-center justify-center">
        <i class="material-icons mr-2 text-lg text-red-700">favorite</i>
        <div class="text-sm font-bold text-red-700">
          {{ $t("shopInfo.liked") }}
        </div>
      </div>

      <div v-else class="inline-flex items-center justify-center">
        <i class="material-icons text-lg text-op-teal">favorite_border</i>
        <div class="text-sm font-bold text-op-teal">
          {{ $t("shopInfo.like") }}
        </div>
      </div>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onUnmounted } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { useRestaurantId, useUserData } from "@/utils/utils";
import { ReviewData } from "@/models/reviewData";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const review = ref<ReviewData>({});
    let detacher: any = null;
    const restaurantId = useRestaurantId();

    const { isUser, uid } = useUserData();

    const path = computed(() => {
      return `users/${uid.value}/reviews/${restaurantId.value}`;
    });

    if (isUser.value) {
      detacher = onSnapshot(doc(db, path.value), (snapshot) => {
        review.value = snapshot.data() || {};
        if (review.value.restaurantName) {
          // Check if the cached info is out of date, update them.
          if (
            review.value.restaurantName !== props.shopInfo.restaurantName ||
            review.value.restProfilePhoto != props.shopInfo.restProfilePhoto
          ) {
            setDoc(
              doc(db, path.value),
              {
                restaurantName: props.shopInfo.restaurantName, // duplicated for quick display
                restProfilePhoto: props.shopInfo.restProfilePhoto, // duplicated for quick display
              },
              { merge: true },
            );
          }
        }
      });
    }

    onUnmounted(() => {
      detacher && detacher();
    });

    const likes = computed(() => {
      return !!review.value.likes;
    });

    const handleLike = () => {
      // Notice that mounted() will automatically update duplicated restaurant info.
      const nextState = !likes.value;
      setDoc(
        doc(db, path.value),
        {
          likes: nextState,
          restaurantName: props.shopInfo.restaurantName, // duplicated for quick display
          restProfilePhoto: props.shopInfo.restProfilePhoto, // duplicated for quick display
          timeLiked: serverTimestamp(),
          restaurantId: restaurantId.value, // Making it possible to collection query (later)
        },
        { merge: true },
      );
    };

    return {
      likes,
      handleLike,
      isUser,
    };
  },
});
</script>
