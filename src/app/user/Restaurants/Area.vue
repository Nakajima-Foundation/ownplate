<template>
  <div>
    <!-- List Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <!-- Link Button -->
          <nuxt-link :to="'/r'">
            <div class="op-button-pill bg-form">
              <i class="material-icons c-primary s-18">list</i>
              <span class="c-primary t-button">{{$t("find.areaTop")}}</span>
            </div>
          </nuxt-link>

          <!-- Title -->
          <div class="t-h6 c-text-black-disabled m-t-24">{{areaName}}</div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- List Body Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-16 m-t-24">
          <!-- Restaurants -->
          <div class="columns is-gapless is-multiline">
            <!-- Restaurant -->
            <div v-for="restaurant in restaurants" class="column is-one-third">
              <div class="h-full p-b-8 p-r-8">
                <router-link :to="`/r/${restaurant.id}`">
                  <div class="touchable h-full">
                    <div class="cols flex-center">
                      <!-- Restaurant Profile -->
                      <div class="m-r-16 h-48">
                        <img :src="resizedProfileImage(restaurant, '600')" class="w-48 h-48 r-48 cover" />
                      </div>

                      <!-- Restaurant Name -->
                      <div class="flex-1 p-r-8 t-subtitle1 c-primary">
                        {{
                        restaurant.restaurantName
                        }}
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { db, storage, firestore } from "~/plugins/firebase.js";

import { defaultHeader } from "../../../plugins/header";

export default {
  head() {
    return {
      title: [this.$tc("pageTitle.restaurantArea", 0, {area: this.areaName}), defaultHeader.title].join(" / "),
    };
  },
  data() {
    return {
      areaName: "",
      restaurants: []
    };
  },
  methods: {
    areaId() {
      return this.$route.params.areaId;
    }
  },
  async created() {
    this.areaName = this.regionalSetting.AddressStates[this.areaId()];
    if (this.areaName) {
      const res = await db
        .collection("restaurants")
        .where("publicFlag", "==", true)
        .where("deletedFlag", "==", false)
        .where("onTheList", "==", true)
        .where("state", "==", this.areaName)
        .get();
      this.restaurants = (res.docs || []).map(doc => {
        const data = doc.data();
        data.id = doc.id;
        return data;
      });
    }
  }
};
</script>
