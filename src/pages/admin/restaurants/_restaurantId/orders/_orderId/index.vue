<template>
  <section class="section" style="background-color:#fffafa">
    <back-button :url="'/admin/restaurants/' + restaurantId() + '/orders'" />
    <h2 class="p-big bold">
      Order
    </h2>
  </section>
  
</template>

<script>
import { db } from "~/plugins/firebase.js";
import BackButton from "~/components/BackButton";

export default {
  components: {
    BackButton
  },

  data() {
    return {
      shopInfo: {},
      menus: [],
      titles: [],
      detacher: [],
    };
  },
  created() {
    const restaurant_detacher = db.doc(`restaurants/${this.restaurantId()}`).onSnapshot((restaurant) => {
      if (restaurant.exists) {
        const restaurant_data = restaurant.data();
        this.shopInfo = restaurant_data;
      }
    });
    const menu_detacher = db.collection(`restaurants/${this.restaurantId()}/menus`).onSnapshot((menu) => {
      if (!menu.empty) {
        this.menus = menu.docs.map(this.doc2data("menu"));
      }
    });
    const title_detacher = db.collection(`restaurants/${this.restaurantId()}/titles`).onSnapshot((title) => {
      if (!title.empty) {
        this.titles = title.docs.map(this.doc2data("title"));
      }
    });
    this.detacher = [
      restaurant_detacher,
      menu_detacher,
      title_detacher,
    ];
  },
  destroyed() {
    this.detacher.map((detacher) => {
      detacher();
    });
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style lang="scss">
</style>
