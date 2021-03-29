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
import { db, firestore } from "~/plugins/firebase.js";

export default {
  components: {},
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
    suffix: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      url: this.shareUrl() + (this.suffix || ""),
      sharePopup: false,
      review: {},
      detacher: null
    };
  },
  mounted() {
    if (this.isUser) {
      this.detacher = db
        .doc(`users/${this.user.uid}/reviews/${this.restaurantId()}`)
        .onSnapshot(snapshot => {
          this.review = snapshot.data() || {};
          if (this.review.restaurantName) {
            // Check if the cached info is out of date, update them.
            if (
              this.review.restaurantName !== this.shopInfo.restaurantName ||
              this.review.restProfilePhoto != this.shopInfo.restProfilePhoto
            ) {
              db.doc(
                `users/${this.user.uid}/reviews/${this.restaurantId()}`
              ).set(
                {
                  restaurantName: this.shopInfo.restaurantName, // duplicated for quick display
                  restProfilePhoto: this.shopInfo.restProfilePhoto // duplicated for quick display
                },
                { merge: true }
              );
            }
          }
        });
    }
  },
  destroyed() {
    this.detacher && this.detacher();
  },
  computed: {
    likes() {
      return !!this.review.likes;
    }
  },
  methods: {
    handleLike() {
      // Notice that mounted() will automatically update duplicated restaurant info.
      db.doc(`users/${this.user.uid}/reviews/${this.restaurantId()}`).set(
        {
          likes: !this.likes,
          restaurantName: this.shopInfo.restaurantName, // duplicated for quick display
          restProfilePhoto: this.shopInfo.restProfilePhoto, // duplicated for quick display
          timeLiked: firestore.FieldValue.serverTimestamp(),
          restaurantId: this.restaurantId() // Making it possible to collection query (later)
        },
        { merge: true }
      );
    }
  }
};
</script>
