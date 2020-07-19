<template>
  <div>
    <!-- Share / Favorite Buttons -->
    <div class="m-t-8 align-center">
      <div class="op-button-text m-r-8" @click="openShare()">
        <i class="material-icons">launch</i>
        <span>{{$t('shopInfo.share')}}</span>
      </div>

      <!-- Favorite -->
      <div class="is-inline-block" v-if="isUser">
        <div class="op-button-text" @click="handleLike">
          <!-- Like -->
          <template v-if="likes">
            <i class="material-icons c-status-red">favorite</i>
            <span class="c-status-red">{{$t('shopInfo.liked')}}</span>
          </template>
          <!-- Liked -->
          <template v-else>
            <i class="material-icons">favorite_border</i>
            <span>{{$t('shopInfo.like')}}</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Share Popup-->
    <b-modal :active.sync="sharePopup" :width="488" scroll="keep" style="text-align: initial;">
      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">{{$t('shopInfo.share')}}</div>
        <div class="cols">
          <div>
            <qrcode :value="url" :options="{ width: 160 }"></qrcode>
          </div>
          <div>
            <nuxt-link to="#" @click.native="copyClipboard(url)" event>
              <div class="op-button-text m-t-8">
                <i class="material-icons">file_copy</i>
                <span>{{$t('shopInfo.copyUrl')}}</span>
              </div>
            </nuxt-link>
            <div class="m-l-8 t-body2 c-text-black-disabled">{{this.url}}</div>
            <div class="m-t-24">
              <sharing-buttons :title="shopInfo.restaurantName" :url="url" />
            </div>
          </div>
        </div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="closeShare()">{{$t('menu.close')}}</div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import SharingButtons from "~/app/user/Common/SharingButtons";
import { db, firestore } from "~/plugins/firebase.js";

export default {
  components: {
    SharingButtons
  },
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
    openShare() {
      this.sharePopup = true;
    },
    closeShare() {
      this.sharePopup = false;
    },
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
