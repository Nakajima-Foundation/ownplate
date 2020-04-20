<template>
  <section class="section">
    <h2 class="p-big bold">
      Restaurants
    </h2>
    <div v-for="restaurant in restaurants" class="card block" :key="restaurant.id">
      <div class="card-content">
        <router-link :to="`/r/${restaurant.id}`">
        {{ restaurant.restaurantName }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      restaurants:[]
    };
  },
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
    } catch(error) {
      console.log(error);
    }

  }

}
</script>
