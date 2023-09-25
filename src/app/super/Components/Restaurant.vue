<template>
  <router-link :to="`/r/${restaurant.id}`">{{
    restaurant.restaurantName
  }}</router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    restaurant: {
      type: Object,
      required: true,
    },
  },
});
</script>
