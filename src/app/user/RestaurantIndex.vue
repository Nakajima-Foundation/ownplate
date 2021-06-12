<template>
  <div>
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
import { db } from "~/plugins/firebase.js";

export default {
  name: "RestaurantIndex",

  data() {
    return {
      restaurants: [],
    };
  },
  async created() {
    const ownerUid = this.$route.params.ownerUid;
    const restaurantsCollection = await db.collection("restaurants")
          .where("publicFlag", "==", true)
          .where("deletedFlag", "==", false)
          .where("onTheList", "==", true)
          .where("uid", "==", ownerUid).get();
    this.restaurants = restaurantsCollection.docs.map((a) => {
      const data = a.data();
      data.id = a.id;
      return data;
    }).sort((a, b) => {
      return a.restaurantName > b.restaurantName ? 1 : -1;
    });
  }
}
</script>
