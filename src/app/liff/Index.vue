<template>
  <div>
    <div class="text-xl font-bold text-black text-opacity-40 mt-6 mx-6">
      {{ $t("find.areaAll") }}
    </div>
    <!-- Restaurants -->
    <div
      class="mt-2 mx-6 grid items-center grid-cols-1 gap-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div v-for="(restaurant, k) in restaurants">
        <router-link :to="`/liff/${liffIndexId}/r/${restaurant.id}`">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-full bg-black bg-opacity-10 mr-4">
              <img
                :src="resizedProfileImage(restaurant, '600')"
                class="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div class="flex-1 text-base font-bold pr-2">
              {{ restaurant.restaurantName }}
              <i
                class="material-icons align-middle"
                v-if="restaurant.enableDelivery"
              >
                delivery_dining
              </i>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
import { db } from "~/plugins/firebase.js";
import firebase from "firebase/compat/app";

export default {
  props: {
    config: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      restaurants: [],
    };
  },
  async created() {
    const collect = await db
      .collection("restaurants")
      .where(
        firebase.firestore.FieldPath.documentId(),
        "in",
        this.config.restaurants || []
      )
      .get();
    this.restaurants = collect.docs.map((a) => {
      const data = a.data();
      data.id = a.id;
      return data;
    });
  },
};
</script>
