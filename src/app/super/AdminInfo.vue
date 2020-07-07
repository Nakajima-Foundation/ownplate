<template>
  <section class="section">
    <back-button url="/s/admins" />
    <h1>Admin Info</h1>
    <h4>Restaurants</h4>
    <div v-for="restaurant in restaurants" :key="restaurant.id">
      <restaurant :restaurant="restaurant"></restaurant>
    </div>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db, functions } from "~/plugins/firebase.js";
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
  computed: {
    superDispatch() {
      return functions.httpsCallable("superDispatch");
    }
  },
  async mounted() {
    const { data } = await this.superDispatch();
    console.log("***", data);
    const snapshot = await db
      .collection("/restaurants/")
      .where("uid", "==", this.$route.params.adminId)
      .get();
    this.restaurants = snapshot.docs.map(this.doc2data("admin"));
    console.log(this.restaurants);
  }
};
</script>
