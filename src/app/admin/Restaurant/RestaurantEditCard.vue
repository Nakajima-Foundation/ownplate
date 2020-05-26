<template>
  <div>
    <div class="bg-surface r-8 d-low p-t-24 p-b-24 m-b-16">
      <!-- Restaurant Profile Photo -->
      <div class="align-center">
        <img class="w-64 h-64 r-64 cover" :src="restprofilephoto||'/OwnPlate-Favicon-Default.png'" />
      </div>

      <!-- Restaurant Name -->
      <div
        class="m-t-8 align-center t-h6 c-text-black-high"
      >{{ restaurantname || $t('editRestaurant.noRestaurant') }}</div>

      <!-- View Page -->
      <div class="m-t-8 align-center">
        <nuxt-link target="_blank" :to="'/r/' + restaurantid">
          <div class="op-button-text m-r-8">
            <i class="material-icons">launch</i>
            <span>{{$t('admin.viewPage')}}</span>
          </div>
        </nuxt-link>
        <!-- # Will have share button/popup here -->
      </div>

      <!-- # Will put a number of active orders here -->

      <!-- View Orders -->
      <div class="align-center m-t-16">
        <b-button
          tag="nuxt-link"
          :to="'/admin/restaurants/' + restaurantid + '/orders'"
          class="b-reset op-button-medium primary"
          style="min-width: 288px;"
        >
          <span
            class="c-onprimary p-l-24 p-r-24"
          >{{ $tc('admin.incompleteOrders', numberOfOrders, {count:numberOfOrders}) }}</span>
        </b-button>
      </div>

      <!-- Edit Menu -->
      <div class="align-center m-t-24">
        <b-button
          tag="nuxt-link"
          :to="'/admin/restaurants/' + restaurantid + '/menus'"
          style="min-width: 256px;"
          class="op-button-small secondary"
        >
          <span
            class="c-primary p-l-24 p-r-24"
          >{{ $t('admin.editMenuItems', {count:numberOfMenus})}}</span>
        </b-button>
      </div>

      <!-- Edit Restaurant Details -->
      <div class="align-center m-t-16">
        <nuxt-link :to="'/admin/restaurants/' + restaurantid">
          <div class="op-button-small secondary" style="min-width: 256px;">
            <span class="c-primary">{{$t('admin.editAbout')}}</span>
          </div>
        </nuxt-link>
      </div>

      <!-- QR code -->
      <div class="align-center m-t-16">
        <nuxt-link :to="`/admin/restaurants/${restaurantid}/qrcode`">
          <div class="op-button-small secondary" style="min-width: 256px;">
            <span class="c-primary">{{$t('admin.qrcode.title')}}</span>
          </div>
        </nuxt-link>
      </div>

      <!-- Delete Restaurant -->
      <div class="m-t-24 align-center">
        <div class="op-button-text c-status-red" @click="deleteRestaurant">
          <i class="material-icons">delete</i>
          <span>{{$t('admin.delete')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";

export default {
  name: "RestaurantEditCard",
  props: {
    restaurantid: {
      type: String,
      required: true
    },
    restprofilephoto: {
      type: String,
      required: true
    },
    restaurantname: {
      type: String,
      required: true
    },
    streetaddress: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    phonenumber: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: false,
      default: ""
    },
    tags: {
      type: Array,
      required: false,
      default: null
    },
    uid: {
      type: String,
      required: false,
      default: ""
    },
    defaulttaxrate: {
      type: Number,
      required: false,
      default: 0
    },
    publicflag: {
      type: Boolean,
      required: true
    },
    numberOfMenus: {
      type: Number,
      required: true
    },
    numberOfOrders: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      host: location.protocol + "//" + location.host,
      share_url:
        location.protocol + "//" + location.host + "/r/" + this.restaurantid
    };
  },
  methods: {
    deleteRestaurant() {
      console.log("deleteRestaurant");
      this.$store.commit("setAlert", {
        code: "editRestaurant.reallyDelete",
        callback: () => {
          console.log(this.restaurantid);
          db.doc(`restaurants/${this.restaurantid}`).update(
            "deletedFlag",
            true
          );
        }
      });
    }
  }
};
</script>

