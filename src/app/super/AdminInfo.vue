<template>
  <section class="section">
    <back-button url="/s/admins" />
    <h2>Restaurants</h2>
    <div v-for="restaurant in restaurants" :key="restaurant.id">
      <restaurant :restaurant="restaurant"></restaurant>
    </div>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import Restaurant from "~/app/super/Components/Restaurant";
export default {
  components: {
    BackButton,
    Restaurant
  },
  data() {
    return {
      restaurants: []
    };
  },
  async mounted() {
    const snapshot = await db
      .collection("/restaurants/")
      .where("uid", "==", this.$route.params.adminId)
      .get();
    this.restaurants = snapshot.docs.map(this.doc2data("admin"));
    console.log(this.restaurants);
  }
};
</script>
