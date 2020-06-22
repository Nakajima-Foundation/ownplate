<template>
  <section class="section">
    <back-button url="/s" />
    <h2>All Restaurants</h2>
    <table>
      <tr><td>nama</td><td>List</td><td>Pub</td><td>Del</td><td>Menu</td></tr>
      <tr
      v-for="restaurant in restaurants"
      :key="restaurant.id"
      >
        <td style="width: 50%">
          <router-link :to="`/r/${restaurant.id}`" v-if="restaurant.publicFlag && !restaurant.deletedFlag">
            {{restaurant.restaurantName}}
          </router-link>
          <span v-else>
            {{restaurant.restaurantName}}
          </span>
        </td>
        <td>
          {{restaurant.onTheList ? "Y":"N"}}
        </td>
        <td>
          {{restaurant.publicFlag  ? "Y":"N"}}
        </td>
        <td>
          {{restaurant.deletedFlag ? "Y":"N"}}
        </td>
        <td>
          {{(restaurant.menuLists||[]).length}}
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
import BackButton from "~/components/BackButton";
import { db } from "~/plugins/firebase.js";

export default {
  components: {
    BackButton
  },
  data() {
    return {
      restaurants: [],
      detacher: null
    };
  },
  async mounted() {
    if (!this.$store.state.user || this.$store.getters.isNotSuperAdmin) {
      this.$router.push("/");
    }
  },
  created() {
    this.detatcher = db
      .collection("restaurants")
      .limit(100)
      .orderBy("createdAt", "desc")
      .onSnapshot(snapshot => {
        this.restaurants = snapshot.docs.map(this.doc2data("resuatraut"));
        console.log(this.restaurants);
      });
  },
  destroyed() {
    this.detatcher && this.detatcher();
  },
  methods: {
  }
};
</script>
