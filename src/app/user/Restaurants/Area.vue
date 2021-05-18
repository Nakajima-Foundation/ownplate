<template>
  <div>
    <div class="mt-6 mx-6">
      <nuxt-link :to="'/r'">
        <div
          class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-lg text-op-teal mr-2">list</i>
          <span class="text-sm font-bold text-op-teal">{{
            $t("find.areaTop")
          }}</span>
        </div>
      </nuxt-link>
    </div>

    <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
      {{ areaName }}
    </div>

    <!-- Restaurants -->
    <div
      class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-for="restaurant in restaurants">
        <router-link :to="`/r/${restaurant.id}`">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-black bg-opacity-10 mr-4">
              <img
                :src="resizedProfileImage(restaurant, '600')"
                class="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div class="flex-1 text-base font-bold pr-2">
              {{ restaurant.restaurantName }}
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { db, storage, firestore } from "~/plugins/firebase.js";
import { defaultHeader } from "../../../plugins/header";

export default {
  head() {
    return {
      title: [
        this.$tc("pageTitle.restaurantArea", 0, { area: this.areaName }),
        defaultHeader.title
      ].join(" / ")
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
      }).sort((a, b) => {
        return a.restaurantName > b.restaurantName ? 1 : -1;
      });
    }
  }
};
</script>
