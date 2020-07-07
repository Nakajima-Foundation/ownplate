<template>
  <section class="section">
    <back-button url="/s/admins" />
    <h1>Custome Claims</h1>
    <div>Admin: {{ customClaims.admin }}</div>
    <div>Operator: {{ customClaims.operator || false }}</div>
    <h1>Restaurants</h1>
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
      customClaims: {},
      restaurants: []
    };
  },
  computed: {
    adminId() {
      return this.$route.params.adminId;
    },
    superDispatch() {
      return functions.httpsCallable("superDispatch");
    }
  },
  async mounted() {
    const { data } = await this.superDispatch({
      cmd: "getCustomeClaims",
      uid: this.adminId
    });
    this.customClaims = data.result;
    const snapshot = await db
      .collection("/restaurants/")
      .where("uid", "==", this.adminId)
      .get();
    this.restaurants = snapshot.docs.map(this.doc2data("admin"));
    console.log(this.restaurants);
  }
};
</script>
