<template>
  <router-link :to="`/r/${restaurant.id}`">{{
    restaurant.restaurantName
  }}</router-link>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { RestaurantInfoData } from "@/models/RestaurantInfo";

export default defineComponent({
  props: {
    restaurant: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
  },
});
</script>
