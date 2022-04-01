<template>
  <div>
    <!-- Restaurants -->
    <div v-if="ownerData.name">
      <div class="grid grid-cols-1">
        <!-- Left -->
        <div>
          <!-- Cover Image -->
          <div>
            <img
              @click.stop="openImage()"
              :src="coverImage"
              class="h-48 w-full object-cover lg:rounded-lg"
            />
          </div>
        </div>
      </div>

      <!-- For Responsible  -->
      <div class="mx-6 lg:mx-0">
        <div class="mt-4">
          <div class="mt-2 text-center text-xl font-bold">
            {{ ownerData.name }}
          </div>
        </div>

        <div class="mt-2 text-base">
          {{ ownerData.description }}
        </div>
      </div>
    </div>
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
      <Map :restaurants="restaurants" v-if="restaurants.length > 0" />
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
  metaInfo() {
    return {
      title: [this.defaultTitle, "Restaurant Index"].join(" / "),
    };
  },
  components: {
    Map,
  },
  data() {
    return {
      restaurants: [],
      restaurantsObj: {},
      ownerData: {},
    };
  },
  async created() {
    const ownerUid = this.$route.params.ownerUid;
    const restaurantsCollection = await db
      .collection("restaurants")
      .where("publicFlag", "==", true)
      .where("deletedFlag", "==", false)
      .where("onTheList", "==", true)
      .where("uid", "==", ownerUid)
      .get();
    this.restaurantsObj = restaurant2AreaObj(restaurantsCollection.docs);
    this.restaurants = restaurantsCollection.docs.map(this.doc2data(""));
    sortRestaurantObj(this.restaurantsObj);

    const ownerDoc = await db.doc(`owners/${ownerUid}`).get();
    this.ownerData = ownerDoc.data() || {};
  },
  computed: {
    allArea() {
      return JPPrefecture.concat(USStates);
    },
    coverImage() {
      return (
        (this.ownerData?.images?.cover?.resizedImages || {})["1200"] ||
        this.ownerData.restCoverPhoto
      );
    },
  },
};
</script>
