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
    }
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style lang="scss">
</style>
