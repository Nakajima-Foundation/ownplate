<template>
  <div>
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
    <div>
      <Map :restaurants="restaurants" v-if="restaurants.length > 0"/>
    </div>
  </div>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import { JPPrefecture, USStates } from "~/plugins/constant";
import { restaurant2AreaObj, sortRestaurantObj } from "./RestaurantUtils";
import Map from "~/components/Map";

export default {
  name: "RestaurantIndex",
  components: {
    Map,
  },
  data() {
    return {
      restaurants: [],
      restaurantsObj: {},
    };
  },
  async created() {
    const ownerUid = this.$route.params.ownerUid;
    const restaurantsCollection = await db.collection("restaurants")
          .where("publicFlag", "==", true)
          .where("deletedFlag", "==", false)
          .where("onTheList", "==", true)
          .where("uid", "==", ownerUid).get();
    this.restaurantsObj = restaurant2AreaObj(restaurantsCollection.docs);
    this.restaurants = restaurantsCollection.docs.map(this.doc2data(""));
    sortRestaurantObj(this.restaurantsObj);
  },
  computed: {
    allArea() {
      return JPPrefecture.concat(USStates);
    }
  },
}
</script>
