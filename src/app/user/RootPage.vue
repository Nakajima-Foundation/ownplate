<template>
  <div>
    <!-- List Header Area -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24 m-t-24">
          <!-- Title -->
          <div class="t-h6 c-text-black-disabled m-t-24">{{$t("find.area")}}</div>
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
        <div class="m-l-24 m-r-16 m-t-16">
          <!-- Areas -->
          <div class="columns is-gapless is-multiline">
            <area-item :name="$t('find.areaAll')" :id="'all'" />

            <!-- v-for="area in areas" -->
            <area-item  v-for="area in areas" :name="area.name" :id="String(area.id)" />
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import { RestaurantHeader } from "~/plugins/header.js";
import AreaItem from "~/app/user/Restaurants/AreaItem";
import { ownPlateConfig } from "@/config/project";

export default {
  components: {
    AreaItem
  },
  data() {
    return {
      // # Need to rewrite for Areas instead of Restaurants.
      region: ownPlateConfig.region,
      restaurants: [],
      areas: ownPlateConfig.region == "JP" ? [
        { name: "東京", id: 12},
        { name: "福岡県", id: 39 }
      ] : [
        { name: "Washington", id: 46},
      ]
    };
  },
  head() {
    return RestaurantHeader;
  },
  // # Need to rewrite for Areas instead of Restaurants.
/*
  async created() {
    try {
      const res = await db
        .collection("restaurants")
        .where("publicFlag", "==", true)
        .where("deletedFlag", "==", false)
        .get();
      this.restaurants = (res.docs || []).map(doc => {
        const data = doc.data();
        data.id = doc.id;
        return data;
      });
      console.log(this.restaurants.length, this.restaurants);
    } catch (error) {
      console.log(error);
    }
  }
*/
};
</script>
