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
      {{ $t("find.areaAll") }}
    </div>

    <!-- Restaurants -->
    <template v-for="state in allArea">
      <div v-if="restaurantsObj[state]">
        <div
          class="text-base font-bold text-black text-opacity-40 mt-6 mx-6 mb-2"
        >
          {{ state }}
        </div>
        <div
          class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div v-for="restaurant in restaurantsObj[state]">
            <router-link :to="`/r/${restaurant.id}`">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-black bg-opacity-10 mr-4">
                  <img
                    :src="resizedProfileImage(restaurant, '600')"
                    class="w-12 h-12 rounded-full cover"
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
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import { RestaurantHeader } from "~/plugins/header.js";
import { JPPrefecture, USStates } from "~/plugins/constant";

export default {
  components: {},
  data() {
    return {
      restaurantsObj: []
    };
  },
  computed: {
    allArea() {
      return JPPrefecture.concat(USStates);
    }
  },
  head() {
    return RestaurantHeader;
  },
  async created() {
    try {
      const res = await db
        .collection("restaurants")
        .where("publicFlag", "==", true)
        .where("deletedFlag", "==", false)
        .where("onTheList", "==", true)
        .get();
      this.restaurantsObj = (res.docs || []).reduce((tmp, doc) => {
        const data = doc.data();
        data.id = doc.id;
        if (!tmp[data.state]) {
          tmp[data.state] = [];
        }
        tmp[data.state].push(data);
        return tmp;
      }, {});
      console.log(this.restaurantsObj);
      // console.log(this.restaurants.length, this.restaurants);
    } catch (error) {
      console.log(error);
    }
  }
};
</script>
