<template>
  <div class="inline-block" v-if="isUser">
    <a @click="handleLike">
      <div v-if="likes" class="inline-flex justify-center items-center">
        <i class="material-icons text-lg text-red-700 mr-2">favorite</i>
        <div class="text-sm font-bold text-red-700">
          {{ $t("shopInfo.liked") }}
        </div>
      </div>

      <div v-else class="inline-flex justify-center items-center">
        <i class="material-icons text-lg text-op-teal">favorite_border</i>
        <div class="text-sm font-bold text-op-teal">
          {{ $t("shopInfo.like") }}
        </div>
      </div>
    </a>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onUnmounted,
} from "@vue/composition-api";

import { db, firestore } from "@/plugins/firebase";

export default defineComponent({
  components: {},
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const review = ref({});
    let detacher = null;
    const restaurantId = computed(() => {
      return ctx.root.$route.params.restaurantId;
    });
    const path = computed(() => {
      return `users/${ctx.root.user.uid}/reviews/${restaurantId.value}`;
    });

    if (ctx.root.isUser) {
      detacher = db
        .doc(path.value)
        .onSnapshot((snapshot) => {
          review.value = snapshot.data() || {};
          if (review.value.restaurantName) {
            // Check if the cached info is out of date, update them.
            if (
              review.value.restaurantName !== props.shopInfo.restaurantName ||
              review.value.restProfilePhoto != props.shopInfo.restProfilePhoto
            ) {
              db.doc(path.value).set(
                {
                  restaurantName: props.shopInfo.restaurantName, // duplicated for quick display
                  restProfilePhoto: props.shopInfo.restProfilePhoto, // duplicated for quick display
                },
                { merge: true }
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
      db.doc(path.value).set(
        {
          likes: nextState,
          restaurantName: props.shopInfo.restaurantName, // duplicated for quick display
          restProfilePhoto: props.shopInfo.restProfilePhoto, // duplicated for quick display
          timeLiked: firestore.FieldValue.serverTimestamp(),
          restaurantId: restaurantId.value, // Making it possible to collection query (later)
        },
        { merge: true }
      );
    };

    return {
      likes,
      handleLike,
    };
  },
});
</script>
