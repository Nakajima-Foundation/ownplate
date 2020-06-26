<template>
  <section class="section">
    <back-button url="/s/admins" />
    <h2>Restaurants</h2>
    <div v-for="restaurant in restaurants" :key="restaurant.id">
      <shop-header :shopInfo="restaurant"></shop-header>
    </div>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";
import ShopHeader from "~/app/user/Restaurant/ShopHeader";
export default {
  components: {
    BackButton,
    ShopHeader
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
