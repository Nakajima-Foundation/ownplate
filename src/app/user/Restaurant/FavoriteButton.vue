<template>
  <!-- Favorite Button -->
  <div class="is-inline-block" v-if="isUser">
    <div class="op-button-text" @click="handleLike">
      <!-- Like -->
      <template v-if="likes">
        <i class="material-icons c-status-red">favorite</i>
        <span class="c-status-red">{{ $t("shopInfo.liked") }}</span>
      </template>
      <!-- Liked -->
      <template v-else>
        <i class="material-icons">favorite_border</i>
        <span>{{ $t("shopInfo.like") }}</span>
      </template>
    </div>
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
