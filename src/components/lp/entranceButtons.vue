<template>
  <div class="mx-6 mt-6 text-center lg:grid lg:grid-cols-3 lg:gap-4">
    <!-- For Restaurants -->
    <entrance-buttons-restaurants />

    <!-- For Food Lovers -->
    <entrance-buttons-food-lovers />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import entranceButtonsRestaurants from "@/components/lp/entranceButtonsRestaurants.vue";
import entranceButtonsFoodLovers from "@/components/lp/entranceButtonsFoodLovers.vue";

export default defineComponent({
  components: {
    entranceButtonsRestaurants,
    entranceButtonsFoodLovers,
  },
});
</script>
