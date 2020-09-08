<template>
  <div>
    <div class="bg-surface r-8 d-low p-t-24 p-b-24 m-b-16">
      <!-- Restaurant Profile Photo -->
      <div class="align-center">
        <img
          class="w-64 h-64 r-64 cover"
          :src="resizedProfileImage(shopInfo, '600') || '/OwnPlate-Favicon-Default.png'"
        />
      </div>

      <!-- Restaurant Name -->
      <div
        class="m-t-8 align-center t-h6 c-text-black-high"
      >{{ shopInfo.restaurantName || $t("editRestaurant.noRestaurant") }}</div>

      <!-- View Page -->
      <div class="m-t-8 align-center">
        <nuxt-link target="_blank" :to="'/r/' + restaurantid">
          <div class="op-button-text">
            <i class="material-icons">launch</i>
            <span>{{ $t("admin.viewPage") }}</span>
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
          <span class="c-onprimary p-l-24 p-r-24">
            {{
            $tc("admin.incompleteOrders", numberOfOrders, {
            count: numberOfOrders
            })
            }}
          </span>
        </b-button>
      </div>

      <!-- Edit Menu -->
      <div class="align-center m-t-24">
        <!-- Menu Not Existing -->
        <div v-if="numberOfMenus == 0">
          <b-button
            tag="nuxt-link"
            :to="'/admin/restaurants/' + restaurantid + '/menus'"
            style="min-width: 256px; border-color: #b00020;"
            class="op-button-small secondary"
          >
            <span
              class="c-status-red p-l-24 p-r-24"
            >{{ $t("admin.editMenuItems", { count: numberOfMenus }) }}</span>
          </b-button>
          <div class="t-body2 c-status-red m-t-4">{{ $t("admin.pleaseAddMenu") }}</div>
        </div>

        <!-- Menu Existing -->
        <div v-else>
          <b-button
            tag="nuxt-link"
            :to="'/admin/restaurants/' + restaurantid + '/menus'"
            style="min-width: 256px;"
            class="op-button-small secondary"
          >
            <span
              class="c-primary p-l-24 p-r-24"
            >{{ $t("admin.editMenuItems", { count: numberOfMenus }) }}</span>
          </b-button>
        </div>
      </div>

      <!-- Edit Restaurant Details -->
      <div class="align-center m-t-16">
        <b-button
          tag="nuxt-link"
          :to="'/admin/restaurants/' + restaurantid"
          style="min-width: 256px;"
          class="b-reset op-button-small secondary"
        >
          <span class="c-primary">{{ $t("admin.editAbout") }}</span>
        </b-button>
      </div>

      <!-- QR code -->
      <div class="align-center m-t-16">
        <b-button
          tag="nuxt-link"
          :to="`/admin/restaurants/${restaurantid}/qrcode`"
          style="min-width: 256px;"
          class="b-reset op-button-small secondary"
        >
          <span class="c-primary">{{ $t("admin.qrcode.title") }}</span>
        </b-button>
      </div>

      <!-- Report Page -->
      <div class="align-center m-t-16">
        <b-button
          tag="nuxt-link"
          :to="`/admin/restaurants/${restaurantid}/report`"
          style="min-width: 256px;"
          class="b-reset op-button-small secondary"
        >
          <span class="c-primary">{{ $t("admin.report.title") }}</span>
        </b-button>
      </div>

      <div class="align-center m-t-16">

        <b-button
          tag="nuxt-link"
            :to="'/admin/restaurants/' + restaurantid"
            style="min-width: 256px;"
          :class="shopInfo.phoneCall ? 'op-button-small secondary' : 'op-button-small primary'"
          >
          <span :class="shopInfo.phoneCall ? 'c-onsecondary p-l-24 p-r-24' : 'c-onprimary p-l-24 p-r-24'">
            {{ $t("editRestaurant.phoneCallNotification") }} {{ shopInfo.phoneCall ? "ON" : "OFF" }}
          </span>
        </b-button>
      </div>
      <!-- Directory Request -->
      <div class="align-center m-t-16">
        <div class="t-subtitle2 c-text-black-disabled">{{ $t("admin.directory.status") }}</div>

        <!-- On Directory -->
        <div v-if="shopInfo.onTheList">
          <div class="m-t-8 c-status-green t-subtitle1">{{ $t("admin.directory.listed") }}</div>
          <b-button class="b-reset op-button-pill bg-form t-button m-t-16" @click="deleteFromList">
            <span class="t-button c-status-red">{{ $t("admin.directory.unlist") }}</span>
          </b-button>
        </div>

        <!-- Requested -->
        <div v-else-if="requestState==1">
          <div class="m-t-8 c-text-black-disabled t-subtitle1">{{ $t("admin.directory.waiting") }}</div>
          <b-button class="b-reset op-button-pill bg-form t-button m-t-16" @click="requestDelete">
            <span class="t-button c-status-red">{{ $t("admin.directory.cancelRequest") }}</span>
          </b-button>
        </div>

        <!-- Off Directory -->
        <div v-else="false">
          <div class="m-t-8 c-text-black-disabled t-subtitle1">{{ $t("admin.directory.notListed") }}</div>
          <b-button class="b-reset op-button-pill bg-form t-button m-t-16" @click="requestList">
            <span class="t-button c-primary">{{ $t("admin.directory.requestList") }}</span>
          </b-button>
        </div>
      </div>

      <!-- Delete Restaurant -->
      <div class="m-t-24 align-center">
        <div class="op-button-text c-status-red" @click="deleteRestaurant">
          <i class="material-icons">delete</i>
          <span>{{ $t("admin.delete") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import * as firebase from "firebase/app";

export default {
  name: "RestaurantEditCard",
  props: {
    shopInfo: {
      type: Object,
      required: true
    },
    restaurantid: {
      type: String,
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
        location.protocol + "//" + location.host + "/r/" + this.restaurantid,
      requestState: 0,
      detacher: null
    };
  },
  mounted() {
    this.detacher = db
      .doc(`requestList/${this.restaurantid}`)
      .onSnapshot(async result => {
        if (result.exists) {
          this.requestState = result.data().status;
        } else {
          this.requestState = 0;
        }
      });
  },
  destroyed() {
    this.detacher && this.detacher();
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
    },
    deleteFromList() {
      this.$store.commit("setAlert", {
        code: "editRestaurant.reallyOnListDelete",
        callback: () => {
          console.log(this.restaurantid);
          db.doc(`restaurants/${this.restaurantid}`).update("onTheList", false);
        }
      });
    },
    requestList() {
      db.doc(`requestList/${this.restaurantid}`).set({
        status: 1,
        uid: this.$store.getters.uidAdmin,
        created: firebase.firestore.FieldValue.serverTimestamp()
      });
    },
    requestDelete() {
      db.doc(`requestList/${this.restaurantid}`).delete();
    }
  }
};
</script>
